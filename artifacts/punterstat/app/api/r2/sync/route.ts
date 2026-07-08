/**
 * POST /api/r2/sync
 *
 * Admin-triggered sync: fetches CSVs from football-data.co.uk and archives
 * them to Cloudflare R2. Optionally ingests into Supabase in the same request.
 *
 * Body (JSON):
 * {
 *   leagues?:    string[]   // e.g. ["E0","SP1"] — defaults to all SYNC_LEAGUES
 *   seasons?:    string[]   // e.g. ["2425"] — defaults to current+previous
 *   historical?: boolean    // true = backfill all seasons from fromYear
 *   fromYear?:   number     // e.g. 1993 — only used when historical=true
 *   force?:      boolean    // re-download even if already in R2
 *   ingest?:     boolean    // also upsert into Supabase after archiving (default true)
 * }
 *
 * Admin-only. Returns 503 when R2 is not configured.
 *
 * WARNING: historical=true with all leagues can take several minutes.
 * Run it from the admin panel or via a one-off cURL, not on a user request path.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { isR2Configured } from "@/lib/r2/client";
import { syncCurrentSeasons, syncAllHistorical } from "@/lib/r2/sync";
import { ingestOneSeason } from "@/lib/r2/ingest";
import { putObject, syncLogKey } from "@/lib/r2/dataset";
import type { R2SyncLogEntry } from "@/lib/r2/types";

export async function POST(req: NextRequest) {
  await requireAdmin();

  if (!isR2Configured()) {
    return NextResponse.json(
      { success: false, error: "Cloudflare R2 is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({})) as {
    leagues?: string[];
    seasons?: string[];
    historical?: boolean;
    fromYear?: number;
    force?: boolean;
    ingest?: boolean;
  };

  const shouldIngest = body.ingest !== false; // default true
  const startedAt = new Date().toISOString();
  const runId = `run_${Date.now()}`;

  try {
    // ── Sync step ────────────────────────────────────────────────────────────
    const syncResults = body.historical
      ? await syncAllHistorical({
          leagues: body.leagues,
          fromYear: body.fromYear,
          force: body.force,
        })
      : await syncCurrentSeasons({
          leagues: body.leagues,
          force: body.force,
        });

    // ── Ingest step (optional) ───────────────────────────────────────────────
    const ingestResults = [];
    if (shouldIngest) {
      const toIngest = syncResults.filter((r) => r.success && r.rowCount > 0);
      // Filter by explicit seasons if provided
      const filtered = body.seasons
        ? toIngest.filter((r) => body.seasons!.includes(r.seasonCode))
        : toIngest;

      for (const r of filtered) {
        const result = await ingestOneSeason(r.leagueCode, r.seasonCode);
        ingestResults.push(result);
      }
    }

    const completedAt = new Date().toISOString();
    const totalMatchesUpserted = ingestResults.reduce(
      (sum, r) => sum + r.matchesUpserted,
      0
    );
    const totalOddsUpserted = ingestResults.reduce(
      (sum, r) => sum + r.oddsUpserted,
      0
    );
    const errors = [
      ...syncResults.filter((r) => !r.success).map((r) => r.error ?? ""),
      ...ingestResults.filter((r) => !r.success).map((r) => r.error ?? ""),
    ].filter(Boolean);

    // ── Write sync log to R2 ─────────────────────────────────────────────────
    const logEntry: R2SyncLogEntry = {
      runId,
      startedAt,
      completedAt,
      trigger: "manual",
      syncResults,
      ingestResults,
      totalMatchesUpserted,
      totalOddsUpserted,
      errors,
    };
    await putObject(syncLogKey(completedAt), JSON.stringify(logEntry, null, 2), "application/json");

    return NextResponse.json({
      success: true,
      runId,
      startedAt,
      completedAt,
      synced: syncResults.filter((r) => r.success).length,
      ingested: ingestResults.filter((r) => r.success).length,
      totalMatchesUpserted,
      totalOddsUpserted,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
