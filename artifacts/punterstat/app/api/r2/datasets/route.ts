/**
 * GET /api/r2/datasets
 *
 * Public-facing summary of available datasets in R2.
 * Returns league names, available seasons, and row counts.
 * Does NOT require admin — safe to show on public pages as data coverage info.
 *
 * Returns 503 when R2 is not configured.
 */

import { NextResponse } from "next/server";
import { getManifest } from "@/lib/r2/dataset";
import { isR2Configured } from "@/lib/r2/client";

export async function GET() {
  if (!isR2Configured()) {
    return NextResponse.json(
      { success: false, configured: false, leagues: [] },
      { status: 503 }
    );
  }

  try {
    const manifest = await getManifest();

    const leagues = Object.values(manifest.leagues).map((l) => ({
      code: l.code,
      name: l.name,
      country: l.country,
      seasonCount: l.seasons.length,
      totalRows: l.seasons.reduce((sum, s) => sum + (s.rowCount ?? 0), 0),
      earliestSeason: l.seasons[0]?.label ?? null,
      latestSeason: l.seasons[l.seasons.length - 1]?.label ?? null,
      lastSyncAt: l.lastSyncAt,
    }));

    return NextResponse.json({
      success: true,
      updatedAt: manifest.updatedAt,
      leagues,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
