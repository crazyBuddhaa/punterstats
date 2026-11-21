/**
 * Vercel Cron — Daily prediction resolution.
 *
 * Runs every day at 03:00 UTC (configured in vercel.json).
 *
 * Pipeline:
 *   1. Find prediction_records where actual_result IS NULL and
 *      match_date <= NOW() - 2 hours (match has finished)
 *   2. Look up the result in historical_matches (exact then fuzzy team name)
 *   3. Write actual_result + resolved_at so the Calibration Engine can score
 *
 * Protected by CRON_SECRET — Vercel sets the Authorization header
 * automatically when triggering cron routes.
 */

import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { resolveUnresolved } from "@/lib/predictions/resolver";
import { capturePendingClosingOdds } from "@/lib/bet-assist/closing-odds";
import { autoSettlePendingBets } from "@/lib/bet-assist/journal-actions";

export const maxDuration = 60;

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  // Run daily jobs with isolated error boundaries so one failure never blocks the others
  const [predictions, closingOdds, betSettlement] = await Promise.all([
    resolveUnresolved({ limit: 200 }).catch((err) => ({
      error: err instanceof Error ? err.message : "Prediction resolution failed",
    })),
    capturePendingClosingOdds(100).catch((err) => ({
      success: false,
      checked: 0,
      updated: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : "Closing odds capture failed",
    })),
    autoSettlePendingBets(true).catch((err) => ({
      success: false,
      error: err instanceof Error ? err.message : "Auto-settlement failed",
    })),
  ]);

  return NextResponse.json({
    ok: true,
    startedAt,
    completedAt: new Date().toISOString(),
    predictions,
    closingOdds,
    betSettlement,
  });
}
