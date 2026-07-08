/**
 * GET /api/r2/logs
 *
 * Admin-only — list and read R2 sync log entries.
 *
 * Query params:
 *   limit   — max number of log entries to list (default 20, max 100)
 *   runId   — if provided, return the full JSON for a single run
 *
 * Without runId: returns a summary list (runId, trigger, startedAt,
 * completedAt, synced, upserted, errors) sorted newest-first.
 *
 * With runId: returns the full R2SyncLogEntry for that run.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { listObjects, getObject } from "@/lib/r2/dataset";
import { isR2Configured } from "@/lib/r2/client";
import type { R2SyncLogEntry } from "@/lib/r2/types";

const LOG_PREFIX = "sync-log/";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { success: false, configured: false, logs: [] },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 100);
  const runId = searchParams.get("runId");

  try {
    if (runId) {
      // Reconstruct the key — runId is the ISO timestamp with colons replaced
      const key = `${LOG_PREFIX}${runId}.json`;
      const raw = await getObject(key);
      if (!raw) {
        return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
      }
      const entry = JSON.parse(raw) as R2SyncLogEntry;
      return NextResponse.json({ success: true, entry });
    }

    // List all log keys, take the last `limit` sorted by key (ISO timestamp)
    const keys = await listObjects(LOG_PREFIX);
    // Keys are "sync-log/<ISO-with-dashes>.json" — lexicographic = chronological
    const sorted = keys
      .filter((k) => k.endsWith(".json"))
      .sort()
      .reverse()
      .slice(0, limit);

    // Fetch all summaries in parallel
    const summaries = await Promise.all(
      sorted.map(async (key) => {
        const raw = await getObject(key);
        if (!raw) return null;
        try {
          const e = JSON.parse(raw) as R2SyncLogEntry;
          return {
            runId:                e.runId,
            trigger:              e.trigger,
            startedAt:            e.startedAt,
            completedAt:          e.completedAt,
            totalSynced:          e.syncResults.filter((r) => r.success).length,
            totalFailed:          e.syncResults.filter((r) => !r.success).length,
            totalMatchesUpserted: e.totalMatchesUpserted,
            totalOddsUpserted:    e.totalOddsUpserted,
            errorCount:           e.errors.length,
            errors:               e.errors.slice(0, 3), // first 3 for the summary
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: summaries.filter(Boolean).length,
      logs: summaries.filter(Boolean),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/r2/logs]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
