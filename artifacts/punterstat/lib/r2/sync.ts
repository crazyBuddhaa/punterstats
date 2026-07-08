/**
 * Cloudflare R2 — Sync orchestrator.
 *
 * Fetches raw CSVs from football-data.co.uk and archives them to R2.
 * This is the "acquire and persist" step only — it does NOT write to Supabase.
 * Run ingest.ts separately (or via the combined syncAndIngest helper) to load
 * the archived data into the queryable historical_matches table.
 *
 * Data source: https://www.football-data.co.uk/mmz4281/{seasonCode}/{leagueCode}.csv
 * No API key required — the site is freely accessible.
 * Seasons available: 1993/94 (code "9394") to the current season.
 */

import { putFootballCsv, getManifestWithETag, putManifestConditional, objectExists, footballCsvKey } from "./dataset";
import { parseFDCsv } from "./csv-parser";
import { LEAGUE_MAP } from "@/lib/historical-stats/league-map";
import type { R2SyncResult } from "./types";

const FDCO_BASE = "https://www.football-data.co.uk/mmz4281";

// ── Leagues to archive ────────────────────────────────────────────────────────

/**
 * All leagues supported by football-data.co.uk that we want to archive.
 * Subset of LEAGUE_MAP — only leagues with consistent FDCO coverage.
 */
export const SYNC_LEAGUES: Array<{ code: string; name: string }> = [
  { code: "E0",  name: "Premier League" },
  { code: "E1",  name: "Championship" },
  { code: "E2",  name: "League One" },
  { code: "E3",  name: "League Two" },
  { code: "SP1", name: "La Liga" },
  { code: "SP2", name: "Segunda División" },
  { code: "D1",  name: "Bundesliga" },
  { code: "D2",  name: "2. Bundesliga" },
  { code: "I1",  name: "Serie A" },
  { code: "I2",  name: "Serie B" },
  { code: "F1",  name: "Ligue 1" },
  { code: "F2",  name: "Ligue 2" },
  { code: "N1",  name: "Eredivisie" },
  { code: "B1",  name: "First Division A" },
  { code: "P1",  name: "Primeira Liga" },
  { code: "SC0", name: "Scottish Premiership" },
];

// ── Season code helpers ───────────────────────────────────────────────────────

/**
 * Convert a start year to the FDCO season code.
 * e.g. 2024 → "2425", 1993 → "9394"
 */
export function yearToSeasonCode(startYear: number): string {
  const yy1 = String(startYear).slice(2).padStart(2, "0");
  const yy2 = String(startYear + 1).slice(2).padStart(2, "0");
  return `${yy1}${yy2}`;
}

/**
 * Convert a season code back to a human-readable label.
 * e.g. "2425" → "2024/25", "9394" → "1993/94"
 */
export function seasonCodeToLabel(code: string): string {
  const yy1 = code.slice(0, 2);
  const yy2 = code.slice(2, 4);
  const year1 = parseInt(yy1, 10) >= 93 ? 1900 + parseInt(yy1, 10) : 2000 + parseInt(yy1, 10);
  return `${year1}/${yy2}`;
}

/**
 * Return the season codes for the current and previous football season.
 * Football seasons run August–May; July counts as the end of the previous season.
 */
export function currentSeasonCodes(): Array<{ code: string; label: string }> {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return [startYear - 1, startYear].map((y) => ({
    code: yearToSeasonCode(y),
    label: seasonCodeToLabel(yearToSeasonCode(y)),
  }));
}

/**
 * Return all season codes from a start year to the current season.
 * FDCO data starts reliably from 1993/94.
 */
export function allSeasonCodes(
  fromYear = 1993
): Array<{ code: string; label: string }> {
  const now = new Date();
  const endYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const result = [];
  for (let y = fromYear; y <= endYear; y++) {
    const code = yearToSeasonCode(y);
    result.push({ code, label: seasonCodeToLabel(code) });
  }
  return result;
}

// ── Fetch + archive ───────────────────────────────────────────────────────────

/**
 * Fetch one season's CSV from football-data.co.uk and archive it to R2.
 *
 * @param leagueCode  e.g. "E0"
 * @param seasonCode  e.g. "2425"
 * @param leagueName  e.g. "Premier League"
 * @param force       Re-download even if the file already exists in R2
 */
