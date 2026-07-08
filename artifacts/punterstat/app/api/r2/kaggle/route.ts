/**
 * POST /api/r2/kaggle
 *
 * Downloads the international football results dataset from Kaggle,
 * archives all three CSVs to R2, and ingests them into Supabase.
 *
 * Pipeline:
 *   1. Download results.csv, goalscorers.csv, shootouts.csv from Kaggle API
 *   2. Archive each file to R2 under international/
 *   3. Parse and upsert into international_matches, international_goalscorers,
 *      international_shootouts
 *
 * Body (JSON) — all optional:
 * {
 *   skipDownload?: boolean  // re-ingest from existing R2 archive; skip Kaggle call
 *   skipIngest?:  boolean  // archive to R2 only; skip Supabase upsert
 * }
 *
 * GET /api/r2/kaggle — check archive status without triggering a download.
 *
 * Admin-only. Returns 503 when Kaggle or R2 is not configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { isR2Configured } from "@/lib/r2/client";
import { isKaggleConfigured, downloadInternationalDataset } from "@/lib/r2/kaggle";
import { putObject, getObject } from "@/lib/r2/dataset";
import { upsertInternationalData } from "@/lib/r2/sources/international-parser";
import { createAdminClient } from "@/lib/supabase/admin";

const R2_RESULTS     = "international/results.csv";
const R2_GOALSCORERS = "international/goalscorers.csv";
const R2_SHOOTOUTS   = "international/shootouts.csv";
const R2_META        = "international/meta.json";

export async function POST(req: NextRequest) {
  await requireAdmin();

  if (!isR2Configured()) {
    return NextResponse.json(
      { success: false, error: "Cloudflare R2 is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({})) as {
    skipDownload?: boolean;
    skipIngest?:  boolean;
  };

  const startedAt = new Date().toISOString();
  let results = "", goalscorers = "", shootouts = "";

  // ── Step 1: Acquire CSVs ───────────────────────────────────────────────────
  if (body.skipDownload) {
    const [r, g, s] = await Promise.all([
      getObject(R2_RESULTS),
      getObject(R2_GOALSCORERS),
      getObject(R2_SHOOTOUTS),
    ]);
    if (!r) {
      return NextResponse.json(
        { success: false, error: "No R2 archive found. Run without skipDownload first." },
        { status: 404 }
      );
    }
    results = r; goalscorers = g ?? ""; shootouts = s ?? "";
  } else {
    if (!isKaggleConfigured()) {
      return NextResponse.json(
        { success: false, error: "Set KAGGLE_USERNAME and KAGGLE_KEY environment variables." },
        { status: 503 }
      );
    }
    try {
      const dl = await downloadInternationalDataset();
      results = dl.results; goalscorers = dl.goalscorers; shootouts = dl.shootouts;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: `Kaggle download failed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 }
      );
    }

    // ── Step 2: Archive to R2 ────────────────────────────────────────────────
    await Promise.allSettled([
      results     ? putObject(R2_RESULTS,     results,     "text/csv") : null,
      goalscorers ? putObject(R2_GOALSCORERS, goalscorers, "text/csv") : null,
      shootouts   ? putObject(R2_SHOOTOUTS,   shootouts,   "text/csv") : null,
    ]);
  }

  // ── Step 3: Ingest into Supabase ───────────────────────────────────────────
  let matchesUpserted = 0, goalscorersUpserted = 0, shootoutsUpserted = 0;

  if (!body.skipIngest && results) {
    try {
      const stats = await upsertInternationalData(
        results, goalscorers, shootouts,
        createAdminClient()
      );
      matchesUpserted     = stats.matchesUpserted;
      goalscorersUpserted = stats.goalscorersUpserted;
      shootoutsUpserted   = stats.shootoutsUpserted;
    } catch (err) {
      return NextResponse.json(
        { success: false, archived: !body.skipDownload, error: `Supabase ingest failed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 500 }
      );
    }
  }

  const completedAt = new Date().toISOString();

  await putObject(R2_META, JSON.stringify({
    downloadedAt:       body.skipDownload ? null : completedAt,
    ingestedAt:         body.skipIngest   ? null : completedAt,
    matchesUpserted,
    goalscorersUpserted,
    shootoutsUpserted,
  }, null, 2), "application/json").catch(() => {/* non-fatal */});

  return NextResponse.json({
    success: true,
    startedAt,
    completedAt,
    archived:           !body.skipDownload,
    matchesUpserted,
    goalscorersUpserted,
    shootoutsUpserted,
  });
}

/** GET — check R2 archive status without triggering a download */
export async function GET() {
  await requireAdmin();

  if (!isR2Configured()) {
    return NextResponse.json({ success: false, error: "R2 not configured." }, { status: 503 });
  }

  const [meta, hasResults, hasGoalscorers, hasShootouts] = await Promise.all([
    getObject(R2_META).catch(() => null),
    getObject(R2_RESULTS).then((v) => !!v).catch(() => false),
    getObject(R2_GOALSCORERS).then((v) => !!v).catch(() => false),
    getObject(R2_SHOOTOUTS).then((v) => !!v).catch(() => false),
  ]);

  return NextResponse.json({
    success: true,
    kaggleConfigured: isKaggleConfigured(),
    r2Archive: { hasResults, hasGoalscorers, hasShootouts },
    meta: meta ? JSON.parse(meta) : null,
  });
}
