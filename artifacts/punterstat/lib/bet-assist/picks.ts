/**
 * Bet Assist — data-driven picks model.
 *
 * How a pick is produced for each upcoming 1X2 fixture:
 *
 *   1. Market consensus. Every bookmaker's 1X2 prices are de-vigged
 *      individually, then averaged. Sharp / exchange books (Pinnacle,
 *      Betfair Exchange, Matchbook, Smarkets) get a higher weight because
 *      their prices are the best public estimate of true probability.
 *
 *   2. Team-strength model (optional). When recent historical results exist
 *      for both teams, a Dixon-Coles style attack/defence rating produces an
 *      independent 1X2 estimate (see ./ratings.ts). It is blended in at
 *      RATINGS_WEIGHT; with no data the model is pure consensus.
 *
 *   3. Price shopping. The best available price for each outcome across all
 *      bookmakers is compared with the model probability:
 *          EV = p_model × best_odds − 1
 *      Outcomes with EV above MIN_EDGE from enough bookmakers are flagged.
 *
 *   4. Staking. A quarter-Kelly stake, capped at MAX_STAKE_PCT of bankroll,
 *      is suggested so a single pick can never be a large share of a bankroll.
 *
 * The model's edge comes mostly from line shopping: finding a price that is
 * longer than the market consensus. That edge is real but small and noisy —
 * the UI must present picks as probabilities, not certainties.
 */

import type { OddsEvent } from "@/lib/odds/types";
import { expectedValue, kellyStake } from "./calculators";

export type Outcome = "home" | "draw" | "away";

export interface OutcomeProbs {
  home: number;
  draw: number;
  away: number;
}

export interface PickOutcome {
  outcome: Outcome;
  label: string;
  modelProb: number;
  consensusProb: number;
  ratingsProb: number | null;
  fairOdds: number;
  bestOdds: number;
  bestBookmaker: string;
  ev: number;
  /** Suggested stake as a fraction of bankroll (quarter Kelly, capped). */
  stakePct: number;
}

export type Confidence = "low" | "medium" | "high";

export interface MatchPick {
  eventId: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakerCount: number;
  sharpBookmakerCount: number;
  /** Average bookmaker margin across all books, as a fraction. */
  avgMargin: number;
  outcomes: PickOutcome[];
  /** The single best-EV outcome if it clears the value threshold, else null. */
  pick: PickOutcome | null;
  confidence: Confidence;
  usedRatings: boolean;
  /** Most likely outcome by model probability (not a value call). */
  favourite: PickOutcome;
}

export const SHARP_BOOKS: Record<string, number> = {
  pinnacle: 3,
  betfair_ex_uk: 2.5,
  betfair_ex_eu: 2.5,
  matchbook: 2,
  smarkets: 2,
};

export const RATINGS_WEIGHT = 0.25;
export const MIN_EDGE = 0.02;
export const MIN_BOOKMAKERS = 3;
export const MAX_STAKE_PCT = 0.02;
export const KELLY_MULTIPLIER = 0.25;

interface BookPrices {
  key: string;
  title: string;
  home: number;
  draw: number;
  away: number;
}

function extractPrices(event: OddsEvent): BookPrices[] {
  const out: BookPrices[] = [];
  for (const bk of event.bookmakers) {
    const h2h = bk.markets.find((m) => m.key === "h2h");
    if (!h2h) continue;
    const home = h2h.outcomes.find((o) => o.name === event.homeTeam)?.price;
    const away = h2h.outcomes.find((o) => o.name === event.awayTeam)?.price;
    const draw = h2h.outcomes.find((o) => o.name === "Draw")?.price;
    if (!(home && home > 1 && draw && draw > 1 && away && away > 1)) continue;
    out.push({ key: bk.key, title: bk.title, home, draw, away });
  }
  return out;
}

function consensus(prices: BookPrices[]): { probs: OutcomeProbs; avgMargin: number } {
  let wSum = 0;
  let margins = 0;
  const acc: OutcomeProbs = { home: 0, draw: 0, away: 0 };
  for (const p of prices) {
    const ih = 1 / p.home;
    const id = 1 / p.draw;
    const ia = 1 / p.away;
    const book = ih + id + ia;
    margins += book - 1;
    const w = SHARP_BOOKS[p.key] ?? 1;
    acc.home += (ih / book) * w;
    acc.draw += (id / book) * w;
    acc.away += (ia / book) * w;
    wSum += w;
  }
  return {
    probs: { home: acc.home / wSum, draw: acc.draw / wSum, away: acc.away / wSum },
    avgMargin: margins / prices.length,
  };
}

function blend(a: OutcomeProbs, b: OutcomeProbs, wB: number): OutcomeProbs {
  const r = {
    home: a.home * (1 - wB) + b.home * wB,
    draw: a.draw * (1 - wB) + b.draw * wB,
    away: a.away * (1 - wB) + b.away * wB,
  };
  const s = r.home + r.draw + r.away;
  return { home: r.home / s, draw: r.draw / s, away: r.away / s };
}

export function buildMatchPick(event: OddsEvent, ratings?: OutcomeProbs | null): MatchPick | null {
  const prices = extractPrices(event);
  if (prices.length === 0) return null;

  const { probs: cons, avgMargin } = consensus(prices);
  const model = ratings ? blend(cons, ratings, RATINGS_WEIGHT) : cons;

  const labels: Record<Outcome, string> = {
    home: event.homeTeam,
    draw: "Draw",
    away: event.awayTeam,
  };

  const outcomes: PickOutcome[] = (["home", "draw", "away"] as Outcome[]).map((o) => {
    let best = prices[0];
    for (const p of prices) if (p[o] > best[o]) best = p;
    const bestOdds = best[o];
    const modelProb = model[o];
    const ev = expectedValue(modelProb, bestOdds);
    const k = kellyStake(modelProb, bestOdds, 1, KELLY_MULTIPLIER);
    return {
      outcome: o,
      label: labels[o],
      modelProb,
      consensusProb: cons[o],
      ratingsProb: ratings ? ratings[o] : null,
      fairOdds: 1 / modelProb,
      bestOdds,
      bestBookmaker: best.title,
      ev,
      stakePct: Math.min(MAX_STAKE_PCT, k.fraction),
    };
  });

  const sharpCount = prices.filter((p) => p.key in SHARP_BOOKS).length;
  const eligible = prices.length >= MIN_BOOKMAKERS;
  const bestEv = outcomes.reduce((a, b) => (b.ev > a.ev ? b : a));
  const pick = eligible && bestEv.ev >= MIN_EDGE ? bestEv : null;

  let confidence: Confidence = "low";
  if (prices.length >= 8 && sharpCount >= 1) confidence = "high";
  else if (prices.length >= 5) confidence = "medium";
  // Very large "edges" usually mean a stale or mispriced line, not a real opportunity.
  if (pick && pick.ev > 0.15) confidence = "low";

  const favourite = outcomes.reduce((a, b) => (b.modelProb > a.modelProb ? b : a));

  return {
    eventId: event.id,
    sportKey: event.sportKey,
    homeTeam: event.homeTeam,
    awayTeam: event.awayTeam,
    commenceTime: event.commenceTime,
    bookmakerCount: prices.length,
    sharpBookmakerCount: sharpCount,
    avgMargin,
    outcomes,
    pick,
    confidence,
    usedRatings: !!ratings,
    favourite,
  };
}
