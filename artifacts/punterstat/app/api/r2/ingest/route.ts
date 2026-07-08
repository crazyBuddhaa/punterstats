/**
 * POST /api/r2/ingest
 *
 * Admin-triggered ingest: reads archived CSVs from R2 and upserts them into
 * Supabase (historical_matches + match_odds). Does NOT re-fetch from
 * football-data.co.uk — the data must already be in R2.
 *
 * Use this to:
 *   - Re-populate Supabase after a schema migration
 *   - Load a specific league/season without triggering a full sync
 *   - Recover from a partial ingest failure
 *
 * Body (JSON):
 * {
 *   leagues?:  string[]  // e.g. ["E0","D1"] — defaults to all archived leagues
 *   seasons?:  string[]  // e.g. ["2324","2425"] — defaults to all archived seasons
 * }
 *
 * Admin-only. Returns 503 when R2 is not configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { isR2Configured } from "@/lib/r2/client";
import { ingestFromR2 } from "@/lib/r2/ingest";

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
  };

  const startedAt = new Date().toISOString();

  try {
    const results = await ingestFromR2({
      leagueCodes: body.leagues,
      seasonCodes: body.seasons,
    });

    const succeeded = results.filter((r) => r.success);
    const failed    = results.filter((r) => !r.success);
    const totalMatchesUpserted = succeeded.reduce((s, r) => s + r.matchesUpserted, 0);
    const totalOddsUpserted    = succeeded.reduce((s, r) => s + r.oddsUpserted,    0);

    return NextResponse.json({
      success: true,
      startedAt,
      completedAt: new Date().toISOString(),
      total: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
      totalMatchesUpserted,
      totalOddsUpserted,
      errors: failed.map((r) => ({
        league: r.leagueCode,
        season: r.seasonCode,
        error: r.error,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
