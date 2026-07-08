import type { Rng } from "./rng";
import { fit1x2Lambdas, resultSide, sampleScoreline, type OneXTwoProbs } from "./poisson";

/**
 * Two accumulator legs that back different outcomes of the SAME match (e.g.
 * "Home Win" and "Draw" on the same fixture) are not independent events —
 * only one of them can ever actually happen. Simulating each leg with its
 * own isolated Math.random() draw allows impossible combinations (both
 * legs "winning" on the same match). This module fixes that: legs sharing a
 * fixtureId are resolved from a single shared Poisson-model scoreline for
 * that match, so the correlation is respected.
 */
export interface CorrelatedLegInput {
  id: string;
  /** Odds-API event id. Legs sharing this id are treated as the same real-world match. */
  fixtureId?: string;
  /** Which 1X2 outcome this leg represents, if known. */
  side?: "home" | "draw" | "away";
  /** De-vigged fair 1X2 probabilities for the match this leg belongs to. */
  fixtureFairProbs?: OneXTwoProbs;
  /** Win probability to fall back to when the leg can't be tied to a shared scoreline (e.g. manual entry, non-h2h market, or a fixture with only one leg). */
  fallbackWinProb: number;
}

/**
 * Resolves win/loss for every leg. Legs that share a fixtureId (and have
 * side + fixtureFairProbs) are drawn from one shared Poisson scoreline per
 * fixture; everything else falls back to an independent Bernoulli draw.
 */
export function evaluateAccaLegs(rng: Rng, legs: CorrelatedLegInput[]): Map<string, boolean> {
  const results = new Map<string, boolean>();

  const byFixture = new Map<string, CorrelatedLegInput[]>();
  const independent: CorrelatedLegInput[] = [];

  for (const leg of legs) {
    if (leg.fixtureId && leg.side && leg.fixtureFairProbs) {
      const group = byFixture.get(leg.fixtureId) ?? [];
      group.push(leg);
      byFixture.set(leg.fixtureId, group);
    } else {
      independent.push(leg);
    }
  }

  for (const group of byFixture.values()) {
    // All legs in a group share the same fixture's fair probs — fit lambdas once per fixture.
    const { lambdaHome, lambdaAway } = fit1x2Lambdas(group[0].fixtureFairProbs!);
    const scoreline = sampleScoreline(rng, lambdaHome, lambdaAway);
    const side = resultSide(scoreline);
    for (const leg of group) {
      results.set(leg.id, leg.side === side);
    }
  }

  for (const leg of independent) {
    results.set(leg.id, rng() < leg.fallbackWinProb);
  }

  return results;
}
