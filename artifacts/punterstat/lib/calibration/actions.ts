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

/**
 * Logs a manual 1X2 probability forecast directly from the Calibration Engine
 * without requiring the full 6-step Match Breakdown wizard.
 */
export async function logManualPrediction(input: {
  homeTeam: string;
  awayTeam: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
}): Promise<ApiResponse<{ id: string }>> {
  const home = input.homeTeam.trim();
  const away = input.awayTeam.trim();
  if (home.length < 2 || away.length < 2) {
    return { success: false, error: "Enter both team names." };
  }
  const sum = input.homeProb + input.drawProb + input.awayProb;
  if (
    input.homeProb < 0 ||
    input.drawProb < 0 ||
    input.awayProb < 0 ||
    Math.abs(sum - 1) > 0.03
  ) {
    return { success: false, error: "Probabilities must sum to 100%." };
  }

  const profile = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prediction_records")
    .insert({
      user_id: profile.userId,
      fixture_id: null,
      home_team: home.slice(0, 100),
      away_team: away.slice(0, 100),
      predicted_home_win_prob: Math.round(input.homeProb * 1000) / 1000,
      predicted_draw_prob: Math.round(input.drawProb * 1000) / 1000,
      predicted_away_win_prob: Math.round(input.awayProb * 1000) / 1000,
      model_input: { source: "manual_calibration" },
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: "Could not save forecast. Please try again." };
  }

  revalidatePath("/dashboard/calibration");
  return { success: true, data: { id: data.id } };
}
