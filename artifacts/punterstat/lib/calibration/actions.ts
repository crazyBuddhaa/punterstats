"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/helpers";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Marks a tracked prediction (from "Track This Prediction" on the Match
 * Breakdown Analyzer) with its real-world outcome once the match has been
 * played. This is what feeds the Calibration Engine — predictions without
 * an actual_result are excluded from Brier score / accuracy calculations.
 */
export async function resolvePrediction(
  predictionId: string,
  actualResult: "home_win" | "draw" | "away_win",
): Promise<ApiResponse<null>> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("prediction_records")
    .update({ actual_result: actualResult, resolved_at: new Date().toISOString() })
    .eq("id", predictionId)
    .eq("user_id", profile.userId);

  if (error) {
    return { success: false, error: "Could not save the result. Please try again." };
  }

  revalidatePath("/dashboard/calibration");
  return { success: true, data: null };
}
