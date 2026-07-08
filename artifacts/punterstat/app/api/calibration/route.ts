import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { getResolvedPredictions } from "@/lib/dashboard/queries";
import { scoreCalibration } from "@/lib/calibration/scorer";

/**
 * Returns the current user's calibration summary (Brier score, accuracy,
 * reliability curve) computed from their resolved prediction_records rows.
 * Predictions without an actual_result yet are excluded automatically.
 */
export async function GET() {
  const profile = await requireAuth();
  const resolved = await getResolvedPredictions(profile.userId);
  const summary = scoreCalibration(resolved);
  return NextResponse.json({ success: true, data: summary });
}
