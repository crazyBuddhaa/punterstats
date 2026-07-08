"use server";

import { createClient } from "@/lib/supabase/server";
import type { MatchAnalysisInput, MatchAnalysisResult, SavedAnalysis } from "./types";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export async function saveAnalysis(
  homeTeamName: string,
  awayTeamName: string,
  analysisInput: MatchAnalysisInput,
  analysisResult: MatchAnalysisResult
): Promise<ApiResponse<SavedAnalysis>> {
  if (!homeTeamName.trim() || !awayTeamName.trim())
    return { success: false, error: "Team names are required." };
  if (homeTeamName.trim().length > 100 || awayTeamName.trim().length > 100)
    return { success: false, error: "Team name too long (max 100 characters)." };
  if (!analysisInput || !analysisResult)
    return { success: false, error: "Invalid analysis payload." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("match_analyses")
    .insert({
      user_id: user.id,
      home_team_name: homeTeamName.trim(),
      away_team_name: awayTeamName.trim(),
      analysis_input: analysisInput,
      analysis_result: analysisResult,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      id: data.id,
      userId: data.user_id,
      homeTeamName: data.home_team_name,
      awayTeamName: data.away_team_name,
      analysisInput: data.analysis_input as MatchAnalysisInput,
      analysisResult: data.analysis_result as MatchAnalysisResult,
      createdAt: data.created_at,
    },
  };
}

/**
 * Records a prediction's model output at the time it was made, so the
 * Calibration Engine (Stage 19) can later score it against the real
 * result. Distinct from saveAnalysis() — this is a lightweight tracking
 * row, not the full saved analysis.
 */
export async function trackPrediction(
  homeTeamName: string,
  awayTeamName: string,
  analysisInput: MatchAnalysisInput,
  analysisResult: MatchAnalysisResult,
  fixtureId?: string
): Promise<ApiResponse<{ id: string }>> {
  if (!homeTeamName.trim() || !awayTeamName.trim())
    return { success: false, error: "Team names are required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("prediction_records")
    .insert({
      user_id: user.id,
      fixture_id: fixtureId ?? null,
      home_team: homeTeamName.trim(),
      away_team: awayTeamName.trim(),
      predicted_home_win_prob: analysisResult.homeWinProb,
      predicted_draw_prob: analysisResult.drawProb,
      predicted_away_win_prob: analysisResult.awayWinProb,
      model_input: analysisInput,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, data: { id: data.id } };
}

export async function getSavedAnalyses(): Promise<ApiResponse<SavedAnalysis[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("match_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      homeTeamName: row.home_team_name,
      awayTeamName: row.away_team_name,
      analysisInput: row.analysis_input as MatchAnalysisInput,
      analysisResult: row.analysis_result as MatchAnalysisResult,
      createdAt: row.created_at,
    })),
  };
}
