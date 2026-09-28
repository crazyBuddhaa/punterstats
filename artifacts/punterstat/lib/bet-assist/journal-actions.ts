"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { BET_STATUSES, type BetStatus, type JournalBet } from "./journal";

export interface ActionResult {
  success: boolean;
  error?: string;
}

const TRACKER_PATH = "/dashboard/bet-tracker";

const optionalNumber = z
  .union([z.number(), z.nan(), z.null(), z.undefined()])
  .transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));

const betSchema = z.object({
  eventName: z.string().trim().min(1, "Event is required").max(200),
  market: z.string().trim().min(1).max(80).default("1X2"),
  selection: z.string().trim().min(1, "Selection is required").max(200),
  bookmaker: z.string().trim().max(80).optional().nullable(),
  sport: z.string().trim().max(40).default("football"),
  odds: z.number().gt(1, "Odds must be greater than 1").lt(10000),
  stake: z.number().gt(0, "Stake must be greater than 0").lt(100_000_000),
  yourProb: optionalNumber.refine((v) => v === null || (v > 0 && v < 1), "Probability must be between 0 and 100%"),
  closingOdds: optionalNumber.refine((v) => v === null || v > 1, "Closing odds must be greater than 1"),
  placedAt: z.string().optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type NewBetInput = z.input<typeof betSchema>;

function rowToBet(r: Record<string, unknown>): JournalBet {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    id: r.id as string,
    placedAt: r.placed_at as string,
    sport: r.sport as string,
    eventName: r.event_name as string,
    market: r.market as string,
    selection: r.selection as string,
    bookmaker: (r.bookmaker as string | null) ?? null,
    odds: Number(r.odds),
    stake: Number(r.stake),
    yourProb: num(r.your_prob),
    closingOdds: num(r.closing_odds),
    status: r.status as BetStatus,
    cashoutAmount: num(r.cashout_amount),
    notes: (r.notes as string | null) ?? null,
    settledAt: (r.settled_at as string | null) ?? null,
  };
}

export async function getJournal(): Promise<JournalBet[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bet_journal")
    .select("*")
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("[bet-journal] load failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToBet);
}

export async function addBet(input: NewBetInput): Promise<ActionResult> {
  const parsed = betSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid bet" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const b = parsed.data;
  const placedAt = b.placedAt && !Number.isNaN(Date.parse(b.placedAt)) ? new Date(b.placedAt).toISOString() : undefined;

  const { error } = await supabase.from("bet_journal").insert({
    user_id: user.id,
    event_name: b.eventName,
    market: b.market,
    selection: b.selection,
    bookmaker: b.bookmaker || null,
    sport: b.sport,
    odds: b.odds,
    stake: b.stake,
    your_prob: b.yourProb,
    closing_odds: b.closingOdds,
    notes: b.notes || null,
    ...(placedAt ? { placed_at: placedAt } : {}),
  });

  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  return { success: true };
}

const settleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(BET_STATUSES),
  cashoutAmount: optionalNumber,
  closingOdds: optionalNumber,
});

export async function settleBet(input: z.input<typeof settleSchema>): Promise<ActionResult> {
  const parsed = settleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid update" };
  const { id, status, cashoutAmount, closingOdds } = parsed.data;

  if (status === "cashed_out" && (cashoutAmount === null || cashoutAmount < 0)) {
    return { success: false, error: "Enter the cash-out amount." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const update: Record<string, unknown> = {
    status,
    settled_at: status === "pending" ? null : new Date().toISOString(),
    cashout_amount: status === "cashed_out" ? cashoutAmount : null,
  };
  if (closingOdds !== null && closingOdds > 1) update.closing_odds = closingOdds;

  const { error } = await supabase.from("bet_journal").update(update).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  return { success: true };
}

export async function deleteBet(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { success: false, error: "Invalid bet" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const { error } = await supabase.from("bet_journal").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  return { success: true };
}
