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
export type MarketMarginTier = "main" | "secondary" | "combo";
export type LikelihoodLabel = "Very Likely" | "Likely" | "Balanced" | "Underdog" | "Longshot";
export type PriceVerdict = "Value" | "Fair" | "Tight" | "Expensive";

export interface SlipLegAssessment extends SlipLegInput {
  impliedProb: number;
  /** Fair probability estimate after removing an assumed margin. */
  fairProb: number;
  /** Best available probability for this leg: model/user prob if present, else fairProb. */
  effectiveProb: number;
  ev: number | null;
  /** Market margin tier inferred from selection text (main ~5%, secondary ~6.5%, combo ~11%). */
  marketTier: MarketMarginTier;
  marketMarginHint: number;
  /** Plain-English outcome likelihood label decoupled from price value. */
  likelihoodLabel: LikelihoodLabel;
  /** Plain-English price check label based on edge vs odds. */
  priceVerdict: PriceVerdict;
  /** For odds < 2.00, how many wins are needed to recover from 1 upset (e.g. 1.25 -> 4). */
  winsNeededPerLoss: number | null;
}

export interface CutBreakdown {
  /** Chance every leg lands. */
  allWinProb: number;
  /** Chance exactly 1 leg cuts the ticket. */
  cutByOneProb: number;
  /** Chance 2 or more legs fail. */
  cutByTwoPlusProb: number;
}

export interface TrimSuggestion {
  droppedIndices: number[];
  droppedLabels: string[];
  newOdds: number;
  newWinProb: number;
  /** Relative percentage increase in full-ticket win probability (e.g. +38%). */
  survivalBoostPct: number;
  /** Relative percentage drop in combined odds (e.g. -22%). */
  oddsDropPct: number;
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
  /** Best combined probability using model/user probs on matched legs and fairProb on unmatched legs. */
  effectiveProb: number;
  /** Number of legs that had an explicit model/user probability. */
  matchedLegCount: number;
  /** Bookmaker margin compounded across all legs. */
  compoundedMargin: number;
  /** Your probability for the whole slip, when every leg has one. */
  yourProb: number | null;
  /** Expected value per unit staked, using your probabilities when provided, blended on partial matches, otherwise fair estimate. */
  ev: number;
  evSource: "yours" | "blended" | "fair_estimate";
  /** Expected long-run loss/profit for this stake. */
  expectedReturnOnStake: number;
  risk: SlipRisk;
  /** Roughly how many times you'd expect to place this slip before it lands once. */
  oneWinEvery: number;
  /** Exact probabilities of all winning, missing by 1 leg, or missing by 2+ legs. */
  cutBreakdown: CutBreakdown;
  /** Suggested 1–2 high-drag legs to drop on multi-leg slips to boost survival. */
  trimSuggestion: TrimSuggestion | null;
  warnings: string[];
  positives: string[];
}

export const DEFAULT_LEG_MARGIN = 0.05;

export function classifyMarketTier(selection: string): { tier: MarketMarginTier; marginHint: number } {
  const s = selection.toLowerCase();
  // High-margin combo / exotic / bet-builder selections
  if (
    /\band\b|[&+]/.test(s) ||
    s.includes("correct score") ||
    s.includes("ht/ft") ||
    s.includes("half time/full time") ||
    s.includes("multigoal") ||
    s.includes("corner") ||
    s.includes("card") ||
    s.includes("booking") ||
    s.includes("anytime") ||
    s.includes("scorer") ||
    s.includes("shots")
  ) {
    return { tier: "combo", marginHint: 0.11 };
  }
  // Secondary goal/double-chance markets
  if (
    s.includes("double chance") ||
    /\b(1x|x2|12)\b/.test(s) ||
    s.includes("over 1.5") ||
    s.includes("over 3.5") ||
    s.includes("under 3.5") ||
    s.includes("over 0.5") ||
    s.includes("clean sheet") ||
    s.includes("team over") ||
    s.includes("home over") ||
    s.includes("away over")
  ) {
    return { tier: "secondary", marginHint: 0.065 };
  }
  return { tier: "main", marginHint: DEFAULT_LEG_MARGIN };
}

function likelihoodFor(prob: number): LikelihoodLabel {
  if (prob >= 0.72) return "Very Likely";
  if (prob >= 0.55) return "Likely";
  if (prob >= 0.38) return "Balanced";
  if (prob >= 0.2) return "Underdog";
  return "Longshot";
}

function priceVerdictFor(ev: number): PriceVerdict {
  if (ev >= 0.02) return "Value";
  if (ev >= -0.045) return "Fair";
  if (ev >= -0.1) return "Tight";
  return "Expensive";
}

function riskFor(prob: number): SlipRisk {
  if (prob >= 0.5) return "low";
  if (prob >= 0.25) return "moderate";
  if (prob >= 0.08) return "high";
  return "very_high";
}

function computeCutBreakdown(probs: number[]): CutBreakdown {
  const allWinProb = probs.reduce((acc, p) => acc * p, 1);
  if (probs.length === 1) {
    return {
      allWinProb,
      cutByOneProb: Math.max(0, 1 - allWinProb),
      cutByTwoPlusProb: 0,
    };
  }
  let cutByOneProb = 0;
  for (let k = 0; k < probs.length; k++) {
    let prod = 1 - probs[k];
    for (let j = 0; j < probs.length; j++) {
      if (j !== k) prod *= probs[j];
    }
    cutByOneProb += prod;
  }
  const cutByTwoPlusProb = Math.max(0, 1 - allWinProb - cutByOneProb);
  return { allWinProb, cutByOneProb, cutByTwoPlusProb };
}

