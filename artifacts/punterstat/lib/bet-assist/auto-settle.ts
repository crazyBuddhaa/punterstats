/**
 * Pure market-evaluation and accumulator-settlement engine.
 * Safe to import from client, server, and unit tests.
 */

import type { BetStatus, LegStatus } from "./journal";

export interface ParsedFixture {
  homeTeam: string;
  awayTeam: string;
}

/**
 * Parse "Arsenal vs Chelsea", "Arsenal v Chelsea", "Arsenal - Chelsea" into home & away names.
 */
export function parseFixtureTeams(eventName: string): ParsedFixture | null {
  const cleaned = eventName.trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^(.+?)\s+(?:vs\.?|v\.?|-|–|—)\s+(.+)$/i);
  if (!match) return null;
  const homeTeam = match[1].trim();
  const awayTeam = match[2].trim();
  if (homeTeam.length < 2 || awayTeam.length < 2) return null;
  return { homeTeam, awayTeam };
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamMatches(selectionNorm: string, teamName: string): boolean {
  const t = norm(teamName);
  if (!t) return false;
  if (selectionNorm === t || selectionNorm.includes(t)) return true;
  // Also match core tokens (e.g. "man city" vs "manchester city" or "arsenal fc" vs "arsenal")
  const tokens = t.split(" ").filter((w) => w.length >= 3 && !["fc", "cf", "sc", "ac", "afc"].includes(w));
  return tokens.length > 0 && tokens.every((tok) => selectionNorm.includes(tok));
}

/**
 * Evaluate a single football selection against a final scoreline.
 * Returns "won" | "lost" | "void", or null if the market/selection cannot be evaluated unambiguously.
 */
export function evaluateSelection(
  selection: string,
  market: string,
  homeTeam: string,
  awayTeam: string,
  homeGoals: number,
  awayGoals: number,
): Exclude<LegStatus, "pending"> | null {
  const sel = norm(selection);
  const mkt = norm(market);
  const totalGoals = homeGoals + awayGoals;
  const bothScored = homeGoals > 0 && awayGoals > 0;
  const result: "H" | "D" | "A" =
    homeGoals > awayGoals ? "H" : homeGoals < awayGoals ? "A" : "D";

  // 1. Over / Under goals (e.g. "Over 2.5", "O2.5", "Under 3.5 goals")
  const ouMatch = sel.match(/\b(over|under|ov|un|o|u)\s*(\d+(?:\.\d+)?)\b/);
  if (ouMatch && (!mkt || mkt.includes("over") || mkt.includes("under") || mkt.includes("goal") || mkt.includes("1x2") || mkt.includes("accum"))) {
    const dir = ouMatch[1];
    const line = parseFloat(ouMatch[2]);
    if (Number.isFinite(line) && line >= 0 && line <= 12) {
      const isOver = dir.startsWith("o");
      if (totalGoals === line) return "void";
      return isOver ? (totalGoals > line ? "won" : "lost") : totalGoals < line ? "won" : "lost";
    }
  }

  // 2. Both Teams to Score (BTTS / GG / NG)
  if (
    sel === "gg" ||
    sel === "btts" ||
    sel === "btts yes" ||
    sel === "both teams to score" ||
    sel === "both teams to score yes" ||
    (mkt.includes("btts") && sel === "yes")
  ) {
    return bothScored ? "won" : "lost";
  }
  if (
    sel === "ng" ||
    sel === "btts no" ||
    sel === "both teams to score no" ||
    sel === "no goal" ||
    (mkt.includes("btts") && sel === "no")
  ) {
    return !bothScored ? "won" : "lost";
  }

  // 3. Double Chance (1X, X2, 12, "<Team> or Draw", "Home or Draw")
  if (sel === "1x" || sel === "home or draw" || sel === "home draw") {
    return result === "H" || result === "D" ? "won" : "lost";
  }
  if (sel === "x2" || sel === "away or draw" || sel === "draw or away" || sel === "away draw") {
    return result === "A" || result === "D" ? "won" : "lost";
  }
  if (sel === "12" || sel === "home or away" || sel === "either team to win") {
    return result === "H" || result === "A" ? "won" : "lost";
  }
  if (sel.includes("or draw") || sel.includes("double chance")) {
    const matchesHome = teamMatches(sel, homeTeam);
    const matchesAway = teamMatches(sel, awayTeam);
    if (matchesHome && !matchesAway) return result === "H" || result === "D" ? "won" : "lost";
    if (matchesAway && !matchesHome) return result === "A" || result === "D" ? "won" : "lost";
  }

  // 4. Draw No Bet (DNB)
  if (sel.includes("dnb") || sel.includes("draw no bet") || mkt.includes("dnb") || mkt.includes("draw no bet")) {
    if (result === "D") return "void";
    const matchesHome = sel.includes("home") || sel === "1" || teamMatches(sel, homeTeam);
    const matchesAway = sel.includes("away") || sel === "2" || teamMatches(sel, awayTeam);
    if (matchesHome && !matchesAway) return result === "H" ? "won" : "lost";
    if (matchesAway && !matchesHome) return result === "A" ? "won" : "lost";
  }

  // 5. 1X2 / Match Result
  if (sel === "draw" || sel === "x" || sel === "tie") {
    return result === "D" ? "won" : "lost";
  }
  if (sel === "1" || sel === "home" || sel === "home win" || sel === "home to win") {
    return result === "H" ? "won" : "lost";
  }
  if (sel === "2" || sel === "away" || sel === "away win" || sel === "away to win") {
    return result === "A" ? "won" : "lost";
  }

  // Team name match (e.g. "Arsenal to win", "Arsenal Win", "Arsenal")
  const mentionsHome = teamMatches(sel, homeTeam);
  const mentionsAway = teamMatches(sel, awayTeam);
  if (mentionsHome && !mentionsAway) {
    return result === "H" ? "won" : "lost";
  }
  if (mentionsAway && !mentionsHome) {
    return result === "A" ? "won" : "lost";
  }

  return null;
}

