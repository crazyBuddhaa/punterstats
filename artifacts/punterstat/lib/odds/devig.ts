/**
 * De-vig (overround stripping) utilities — shared between Spot The Value and
 * the simulators. Market decimal odds always bake in the bookmaker's margin
 * ("overround"): the raw implied probabilities (1/odds) across all outcomes
 * sum to more than 1. Stripping that margin out gives the "fair" probability
 * — the bookmaker's actual view of the true chance, net of their edge.
 *
 * This is a teaching primitive: showing a user both numbers side by side
 * ("the market implies 44% but is only paying you for 40%") is the core
 * literacy point of a de-vig display.
 */

export interface DevigResult {
  /** Raw implied probability per outcome: 1/odds. Sums to > 1. */
  rawImplied: number[];
  /** Fair probability per outcome, normalised so the set sums to 1. */
  fair: number[];
  /** Overround expressed as a percentage, e.g. 5.3 means a 5.3% margin. */
  overroundPct: number;
}

/**
 * Strips the bookmaker margin from a set of decimal odds covering one
 * complete market (2-way moneyline, 3-way 1X2, over/under, etc).
 */
export function stripOverround(decimalOdds: number[]): DevigResult {
  const safeOdds = decimalOdds.map((o) => (Number.isFinite(o) && o > 1 ? o : 1.001));
  const rawImplied = safeOdds.map((o) => 1 / o);
  const total = rawImplied.reduce((s, v) => s + v, 0);
  const overroundPct = Math.round((total - 1) * 1000) / 10;
  const fair = rawImplied.map((v) => v / total);

  return {
    rawImplied: rawImplied.map((v) => Math.round(v * 1000) / 1000),
    fair: fair.map((v) => Math.round(v * 1000) / 1000),
    overroundPct,
  };
}

/** Convenience for a single-outcome raw implied probability (no de-vig context). */
export function impliedProbability(decimalOdds: number): number {
  return decimalOdds > 1 ? 1 / decimalOdds : 0;
}

/**
 * Converts a fair probability back into a "fair" decimal odds figure — useful
 * for showing what a no-margin bookmaker would theoretically offer.
 */
export function fairOddsFromProbability(fairProb: number): number {
  if (fairProb <= 0) return Infinity;
  return Math.round((1 / fairProb) * 100) / 100;
}
