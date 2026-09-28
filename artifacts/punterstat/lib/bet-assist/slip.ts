/**
 * Bet Assist — bet slip checker.
 *
 * Takes the legs of a slip (single or accumulator) and returns an honest read
 * of it: combined odds, what the price implies, how much bookmaker margin is
 * compounded into it, expected value where the user supplies their own
 * probabilities, and a plain-language risk rating with warnings.
 */

import { expectedValue, round } from "./calculators";

export interface SlipLegInput {
  /** Free text, e.g. "Arsenal to win" or "Over 2.5 goals". */
  selection: string;
  /** Match or event the leg belongs to — used to flag same-game legs. */
  event?: string;
  decimalOdds: number;
  /** Optional: the user's own probability estimate for this leg (0–1). */
  yourProb?: number | null;
}

export type SlipRisk = "low" | "moderate" | "high" | "very_high";

export interface SlipLegAssessment extends SlipLegInput {
  impliedProb: number;
  /** Fair probability estimate after removing an assumed margin. */
  fairProb: number;
  ev: number | null;
}

export interface SlipAssessment {
  legs: SlipLegAssessment[];
  combinedOdds: number;
  potentialReturn: number;
  potentialProfit: number;
  /** Probability the price implies (1 / combined odds). */
  impliedProb: number;
  /** Estimated true probability after stripping the assumed per-leg margin. */
  fairProb: number;
  /** Bookmaker margin compounded across all legs. */
  compoundedMargin: number;
  /** Your probability for the whole slip, when every leg has one. */
  yourProb: number | null;
  /** Expected value per unit staked, using your probabilities when provided, otherwise the fair estimate. */
  ev: number;
  evSource: "yours" | "fair_estimate";
  /** Expected long-run loss/profit for this stake. */
  expectedReturnOnStake: number;
  risk: SlipRisk;
  /** Roughly how many times you'd expect to place this slip before it lands once. */
  oneWinEvery: number;
  warnings: string[];
  positives: string[];
}

export const DEFAULT_LEG_MARGIN = 0.05;

function riskFor(prob: number): SlipRisk {
  if (prob >= 0.5) return "low";
  if (prob >= 0.25) return "moderate";
  if (prob >= 0.08) return "high";
  return "very_high";
}

export function assessSlip(
  legsIn: SlipLegInput[],
  stake: number,
  perLegMargin = DEFAULT_LEG_MARGIN,
): SlipAssessment | null {
  const legsValid = legsIn.filter((l) => Number.isFinite(l.decimalOdds) && l.decimalOdds > 1);
  if (legsValid.length === 0 || !(stake > 0)) return null;

  const legs: SlipLegAssessment[] = legsValid.map((l) => {
    const impliedProb = 1 / l.decimalOdds;
    const fairProb = Math.min(0.999, impliedProb / (1 + perLegMargin));
    const yp = l.yourProb != null && l.yourProb > 0 && l.yourProb < 1 ? l.yourProb : null;
    return {
      ...l,
      yourProb: yp,
      impliedProb,
      fairProb,
      ev: yp !== null ? expectedValue(yp, l.decimalOdds) : null,
    };
  });

  const combinedOdds = legs.reduce((acc, l) => acc * l.decimalOdds, 1);
  const impliedProb = 1 / combinedOdds;
  const fairProb = legs.reduce((acc, l) => acc * l.fairProb, 1);
  const compoundedMargin = Math.pow(1 + perLegMargin, legs.length) - 1;
  const allYours = legs.every((l) => l.yourProb !== null);
  const yourProb = allYours ? legs.reduce((acc, l) => acc * (l.yourProb as number), 1) : null;
  const probForEv = yourProb ?? fairProb;
  const ev = expectedValue(probForEv, combinedOdds);

  const warnings: string[] = [];
  const positives: string[] = [];

  if (legs.length >= 5) {
    warnings.push(
      `${legs.length} legs compound roughly ${(compoundedMargin * 100).toFixed(0)}% of bookmaker margin into one price. Long accumulators are the most expensive bets you can place.`,
    );
  } else if (legs.length >= 3) {
    warnings.push(
      `Each extra leg multiplies in the bookmaker's margin — this slip carries about ${(compoundedMargin * 100).toFixed(0)}% compounded margin.`,
    );
  }

  const shortLegs = legs.filter((l) => l.decimalOdds < 1.25);
  if (shortLegs.length > 0 && legs.length > 1) {
    warnings.push(
      `${shortLegs.length} "banker" leg${shortLegs.length > 1 ? "s" : ""} under 1.25 add little return but still add risk and margin — one upset loses the whole slip.`,
    );
  }

  const events = legs.map((l) => l.event?.trim().toLowerCase()).filter((e): e is string => !!e);
  const dupes = events.filter((e, i) => events.indexOf(e) !== i);
  if (dupes.length > 0) {
    warnings.push(
      "Two or more legs are from the same event. Outcomes in one match are correlated, so bookmakers usually price same-game combinations with extra margin.",
    );
  }

  const negLegs = legs.filter((l) => l.ev !== null && l.ev < 0);
  if (negLegs.length > 0) {
    warnings.push(
      `By your own estimates, ${negLegs.length} leg${negLegs.length > 1 ? "s are" : " is"} priced below fair value (negative EV).`,
    );
  }

  if (yourProb !== null && ev > 0) {
    positives.push(
      `On your probabilities the slip has positive expected value (+${(ev * 100).toFixed(1)}% per unit). Make sure those estimates are well calibrated — check your Calibration dashboard.`,
    );
  }
  if (legs.length === 1) {
    positives.push("A single carries one margin, not a compounded one — the cheapest structure for a given selection.");
  }

  const risk = riskFor(probForEv);

  return {
    legs,
    combinedOdds: round(combinedOdds, 3),
    potentialReturn: round(stake * combinedOdds, 2),
    potentialProfit: round(stake * combinedOdds - stake, 2),
    impliedProb,
    fairProb,
    compoundedMargin,
    yourProb,
    ev,
    evSource: yourProb !== null ? "yours" : "fair_estimate",
    expectedReturnOnStake: round(stake * ev, 2),
    risk,
    oneWinEvery: probForEv > 0 ? Math.max(1, Math.round(1 / probForEv)) : Infinity,
    warnings,
    positives,
  };
}