export interface AccaSettlementSummary {
  status: BetStatus;
  wonLegs: number;
  lostLegs: number;
  voidLegs: number;
  pendingLegs: number;
}

/**
 * Derive the overall accumulator status from its individual legs.
 * Rule:
 *   - If 1 or more legs are settled LOST -> immediately mark the whole accumulator LOST.
 *   - If 0 legs are lost and 1+ legs are still PENDING -> keep PENDING.
 *   - If all legs are decided with 0 lost -> VOID if all legs are void, else WON.
 */
export function deriveAccumulatorStatus(legStatuses: LegStatus[]): AccaSettlementSummary {
  let wonLegs = 0;
  let lostLegs = 0;
  let voidLegs = 0;
  let pendingLegs = 0;

  for (const s of legStatuses) {
    if (s === "won") wonLegs++;
    else if (s === "lost") lostLegs++;
    else if (s === "void") voidLegs++;
    else pendingLegs++;
  }

  let status: BetStatus;
  if (lostLegs > 0) {
    status = "lost";
  } else if (pendingLegs > 0) {
    status = "pending";
  } else if (wonLegs === 0 && voidLegs > 0) {
    status = "void";
  } else {
    status = "won";
  }

  return { status, wonLegs, lostLegs, voidLegs, pendingLegs };
}

/**
 * Effective combined odds of an accumulator excluding any void legs (standard bookmaker rule).
 */
export function effectiveAccaOdds(legs: Array<{ odds: number; status: LegStatus }>): number {
  const active = legs.filter((l) => l.status !== "void" && Number.isFinite(l.odds) && l.odds > 1);
  if (active.length === 0) return 1;
  return Number(active.reduce((acc, l) => acc * l.odds, 1).toFixed(3));
}
