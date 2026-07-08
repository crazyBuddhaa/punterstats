/**
 * Spot The Value — pure comparison functions.
 *
 * Takes market odds for a match and (optionally) model-derived probabilities,
 * then computes the "value gap" for each outcome:
 *
 *   value_delta = model_probability − fair_market_probability
 *
 * A positive delta means the model sees the outcome as more likely than the
 * market implies once the bookmaker's margin (overround) has been removed.
 * This gap is educational context, not a betting tip.
 */

import { stripOverround } from "@/lib/odds/devig";

export type ValueRating =
  | "strong_value"
  | "slight_value"
  | "fair"
  | "slight_undervalue"
  | "undervalue";

export interface OutcomeAssessment {
  outcome: "home_win" | "draw" | "away_win";
  label: string;
  decimalOdds: number;
  /** Raw implied probability: 1/odds. Sums to >1 across all outcomes due to overround. */
  rawImpliedProb: number;
  /** Fair probability after stripping the bookmaker margin (normalised to sum to 1). */
  fairImpliedProb: number;
  /** Model probability supplied by the user's analyzer output (0–1). */
  modelProb: number | null;
  /** model_prob − fair_implied_prob. Null when no model prob is provided. */
  valueDelta: number | null;
  /** Categorical rating of the value delta. Null when no model prob is provided. */
  valueRating: ValueRating | null;
}

export interface MatchValueResult {
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakerKey: string;
  bookmakerTitle: string;
  /** Bookmaker margin expressed as a percentage, e.g. 5.3 means a 5.3% overround. */
  overroundPct: number;
  outcomes: OutcomeAssessment[];
}

function rateValueDelta(delta: number): ValueRating {
  if (delta > 0.10) return "strong_value";
  if (delta > 0.04) return "slight_value";
  if (delta >= -0.04) return "fair";
  if (delta >= -0.10) return "slight_undervalue";
  return "undervalue";
}

/**
 * Compute a value assessment for one match given explicit decimal odds.
 */
export function computeMatchValue(
  homeTeam: string,
  awayTeam: string,
  commenceTime: string,
  bookmakerKey: string,
  bookmakerTitle: string,
  homeOdds: number,
  drawOdds: number,
  awayOdds: number,
  modelProbs?: { home: number; draw: number; away: number } | null
): MatchValueResult {
  // Guard: invalid odds produce NaN/Infinity; clamp to safe minimum
  const safeHome = Number.isFinite(homeOdds) && homeOdds > 1 ? homeOdds : 1.001;
  const safeDraw = Number.isFinite(drawOdds) && drawOdds > 1 ? drawOdds : 1.001;
  const safeAway = Number.isFinite(awayOdds) && awayOdds > 1 ? awayOdds : 1.001;

  // Shared de-vig helper: raw implied probs (sum > 1) -> fair probs (sum = 1)
  const { rawImplied, fair, overroundPct } = stripOverround([safeHome, safeDraw, safeAway]);
  const [rawHome, rawDraw, rawAway] = rawImplied;
  const [fairHome, fairDraw, fairAway] = fair;

  function buildOutcome(
    outcome: OutcomeAssessment["outcome"],
    label: string,
    decimalOdds: number,
    rawImplied: number,
    fairImplied: number,
    modelProb: number | null
  ): OutcomeAssessment {
    const valueDelta = modelProb !== null ? modelProb - fairImplied : null;
    return {
      outcome,
      label,
      decimalOdds,
      rawImpliedProb: Math.round(rawImplied * 1000) / 1000,
      fairImpliedProb: Math.round(fairImplied * 1000) / 1000,
      modelProb,
      valueDelta: valueDelta !== null ? Math.round(valueDelta * 1000) / 1000 : null,
      valueRating: valueDelta !== null ? rateValueDelta(valueDelta) : null,
    };
  }

  return {
    homeTeam,
    awayTeam,
    commenceTime,
    bookmakerKey,
    bookmakerTitle,
    overroundPct,
    outcomes: [
      buildOutcome("home_win", homeTeam, safeHome, rawHome, fairHome, modelProbs?.home ?? null),
      buildOutcome("draw", "Draw", safeDraw, rawDraw, fairDraw, modelProbs?.draw ?? null),
      buildOutcome("away_win", awayTeam, safeAway, rawAway, fairAway, modelProbs?.away ?? null),
    ],
  };
}

/**
 * Extract h2h (moneyline) odds from a raw OddsEvent object and compute value.
 * Returns null if no h2h market or bookmaker is found on the event.
 */
export function computeValueFromOddsEvent(
  event: {
    homeTeam: string;
    awayTeam: string;
    commenceTime: string;
    bookmakers: Array<{
      key: string;
      title: string;
      markets: Array<{
        key: string;
        outcomes: Array<{ name: string; price: number }>;
      }>;
    }>;
  },
  modelProbs?: { home: number; draw: number; away: number } | null
): MatchValueResult | null {
  for (const bk of event.bookmakers) {
    const h2h = bk.markets.find((m) => m.key === "h2h");
    if (!h2h) continue;

    const homeOut = h2h.outcomes.find((o) => o.name === event.homeTeam);
    const awayOut = h2h.outcomes.find((o) => o.name === event.awayTeam);
    const drawOut = h2h.outcomes.find((o) => o.name === "Draw");

    // Only three-way markets are supported (home / draw / away)
    if (!homeOut || !awayOut || !drawOut) continue;

    return computeMatchValue(
      event.homeTeam,
      event.awayTeam,
      event.commenceTime,
      bk.key,
      bk.title,
      homeOut.price,
      drawOut.price,
      awayOut.price,
      modelProbs
    );
  }
  return null;
}
