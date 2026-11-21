"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { betFingerprint } from "@/lib/model/punter-model";
import {
  BET_STATUSES,
  LEG_STATUSES,
  type BetStatus,
  type JournalBet,
  type JournalBetLeg,
  type LegStatus,
} from "./journal";
import {
  deriveAccumulatorStatus,
  effectiveAccaOdds,
  evaluateSelection,
  parseFixtureTeams,
} from "./auto-settle";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface AutoSettleResult extends ActionResult {
  checkedBets?: number;
  settledLegs?: number;
  settledBets?: number;
  message?: string;
}

const TRACKER_PATH = "/dashboard/bet-tracker";
const REPORT_CARD_PATH = "/dashboard/report-card";

const optionalNumber = z
  .union([z.number(), z.nan(), z.null(), z.undefined()])
  .transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));

const legSchema = z.object({
  eventName: z.string().trim().min(1).max(200),
  homeTeam: z.string().trim().max(100).optional().nullable(),
  awayTeam: z.string().trim().max(100).optional().nullable(),
  matchDate: z.string().max(64).optional().nullable(),
  market: z.string().trim().max(80).default("1X2"),
  selection: z.string().trim().min(1).max(200),
  odds: z.number().gt(1).lt(10000),
});

export type NewBetLegInput = z.input<typeof legSchema>;

