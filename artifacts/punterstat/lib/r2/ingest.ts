/**
 * Cloudflare R2 → Supabase ingest.
 *
 * Reads archived CSVs from R2 and upserts them into the
 * historical_matches + match_odds tables in Supabase.
 *
 * This is intentionally decoupled from the sync step (lib/r2/sync.ts):
 *   1. sync.ts  — fetches from football-data.co.uk → writes raw CSV to R2
 *   2. ingest.ts — reads raw CSV from R2 → parses → upserts to Supabase
 *
 * Keeping them separate means:
 *   - Supabase can be re-populated from R2 at any time without re-fetching
 *   - The R2 archive is the canonical raw-data source; Supabase is derived
 */

import { getFootballCsv, listArchivedSeasons } from "./dataset";
import { parseFDCsv, upsertMatchesAndOdds } from "./csv-parser";
import {
  seasonCodeToLabel,
  syncCurrentSeasons,
  syncAllHistorical,
  SYNC_LEAGUES,
} from "./sync";
import { createAdminClient } from "@/lib/supabase/admin";
import type { R2IngestResult, R2SyncResult } from "./types";

// ── Single-season ingest ──────────────────────────────────────────────────────

/**
 * Read one archived CSV from R2 and upsert its rows to Supabase.
 */
export async function ingestOneSeason(
  leagueCode: string,
  seasonCode: string
): Promise<R2IngestResult> {
  const seasonLabel = seasonCodeToLabel(seasonCode);
  const leagueInfo  = SYNC_LEAGUES.find((l) => l.code === leagueCode);
  const leagueName  = leagueInfo?.name ?? leagueCode;

  let csv: string | null;
  try {
    csv = await getFootballCsv(leagueCode, seasonCode);
  } catch (err) {
    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      matchesUpserted: 0,
      oddsUpserted: 0,
      success: false,
      error: `R2 read failed for ${leagueCode}/${seasonCode}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!csv) {
    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      matchesUpserted: 0,
      oddsUpserted: 0,
      success: false,
      error: `No R2 archive found for ${leagueCode}/${seasonCode}. Run sync first.`,
    };
  }

  try {
    const rows = parseFDCsv(csv);
    if (rows.length === 0) {
      return {
        leagueCode,
        seasonCode,
        seasonLabel,
        matchesUpserted: 0,
        oddsUpserted: 0,
        success: true,
      };
    }

    const supabase = createAdminClient();
    const stats = await upsertMatchesAndOdds(
      rows,
      leagueCode,
      leagueName,
      seasonLabel,
      supabase
    );

    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      matchesUpserted: stats.matchesUpserted,
      oddsUpserted: stats.oddsUpserted,
      success: true,
    };
  } catch (err) {
    return {
      leagueCode,
      seasonCode,
      seasonLabel,
      matchesUpserted: 0,
      oddsUpserted: 0,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Bulk ingest ───────────────────────────────────────────────────────────────

/**
 * Ingest all archived seasons for one or more leagues from R2 into Supabase.
 *
 * @param options.leagueCodes  Subset of league codes to ingest. Defaults to all SYNC_LEAGUES.
 * @param options.seasonCodes  Subset of season codes to ingest. Defaults to all archived seasons.
 */
export async function ingestFromR2(options: {
  leagueCodes?: string[];
  seasonCodes?: string[];
} = {}): Promise<R2IngestResult[]> {
  const leagues = options.leagueCodes
    ? SYNC_LEAGUES.filter((l) => options.leagueCodes!.includes(l.code))
    : SYNC_LEAGUES;

  const results: R2IngestResult[] = [];

  for (const league of leagues) {
    const archivedSeasons = await listArchivedSeasons(league.code);
    const toIngest = options.seasonCodes
      ? archivedSeasons.filter((s) => options.seasonCodes!.includes(s))
      : archivedSeasons;

    for (const seasonCode of toIngest) {
      const result = await ingestOneSeason(league.code, seasonCode);
      results.push(result);
    }
  }

  return results;
}

// ── Combined sync + ingest ────────────────────────────────────────────────────

export interface SyncAndIngestResult {
  syncResults: R2SyncResult[];
  ingestResults: R2IngestResult[];
}

/**
 * Convenience helper: sync from football-data.co.uk → R2, then immediately
 * ingest from R2 → Supabase.
 *
 * Used by the Vercel cron and the admin manual-sync endpoint.
 */
export async function syncAndIngest(options: {
  leagueCodes?: string[];
  seasonCodes?: string[];
  historical?: boolean;
  fromYear?: number;
  force?: boolean;
}): Promise<SyncAndIngestResult> {
  const syncResults: R2SyncResult[] = options.historical
    ? await syncAllHistorical({
        leagues: options.leagueCodes,
        fromYear: options.fromYear,
        force: options.force,
      })
    : await syncCurrentSeasons({
        leagues: options.leagueCodes,
        force: options.force,
      });

  // Only ingest seasons that were successfully synced
  const toIngest = syncResults.filter((r) => r.success && r.rowCount > 0);

  // Filter by explicit seasons if provided
  const filtered = options.seasonCodes
    ? toIngest.filter((r) => options.seasonCodes!.includes(r.seasonCode))
    : toIngest;

  const ingestResults: R2IngestResult[] = [];
  for (const r of filtered) {
    const result = await ingestOneSeason(r.leagueCode, r.seasonCode);
    ingestResults.push(result);
  }

  return { syncResults, ingestResults };
}
