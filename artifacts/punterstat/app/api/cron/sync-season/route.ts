/**
 * Vercel Cron — Weekly data sync.
 *
 * Runs every Monday at 06:00 UTC (configured in vercel.json).
 *
 * Pipeline:
 *   1. Fetch current + previous season CSVs from football-data.co.uk
 *   2. Archive raw CSVs to Cloudflare R2 (persistent backup)
 *   3. Parse and upsert rows into Supabase historical_matches + match_odds
 *
 * R2 archiving is non-blocking on the ingest step — if R2 is not configured,
 * the cron falls back to direct Supabase ingest (original behaviour).
 *
 * Protected by CRON_SECRET — Vercel sets the Authorization header
 * automatically when triggering cron routes.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseFDCsv, upsertMatchesAndOdds } from "@/lib/r2/csv-parser";
import { isR2Configured } from "@/lib/r2/client";
import { putFootballCsv, getManifest, putManifest, syncLogKey, putObject } from "@/lib/r2/dataset";
import { LEAGUE_MAP } from "@/lib/historical-stats/league-map";
import type { R2SyncLogEntry, R2SyncResult, R2IngestResult } from "@/lib/r2/types";

const FDCO_BASE = "https://www.football-data.co.uk/mmz4281";

const LEAGUES = [
  { code: "E0",  name: "Premier League" },
  { code: "SP1", name: "La Liga" },
  { code: "D1",  name: "Bundesliga" },
  { code: "I1",  name: "Serie A" },
  { code: "F1",  name: "Ligue 1" },
];

function currentSeasonCodes(): Array<{ code: string; label: string }> {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return [startYear - 1, startYear].map((y) => {
    const yy1 = String(y).slice(2).padStart(2, "0");
    const yy2 = String(y + 1).slice(2).padStart(2, "0");
    return { code: `${yy1}${yy2}`, label: `${y}/${String(y + 1).slice(2)}` };
  });
}

export async function GET(req: Request) {
  // Hard-fail when CRON_SECRET is not configured — never accept requests
  // against an undefined secret (would allow "Bearer undefined" to bypass auth).
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on this deployment." },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const runId     = `cron_${Date.now()}`;
  const r2Enabled = isR2Configured();
  const supabase  = createAdminClient();
  const seasons   = currentSeasonCodes();

  const syncResults:   R2SyncResult[]   = [];
  const ingestResults: R2IngestResult[] = [];

  for (const season of seasons) {
    for (const league of LEAGUES) {
      const url = `${FDCO_BASE}/${season.code}/${league.code}.csv`;

      let csv: string;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "PunterStat-Cron/1.0" },
          cache: "no-store",
        });
        if (!res.ok) {
          syncResults.push({
            leagueCode: league.code, seasonCode: season.code,
            seasonLabel: season.label, r2Key: null,
            rowCount: 0, fileSizeBytes: 0, success: false,
            error: `HTTP ${res.status}`,
          });
          continue;
        }
        csv = await res.text();
      } catch (err) {
        syncResults.push({
          leagueCode: league.code, seasonCode: season.code,
          seasonLabel: season.label, r2Key: null,
          rowCount: 0, fileSizeBytes: 0, success: false,
          error: err instanceof Error ? err.message : String(err),
        });
        continue;
      }

      const rows = parseFDCsv(csv);

      // ── Archive to R2 ──────────────────────────────────────────────────────
      let r2Key: string | null = null;
      if (r2Enabled && rows.length > 0) {
        try {
          r2Key = await putFootballCsv(league.code, season.code, csv);
        } catch {
          // R2 archive failure is non-fatal — continue to Supabase ingest
        }
      }

      syncResults.push({
        leagueCode: league.code, seasonCode: season.code,
        seasonLabel: season.label, r2Key,
        rowCount: rows.length,
        fileSizeBytes: Buffer.byteLength(csv, "utf8"),
        success: true,
      });

      // ── Ingest to Supabase ─────────────────────────────────────────────────
      if (rows.length === 0) continue;

      try {
        const leagueInfo = LEAGUE_MAP[league.code];
        const stats = await upsertMatchesAndOdds(
          rows,
          league.code,
          leagueInfo?.name ?? league.name,
          season.label,
          supabase
        );
        ingestResults.push({
          leagueCode: league.code, seasonCode: season.code,
          seasonLabel: season.label,
          matchesUpserted: stats.matchesUpserted,
          oddsUpserted: stats.oddsUpserted,
          success: true,
        });
      } catch (err) {
        ingestResults.push({
          leagueCode: league.code, seasonCode: season.code,
          seasonLabel: season.label,
          matchesUpserted: 0, oddsUpserted: 0, success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  const completedAt = new Date().toISOString();
  const totalMatchesUpserted = ingestResults.reduce((s, r) => s + r.matchesUpserted, 0);
  const totalOddsUpserted    = ingestResults.reduce((s, r) => s + r.oddsUpserted, 0);
  const errors = [
    ...syncResults.filter((r) => !r.success).map((r) => r.error ?? ""),
    ...ingestResults.filter((r) => !r.success).map((r) => r.error ?? ""),
  ].filter(Boolean);

  // ── Update R2 manifest + write sync log ─────────────────────────────────────
  if (r2Enabled) {
    try {
      const manifest = await getManifest();
      for (const r of syncResults.filter((r) => r.success && r.rowCount > 0)) {
        const info = LEAGUE_MAP[r.leagueCode];
        if (!manifest.leagues[r.leagueCode]) {
          manifest.leagues[r.leagueCode] = {
            code: r.leagueCode,
            name: info?.name ?? r.leagueCode,
            country: info?.country ?? "Unknown",
            seasons: [],
            lastSyncAt: null,
          };
        }
        const league = manifest.leagues[r.leagueCode];
        const idx = league.seasons.findIndex((s) => s.code === r.seasonCode);
        const meta = {
          code: r.seasonCode, label: r.seasonLabel,
          archivedAt: completedAt,
          rowCount: r.rowCount, fileSizeBytes: r.fileSizeBytes,
        };
        if (idx >= 0) league.seasons[idx] = meta;
        else league.seasons.push(meta);
        league.seasons.sort((a, b) => a.code.localeCompare(b.code));
        league.lastSyncAt = completedAt;
      }
      manifest.updatedAt = completedAt;
      await putManifest(manifest);

      const logEntry: R2SyncLogEntry = {
        runId, startedAt, completedAt, trigger: "cron",
        syncResults, ingestResults, totalMatchesUpserted, totalOddsUpserted, errors,
      };
      await putObject(syncLogKey(completedAt), JSON.stringify(logEntry, null, 2), "application/json");
    } catch {
      // Manifest/log write failure is non-fatal
    }
  }

  return NextResponse.json({
    ok: true,
    runId,
    r2Enabled,
    synced: syncResults.filter((r) => r.success).length,
    totalMatchesUpserted,
    totalOddsUpserted,
    errors: errors.length ? errors : undefined,
    at: completedAt,
  });
}