function computeTrimSuggestion(
  legs: SlipLegAssessment[],
  combinedOdds: number,
  effectiveProb: number,
): TrimSuggestion | null {
  if (legs.length < 3 || effectiveProb <= 0) return null;

  // Score each leg by how much it drags survival relative to odds added
  const scored = legs
    .map((leg, idx) => {
      const legEv = leg.ev ?? expectedValue(leg.effectiveProb, leg.decimalOdds);
      let dragScore = 0;
      if (legEv < -0.06) dragScore += Math.abs(legEv) * 100;
      if (leg.decimalOdds < 1.3) dragScore += (1.35 - leg.decimalOdds) * 35;
      if (leg.marketTier === "combo") dragScore += 6;
      // Reward-to-risk inefficiency: probability lost per unit of log-odds gained
      const failRisk = 1 - leg.effectiveProb;
      const oddsLift = Math.max(0.05, leg.decimalOdds - 1);
      dragScore += (failRisk / oddsLift) * 4;
      return { idx, leg, dragScore };
    })
    .filter((x) => x.dragScore > 4.5)
    .sort((a, b) => b.dragScore - a.dragScore);

  if (scored.length === 0) return null;

  const maxDrop = legs.length >= 5 ? 2 : 1;
  const toDrop = scored.slice(0, maxDrop);
  const droppedSet = new Set(toDrop.map((x) => x.idx));

  let newOdds = 1;
  let newWinProb = 1;
  for (let i = 0; i < legs.length; i++) {
    if (droppedSet.has(i)) continue;
    newOdds *= legs[i].decimalOdds;
    newWinProb *= legs[i].effectiveProb;
  }

  const survivalBoostPct = Math.round(((newWinProb / effectiveProb) - 1) * 100);
  const oddsDropPct = Math.round((1 - newOdds / combinedOdds) * 100);
  if (survivalBoostPct < 10) return null;

  return {
    droppedIndices: toDrop.map((x) => x.idx),
    droppedLabels: toDrop.map((x) => `${x.leg.selection} (@${x.leg.decimalOdds.toFixed(2)})`),
    newOdds: round(newOdds, 2),
    newWinProb,
    survivalBoostPct,
    oddsDropPct,
  };
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
    const effectiveProb = yp ?? fairProb;
    const legEv = yp !== null ? expectedValue(yp, l.decimalOdds) : null;
    const { tier, marginHint } = classifyMarketTier(l.selection);
    const verdictEv = legEv ?? expectedValue(fairProb, l.decimalOdds);
    const winsNeededPerLoss =
      l.decimalOdds < 2 ? Math.max(1, Math.ceil(1 / (l.decimalOdds - 1))) : null;

    return {
      ...l,
      yourProb: yp,
      impliedProb,
      fairProb,
      effectiveProb,
      ev: legEv,
      marketTier: tier,
      marketMarginHint: marginHint,
      likelihoodLabel: likelihoodFor(effectiveProb),
      priceVerdict: priceVerdictFor(verdictEv),
      winsNeededPerLoss,
    };
  });

  const combinedOdds = legs.reduce((acc, l) => acc * l.decimalOdds, 1);
  const impliedProb = 1 / combinedOdds;
  const fairProb = legs.reduce((acc, l) => acc * l.fairProb, 1);
  const compoundedMargin = Math.pow(1 + perLegMargin, legs.length) - 1;
  const matchedLegCount = legs.filter((l) => l.yourProb !== null).length;
  const allYours = matchedLegCount === legs.length;
  const yourProb = allYours ? legs.reduce((acc, l) => acc * (l.yourProb as number), 1) : null;
  const effectiveProb = legs.reduce((acc, l) => acc * l.effectiveProb, 1);
  const evSource: SlipAssessment["evSource"] = allYours
    ? "yours"
    : matchedLegCount > 0
      ? "blended"
      : "fair_estimate";
  const ev = expectedValue(effectiveProb, combinedOdds);
  const cutBreakdown = computeCutBreakdown(legs.map((l) => l.effectiveProb));
  const trimSuggestion = computeTrimSuggestion(legs, combinedOdds, effectiveProb);

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

  const comboLegs = legs.filter((l) => l.marketTier === "combo");
  if (comboLegs.length > 0) {
    warnings.push(
      `${comboLegs.length} combo/exotic market leg${comboLegs.length > 1 ? "s" : ""} typically carry 9–15% bookmaker margin per leg (2x–3x higher than main 1X2 or Over/Under 2.5 markets).`,
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

  if (matchedLegCount > 0 && ev > 0) {
    positives.push(
      `On ${allYours ? "your" : "matched model"} probabilities the slip has positive expected value (+${(ev * 100).toFixed(1)}% per unit). Make sure those estimates are well calibrated — check your Calibration dashboard.`,
    );
  }
  if (legs.length === 1) {
    positives.push("A single carries one margin, not a compounded one — the cheapest structure for a given selection.");
  }

  const risk = riskFor(effectiveProb);

  return {
    legs,
    combinedOdds: round(combinedOdds, 3),
    potentialReturn: round(stake * combinedOdds, 2),
    potentialProfit: round(stake * combinedOdds - stake, 2),
    impliedProb,
    fairProb,
    effectiveProb,
    matchedLegCount,
    compoundedMargin,
    yourProb,
    ev,
    evSource,
    expectedReturnOnStake: round(stake * ev, 2),
    risk,
    oneWinEvery: effectiveProb > 0 ? Math.max(1, Math.round(1 / effectiveProb)) : Infinity,
    cutBreakdown,
    trimSuggestion,
    warnings,
    positives,
  };
}