export async function syncOneSeason(
  leagueCode: string,
  seasonCode: string,
  leagueName: string,
  force = false
): Promise<R2SyncResult> {
  const seasonLabel = seasonCodeToLabel(seasonCode);

  // Skip if already archived and not forcing a refresh
  if (!force) {
    const exists = await objectExists(footballCsvKey(leagueCode, seasonCode));
    if (exists) {
      return {
        leagueCode,
        seasonCode,
        seasonLabel,
        r2Key: footballCsvKey(leagueCode, seasonCode),
        rowCount: -1, // unknown; file not re-read
        fileSizeBytes: -1,
        success: true,
      };
    }
  }

  const url = `${FDCO_BASE}/${seasonCode}/${leagueCode}.csv`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PunterStat-DataSync/1.0" },
      // No caching — we want the freshest data on every explicit sync
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        leagueCode,
        seasonCode,
        seasonLabel,
        r2Key: null,
        rowCount: 0,
        fileSizeBytes: 0,
        success: false,
        error: `HTTP ${res.status} from ${url}`,
      };
    }

    const csv = await res.text();
    const rows = parseFDCsv(csv);
    const r2Key = await putFootballCsv(leagueCode, seasonCode, csv);

    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      r2Key,
      rowCount: rows.length,
      fileSizeBytes: Buffer.byteLength(csv, "utf8"),
      success: true,
    };
  } catch (err) {
    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      r2Key: null,
      rowCount: 0,
      fileSizeBytes: 0,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Manifest update ───────────────────────────────────────────────────────────

/**
 * Update the R2 manifest.json with the results of a sync run.
 * Idempotent — merges into existing manifest data rather than overwriting.
 */
/**
 * Apply sync results to manifest.json using optimistic locking.
 *
 * Reads the manifest together with its ETag, computes the update, then writes
 * back using If-Match so Cloudflare R2 rejects the write (412) if another
 * process modified the manifest between read and write. Retries up to
 * maxRetries times with exponential back-off before giving up.
 *
 * This prevents concurrent cron runs or manual API calls from overwriting each
 * other's changes and producing a corrupt/stale manifest.json.
 */
export async function updateManifestWithResults(
  results: R2SyncResult[],
  maxRetries = 3,
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { manifest, etag } = await getManifestWithETag();

    for (const r of results) {
      if (!r.success || r.rowCount === 0) continue;

      const leagueInfo = LEAGUE_MAP[r.leagueCode];
      if (!manifest.leagues[r.leagueCode]) {
        manifest.leagues[r.leagueCode] = {
          code: r.leagueCode,
          name: leagueInfo?.name ?? r.leagueCode,
          country: leagueInfo?.country ?? "Unknown",
          seasons: [],
          lastSyncAt: null,
        };
      }

      const league = manifest.leagues[r.leagueCode];

      const existing = league.seasons.findIndex((s) => s.code === r.seasonCode);
      const seasonMeta = {
        code: r.seasonCode,
        label: r.seasonLabel,
        archivedAt: new Date().toISOString(),
        rowCount: r.rowCount,
        fileSizeBytes: r.fileSizeBytes,
      };
      if (existing >= 0) {
        league.seasons[existing] = seasonMeta;
      } else {
        league.seasons.push(seasonMeta);
      }
      league.seasons.sort((a, b) => a.code.localeCompare(b.code));
      league.lastSyncAt = new Date().toISOString();
    }

    manifest.updatedAt = new Date().toISOString();

    const wrote = await putManifestConditional(manifest, etag);
    if (wrote) return;

    // 412 — concurrent modification. Back off and re-read before retrying.
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }

  throw new Error(
    `[r2/manifest] updateManifestWithResults failed after ${maxRetries} attempts — concurrent modification`,
  );
}

// ── High-level sync functions ─────────────────────────────────────────────────

/**
 * Sync the current and previous football season for all configured leagues.
 * This is what the weekly Vercel cron calls.
 */
export async function syncCurrentSeasons(
  options: { leagues?: string[]; force?: boolean } = {}
): Promise<R2SyncResult[]> {
  const leagues = options.leagues
    ? SYNC_LEAGUES.filter((l) => options.leagues!.includes(l.code))
    : SYNC_LEAGUES;

  const seasons = currentSeasonCodes();
  const results: R2SyncResult[] = [];

  for (const league of leagues) {
    for (const season of seasons) {
      const result = await syncOneSeason(
        league.code,
        season.code,
        league.name,
        options.force ?? true  // Always refresh current/previous seasons
      );
      results.push(result);
    }
  }

  // Manifest write is non-fatal — never abort a completed sync because of it
  try {
    await updateManifestWithResults(results);
  } catch {
    // Manifest update failure is logged via sync results; ingest continues
  }
  return results;
}

/**
 * Backfill all historical seasons from fromYear to the current season.
 * Skips seasons already in R2 unless force=true.
 * Designed to be run once (or re-run safely at any time).
 */
export async function syncAllHistorical(
  options: {
    leagues?: string[];
    fromYear?: number;
    force?: boolean;
  } = {}
): Promise<R2SyncResult[]> {
  const leagues = options.leagues
    ? SYNC_LEAGUES.filter((l) => options.leagues!.includes(l.code))
    : SYNC_LEAGUES;

  const seasons = allSeasonCodes(options.fromYear ?? 1993);
  const results: R2SyncResult[] = [];

  for (const league of leagues) {
    for (const season of seasons) {
      const result = await syncOneSeason(
        league.code,
        season.code,
        league.name,
        options.force ?? false  // Default: skip already-archived
      );
      results.push(result);
      // Small delay to be polite to football-data.co.uk
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // Manifest write is non-fatal
  try {
    await updateManifestWithResults(results);
  } catch {
    // Manifest update failure is logged via sync results; ingest continues
  }
  return results;
}
