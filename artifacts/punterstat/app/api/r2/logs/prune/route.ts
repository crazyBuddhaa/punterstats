/**
 * POST /api/r2/logs/prune
 *
 * Admin-only — delete old sync log files from R2, keeping only the most
 * recent N entries. Prevents unbounded growth of the sync-log/ prefix.
 *
 * Body (JSON, optional):
 *   keep — number of entries to retain (default 50, min 10, max 500)
 *
 * Returns:
 *   { kept, deleted, keys: string[] }
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { listObjects, deleteObject } from "@/lib/r2/dataset";
import { isR2Configured } from "@/lib/r2/client";

const LOG_PREFIX = "sync-log/";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
  }

  let keep = 50;
  try {
    const body = await req.json() as { keep?: number };
    if (typeof body.keep === "number") {
      keep = Math.min(Math.max(10, body.keep), 500);
    }
  } catch {
    // Body is optional — proceed with default
  }

  try {
    const keys = await listObjects(LOG_PREFIX);
    const sorted = keys
      .filter((k) => k.endsWith(".json"))
      .sort() // ISO timestamps sort chronologically
      .reverse();

    const toDelete = sorted.slice(keep);

    // Delete in parallel — R2 DeleteObject is idempotent
    await Promise.all(toDelete.map((key) => deleteObject(key)));

    return NextResponse.json({
      success: true,
      kept:    Math.min(sorted.length, keep),
      deleted: toDelete.length,
      keys:    toDelete,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/r2/logs/prune]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
