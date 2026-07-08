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
import { resolveUnresolved } from "@/lib/predictions/resolver";

export async function GET(req: Request) {
  // Hard-fail when CRON_SECRET is not configured — never accept an undefined
  // secret (that would allow "Bearer undefined" to bypass auth).
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

  try {
    const result = await resolveUnresolved({ limit: 200 });

    return NextResponse.json({
      ok: true,
      startedAt,
      completedAt: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/resolve-predictions]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
