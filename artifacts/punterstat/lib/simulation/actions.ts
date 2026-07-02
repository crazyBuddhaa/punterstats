"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SimulationSession, SimulationHistory } from "@/types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Session management ─────────────────────────────────────

export async function createSession(
  type: "bet" | "probability",
  startingBalance = 10000
): Promise<ApiResponse<SimulationSession>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to save your simulation sessions." };

  const { data, error } = await supabase
    .from("simulation_sessions")
    .insert({
      user_id: user.id,
      type,
      virtual_balance: startingBalance,
      starting_balance: startingBalance,
    })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create session." };

  return {
    success: true,
    data: {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      virtualBalance: Number(data.virtual_balance),
      startingBalance: Number(data.starting_balance),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function updateSessionBalance(
  sessionId: string,
  newBalance: number
): Promise<ApiResponse<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("simulation_sessions")
    .update({ virtual_balance: newBalance })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function recordBet(
  sessionId: string,
  odds: number,
  stake: number,
  outcome: "win" | "loss",
  profitLoss: number,
  balanceAfter: number
): Promise<ApiResponse<SimulationHistory>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("simulation_history")
    .insert({
      session_id: sessionId,
      odds,
      stake,
      outcome,
      profit_loss: profitLoss,
      balance_after: balanceAfter,
    })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Failed to record bet." };

  await updateSessionBalance(sessionId, balanceAfter);

  revalidatePath("/dashboard/simulation-history");
  return {
    success: true,
    data: {
      id: data.id,
      sessionId: data.session_id,
      odds: Number(data.odds),
      stake: Number(data.stake),
      outcome: data.outcome,
      profitLoss: Number(data.profit_loss),
      balanceAfter: Number(data.balance_after),
      createdAt: data.created_at,
    },
  };
}

export async function getSessionHistory(
  sessionId: string
): Promise<ApiResponse<SimulationHistory[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("simulation_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      odds: Number(row.odds),
      stake: Number(row.stake),
      outcome: row.outcome,
      profitLoss: Number(row.profit_loss),
      balanceAfter: Number(row.balance_after),
      createdAt: row.created_at,
    })),
  };
}
