/**
 * Vercel Cron / Standalone Endpoint — Weekly Betting Report Card email ("Your week in numbers").
 *
 * Also invoked automatically by the Monday /api/cron/sync-season job (06:00 UTC)
 * so Vercel Hobby's 2-cron limit is respected.
 * Protected by CRON_SECRET using the hard-fail bearer token check.
 */

import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { runWeeklyReportJob } from "@/lib/report-card/weekly-report";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWeeklyReportJob();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/weekly-report]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
