/**
 * GET /api/r2/manifest
 *
 * Returns the R2 manifest.json — the live index of every league and season
 * archived in the Cloudflare R2 bucket.
 *
 * Admin-only. Returns 503 when R2 is not configured.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { getManifest } from "@/lib/r2/dataset";
import { isR2Configured } from "@/lib/r2/client";

export async function GET() {
  await requireAdmin();

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Cloudflare R2 is not configured. " +
          "Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, " +
          "CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET_NAME.",
      },
      { status: 503 }
    );
  }

  try {
    const manifest = await getManifest();
    return NextResponse.json({ success: true, data: manifest });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