const betSchema = z.object({
  eventName: z.string().trim().min(1, "Event is required").max(200),
  market: z.string().trim().min(1).max(80).default("1X2"),
  selection: z.string().trim().min(1, "Selection is required").max(200),
  bookmaker: z.string().trim().max(80).optional().nullable(),
  sport: z.string().trim().max(40).default("football"),
  odds: z.number().gt(1, "Odds must be greater than 1").lt(10000),
  stake: z.number().gt(0, "Stake must be greater than 0").lt(100_000_000),
  yourProb: optionalNumber.refine((v) => v === null || (v > 0 && v < 1), "Probability must be between 0 and 100%").optional(),
  closingOdds: optionalNumber.refine((v) => v === null || v > 1, "Closing odds must be greater than 1").optional(),
  legCount: z.number().int().min(1, "Legs must be at least 1").max(50, "Legs cannot exceed 50").optional(),
  legs: z.array(legSchema).max(50).optional(),
  placedAt: z.string().max(64).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type NewBetInput = z.input<typeof betSchema>;

function rowToLeg(r: Record<string, unknown>): JournalBetLeg {
  return {
    id: r.id as string,
    betId: r.bet_id as string,
    position: Number(r.position ?? 0),
    eventName: r.event_name as string,
    homeTeam: (r.home_team as string | null) ?? null,
    awayTeam: (r.away_team as string | null) ?? null,
    matchDate: (r.match_date as string | null) ?? null,
    market: (r.market as string) || "1X2",
    selection: r.selection as string,
    odds: Number(r.odds),
    status: (r.status as LegStatus) || "pending",
    resultScore: (r.result_score as string | null) ?? null,
    settledAt: (r.settled_at as string | null) ?? null,
  };
}

function rowToBet(r: Record<string, unknown>, legs?: JournalBetLeg[]): JournalBet {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  const rawLegs = num(r.leg_count);
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
    legCount:
      legs && legs.length > 0
        ? legs.length
        : rawLegs !== null && rawLegs >= 1
          ? Math.round(rawLegs)
          : 1,
    legs: legs && legs.length > 0 ? legs : undefined,
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

  const rows = data ?? [];
  const legsByBet = new Map<string, JournalBetLeg[]>();

  if (rows.length > 0) {
    const betIds = rows.map((r) => r.id as string);
    const { data: legRows, error: legErr } = await supabase
      .from("bet_journal_legs")
      .select("*")
      .in("bet_id", betIds)
      .order("position", { ascending: true });

    if (!legErr && legRows) {
      for (const lr of legRows) {
        const leg = rowToLeg(lr);
        const list = legsByBet.get(leg.betId) ?? [];
        list.push(leg);
        legsByBet.set(leg.betId, list);
      }
    }
  }

  return rows.map((r) => rowToBet(r, legsByBet.get(r.id as string)));
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
  const legsInput = b.legs ?? [];
  const legCount =
    legsInput.length > 0
      ? legsInput.length
      : b.legCount ?? (b.market.toLowerCase() === "accumulator" ? 2 : 1);

  const { data: insertedBet, error } = await supabase
    .from("bet_journal")
    .insert({
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
      leg_count: legCount,
      notes: b.notes || null,
      ...(placedAt ? { placed_at: placedAt } : {}),
    })
    .select("id")
    .single();

  if (error || !insertedBet) return { success: false, error: error?.message ?? "Failed to save bet" };

  if (legsInput.length > 0) {
    const legRows = legsInput.map((leg, idx) => {
      const parsedTeams = parseFixtureTeams(leg.eventName);
      return {
        bet_id: insertedBet.id,
        user_id: user.id,
        position: idx,
        event_name: leg.eventName,
        home_team: leg.homeTeam || parsedTeams?.homeTeam || null,
        away_team: leg.awayTeam || parsedTeams?.awayTeam || null,
        match_date: leg.matchDate && !Number.isNaN(Date.parse(leg.matchDate)) ? new Date(leg.matchDate).toISOString() : null,
        market: leg.market || "1X2",
        selection: leg.selection,
        odds: leg.odds,
        status: "pending",
      };
    });

    const { error: legsErr } = await supabase.from("bet_journal_legs").insert(legRows);
    if (legsErr) {
      // Non-fatal if migration 065 isn't applied yet; parent bet is still saved
      console.error("[bet-journal] leg insert failed:", legsErr.message);
    }
  }

  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

const settleSchema = z.object({
  id: z.string().max(36).uuid(),
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

  const { data: existing, error: fetchErr } = await supabase
    .from("bet_journal")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!existing) return { success: false, error: "Bet not found." };
  if (existing.status !== "pending") {
    return { success: false, error: "Settled bets are locked and cannot be modified." };
  }

  const update: Record<string, unknown> = {
    status,
    settled_at: status === "pending" ? null : new Date().toISOString(),
    cashout_amount: status === "cashed_out" ? cashoutAmount : null,
  };
  if (closingOdds !== null && closingOdds > 1) update.closing_odds = closingOdds;

  const { error } = await supabase
    .from("bet_journal")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");
  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

const settleLegSchema = z.object({
  legId: z.string().max(36).uuid(),
  status: z.enum(LEG_STATUSES),
});

/**
 * Settle an individual accumulator leg and automatically update the parent
 * accumulator status (if 1+ leg is lost, the whole accumulator is marked lost).
 */
export async function settleLeg(input: z.input<typeof settleLegSchema>): Promise<ActionResult> {
  const parsed = settleLegSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid leg update" };
  const { legId, status } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const { data: existingLeg, error: existingLegErr } = await supabase
    .from("bet_journal_legs")
    .select("bet_id")
    .eq("id", legId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLegErr || !existingLeg) {
    return { success: false, error: existingLegErr?.message ?? "Leg not found" };
  }

  const { data: parentBet, error: parentErr } = await supabase
    .from("bet_journal")
    .select("status")
    .eq("id", existingLeg.bet_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (parentErr || !parentBet) {
    return { success: false, error: parentErr?.message ?? "Parent bet not found" };
  }
  if (parentBet.status !== "pending") {
    return { success: false, error: "Settled bets are locked and cannot be modified." };
  }

  const { data: leg, error: legErr } = await supabase
    .from("bet_journal_legs")
    .update({
      status,
      settled_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", legId)
    .eq("user_id", user.id)
    .select("bet_id")
    .single();

  if (legErr || !leg) return { success: false, error: legErr?.message ?? "Leg not found" };

  // Re-evaluate parent accumulator status from all sibling legs
  const { data: allLegs } = await supabase
    .from("bet_journal_legs")
    .select("status, odds")
    .eq("bet_id", leg.bet_id)
    .eq("user_id", user.id);

  if (allLegs && allLegs.length > 0) {
    const summary = deriveAccumulatorStatus(allLegs.map((l) => l.status as LegStatus));
    const parentUpdate: Record<string, unknown> = {
      status: summary.status,
      settled_at: summary.status === "pending" ? null : new Date().toISOString(),
    };
    if (summary.voidLegs > 0 && summary.status === "won") {
      const adjOdds = effectiveAccaOdds(
        allLegs.map((l) => ({ odds: Number(l.odds), status: l.status as LegStatus })),
      );
      if (adjOdds > 1) parentUpdate.odds = adjOdds;
    }

    await supabase
      .from("bet_journal")
      .update(parentUpdate)
      .eq("id", leg.bet_id)
      .eq("user_id", user.id);
  }

  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

function safeLike(name: string): string {
  return name.trim().replace(/[%_\\]/g, "");
}

function jaccardTokens(a: string, b: string): number {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !["fc", "cf", "sc", "ac", "afc"].includes(t));
  const setA = new Set(clean(a));
  const setB = new Set(clean(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? inter / union : 0;
}

async function lookupFinishedMatch(
  admin: ReturnType<typeof createAdminClient>,
  homeTeam: string,
  awayTeam: string,
  referenceDateIso: string,
): Promise<{ homeGoals: number; awayGoals: number; homeTeam: string; awayTeam: string } | null> {
  const ref = new Date(referenceDateIso);
  const from = new Date(ref.getTime() - 48 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = new Date(ref.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // 1. Exact case-insensitive lookup in historical_matches
  const { data: exact } = await admin
    .from("historical_matches")
    .select("home_team, away_team, home_goals, away_goals")
    .ilike("home_team", safeLike(homeTeam))
    .ilike("away_team", safeLike(awayTeam))
    .gte("match_date", from)
    .lte("match_date", to)
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)
    .order("match_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exact && exact.home_goals !== null && exact.away_goals !== null) {
    return {
      homeGoals: Number(exact.home_goals),
      awayGoals: Number(exact.away_goals),
      homeTeam: exact.home_team,
      awayTeam: exact.away_team,
    };
  }

  // 2. Fuzzy match within date window in historical_matches
  const { data: candidates } = await admin
    .from("historical_matches")
    .select("home_team, away_team, home_goals, away_goals")
    .gte("match_date", from)
    .lte("match_date", to)
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)
    .limit(150);

  if (!candidates || candidates.length === 0) return null;

  let best: (typeof candidates)[number] | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = (jaccardTokens(homeTeam, c.home_team) + jaccardTokens(awayTeam, c.away_team)) / 2;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  if (best && bestScore >= 0.6 && best.home_goals !== null && best.away_goals !== null) {
    return {
      homeGoals: Number(best.home_goals),
      awayGoals: Number(best.away_goals),
      homeTeam: best.home_team,
      awayTeam: best.away_team,
    };
  }

  return null;
}

/**
 * Automatically look up finished match results for pending bets & accumulator legs
 * and settle them. If 1+ leg in an accumulator is settled lost, the entire
 * accumulator is immediately marked lost.
 */
export async function autoSettlePendingBets(cronMode = false): Promise<AutoSettleResult> {
  let userId: string | null = null;
  if (!cronMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sign in to auto-settle bets." };
    userId = user.id;
  }

  const admin = createAdminClient();
  let pendingQuery = admin
    .from("bet_journal")
    .select("id, user_id, event_name, market, selection, placed_at, leg_count, status")
    .eq("status", "pending")
    .order("placed_at", { ascending: false })
    .limit(200);

  if (userId) pendingQuery = pendingQuery.eq("user_id", userId);

  const { data: pendingBets, error } = await pendingQuery;
  if (error) return { success: false, error: error.message };
  if (!pendingBets || pendingBets.length === 0) {
    return {
      success: true,
      checkedBets: 0,
      settledLegs: 0,
      settledBets: 0,
      message: "No pending bets to settle.",
    };
  }

  const betIds = pendingBets.map((b) => b.id as string);
  const { data: allLegRows } = await admin
    .from("bet_journal_legs")
    .select("*")
    .in("bet_id", betIds)
    .order("position", { ascending: true });

  const legsByBet = new Map<string, Array<Record<string, unknown>>>();
  for (const lr of allLegRows ?? []) {
    const bid = lr.bet_id as string;
    const list = legsByBet.get(bid) ?? [];
    list.push(lr);
    legsByBet.set(bid, list);
  }

  let settledLegs = 0;
  let settledBets = 0;
  const nowIso = new Date().toISOString();

  for (const bet of pendingBets) {
    const legs = legsByBet.get(bet.id as string);

    if (legs && legs.length > 0) {
      // Accumulator / multi-leg bet with tracked legs
      const updatedStatuses: LegStatus[] = [];

      for (const leg of legs) {
        const currentStatus = leg.status as LegStatus;
        if (currentStatus !== "pending") {
          updatedStatuses.push(currentStatus);
          continue;
        }

        const parsedTeams =
          leg.home_team && leg.away_team
            ? { homeTeam: String(leg.home_team), awayTeam: String(leg.away_team) }
            : parseFixtureTeams(String(leg.event_name));

        if (!parsedTeams) {
          updatedStatuses.push("pending");
          continue;
        }

        const match = await lookupFinishedMatch(
          admin,
          parsedTeams.homeTeam,
          parsedTeams.awayTeam,
          String(leg.match_date || bet.placed_at),
        );

        if (!match) {
          updatedStatuses.push("pending");
          continue;
        }

        const legOutcome = evaluateSelection(
          String(leg.selection),
          String(leg.market || "1X2"),
          match.homeTeam,
          match.awayTeam,
          match.homeGoals,
          match.awayGoals,
        );

        if (!legOutcome) {
          updatedStatuses.push("pending");
          continue;
        }

        const scoreText = `${match.homeGoals} - ${match.awayGoals}`;
        await admin
          .from("bet_journal_legs")
          .update({
            status: legOutcome,
            result_score: scoreText,
            settled_at: nowIso,
          })
          .eq("id", leg.id);

        settledLegs++;
        updatedStatuses.push(legOutcome);
      }

      const accaSummary = deriveAccumulatorStatus(updatedStatuses);
      if (accaSummary.status !== "pending") {
        const parentUpdate: Record<string, unknown> = {
          status: accaSummary.status,
          settled_at: nowIso,
        };
        if (accaSummary.voidLegs > 0 && accaSummary.status === "won") {
          const adjOdds = effectiveAccaOdds(
            legs.map((l, idx) => ({
              odds: Number(l.odds),
              status: updatedStatuses[idx],
            })),
          );
          if (adjOdds > 1) parentUpdate.odds = adjOdds;
        }
        await admin.from("bet_journal").update(parentUpdate).eq("id", bet.id);
        settledBets++;
      }
    } else if ((Number(bet.leg_count) || 1) === 1) {
      // Single bet without child leg rows
      const parsedTeams = parseFixtureTeams(String(bet.event_name));
      if (!parsedTeams) continue;

      const match = await lookupFinishedMatch(
        admin,
        parsedTeams.homeTeam,
        parsedTeams.awayTeam,
        String(bet.placed_at),
      );
      if (!match) continue;

      const outcome = evaluateSelection(
        String(bet.selection),
        String(bet.market || "1X2"),
        match.homeTeam,
        match.awayTeam,
        match.homeGoals,
        match.awayGoals,
      );
      if (!outcome) continue;

      await admin
        .from("bet_journal")
        .update({
          status: outcome,
          settled_at: nowIso,
        })
        .eq("id", bet.id);
      settledBets++;
    }
  }

  if (!cronMode) {
    revalidatePath(TRACKER_PATH);
    revalidatePath(REPORT_CARD_PATH);
  }

  const msg =
    settledBets > 0 || settledLegs > 0
      ? `Checked ${pendingBets.length} pending slip${pendingBets.length === 1 ? "" : "s"} · Settled ${settledLegs} leg${settledLegs === 1 ? "" : "s"} & ${settledBets} slip${settledBets === 1 ? "" : "s"}.`
      : `Checked ${pendingBets.length} pending slip${pendingBets.length === 1 ? "" : "s"} — no finished match results matched yet.`;

  return {
    success: true,
    checkedBets: pendingBets.length,
    settledLegs,
    settledBets,
    message: msg,
  };
}

const updateBetSchema = betSchema.extend({
  id: z.string().max(36).uuid(),
});

export type UpdateBetInput = z.input<typeof updateBetSchema>;

export async function updateBet(input: UpdateBetInput): Promise<ActionResult> {
  const parsed = updateBetSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid bet" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const b = parsed.data;
  const legCount = b.legCount ?? (b.market.toLowerCase() === "accumulator" ? 2 : 1);

  const { data: existing, error: fetchErr } = await supabase
    .from("bet_journal")
    .select("status")
    .eq("id", b.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!existing) return { success: false, error: "Bet not found." };
  if (existing.status !== "pending") {
    return { success: false, error: "Settled bets are locked and cannot be edited." };
  }

  const { error } = await supabase
    .from("bet_journal")
    .update({
      event_name: b.eventName,
      market: b.market,
      selection: b.selection,
      bookmaker: b.bookmaker || null,
      odds: b.odds,
      stake: b.stake,
      your_prob: b.yourProb ?? null,
      leg_count: legCount,
      notes: b.notes || null,
    })
    .eq("id", b.id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

export async function deleteBet(id: string): Promise<ActionResult> {
  if (!z.string().max(36).uuid().safeParse(id).success) return { success: false, error: "Invalid bet" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to use the bet tracker." };

  const { data: existing, error: fetchErr } = await supabase
    .from("bet_journal")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!existing) return { success: false, error: "Bet not found." };
  if (existing.status !== "pending") {
    return { success: false, error: "Settled bets are locked and cannot be deleted." };
  }

  const { error } = await supabase
    .from("bet_journal")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");
  if (error) return { success: false, error: error.message };
  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

const importRowSchema = betSchema.extend({
  status: z.enum(BET_STATUSES).default("pending"),
  cashoutAmount: optionalNumber.optional(),
});

const bulkImportSchema = z
  .array(importRowSchema)
  .min(1, "No valid bets found to import.")
  .max(500, "You can import up to 500 bets per CSV upload.");

export interface BulkImportResult extends ActionResult {
  imported?: number;
  skippedDuplicates?: number;
}

export async function bulkImportBets(
  rows: z.input<typeof importRowSchema>[]
): Promise<BulkImportResult> {
  const parsed = bulkImportSchema.safeParse(rows);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid CSV rows" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to import your bet history." };

  // Fetch existing fingerprints for this user to avoid duplicate rows on re-upload
  const { data: existingRows } = await supabase
    .from("bet_journal")
    .select("placed_at, event_name, selection, odds, stake, bookmaker")
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false })
    .limit(2000);

  const seenFingerprints = new Set<string>();
  for (const r of existingRows ?? []) {
    seenFingerprints.add(
      betFingerprint({
        placedAt: r.placed_at as string | null,
        eventName: String(r.event_name ?? ""),
        selection: String(r.selection ?? ""),
        odds: Number(r.odds ?? 0),
        stake: Number(r.stake ?? 0),
        bookmaker: (r.bookmaker as string | null) ?? null,
      }),
    );
  }

  const nowIso = new Date().toISOString();
  const payload: Record<string, unknown>[] = [];
  let skippedDuplicates = 0;

  for (const b of parsed.data) {
    const placedAt =
      b.placedAt && !Number.isNaN(Date.parse(b.placedAt))
        ? new Date(b.placedAt).toISOString()
        : nowIso;
    const fp = betFingerprint({
      placedAt,
      eventName: b.eventName,
      selection: b.selection,
      odds: b.odds,
      stake: b.stake,
      bookmaker: b.bookmaker || null,
    });
    if (seenFingerprints.has(fp)) {
      skippedDuplicates += 1;
      continue;
    }
    seenFingerprints.add(fp);

    const legCount = b.legCount ?? (b.market.toLowerCase().includes("accum") ? 2 : 1);
    const settledAt = b.status === "pending" ? null : placedAt;

    payload.push({
      user_id: user.id,
      event_name: b.eventName,
      market: b.market,
      selection: b.selection,
      bookmaker: b.bookmaker || null,
      sport: b.sport,
      odds: b.odds,
      stake: b.stake,
      your_prob: b.yourProb ?? null,
      closing_odds: b.closingOdds ?? null,
      leg_count: legCount,
      status: b.status,
      cashout_amount: b.status === "cashed_out" ? (b.cashoutAmount ?? 0) : null,
      settled_at: settledAt,
      placed_at: placedAt,
      notes: b.notes || null,
    });
  }

  // Insert in chunks of 100 to stay well within PostgREST payload limits
  for (let i = 0; i < payload.length; i += 100) {
    const chunk = payload.slice(i, i + 100);
    const { error } = await supabase.from("bet_journal").insert(chunk);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  revalidatePath("/dashboard/profile");
  revalidatePath("/bet-assist/slip-checker");
  return { success: true, imported: payload.length, skippedDuplicates };
}

