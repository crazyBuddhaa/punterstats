/**
 * Betting Report Card — pure analytics engine over a user's bet_journal.
 *
 * Pure module with zero I/O. Safe to import from server and client components
 * as well as unit tests.
 *
 * Reuses:
 *   - betProfit, betReturn from @/lib/bet-assist/journal
 *   - scoreCalibration from @/lib/calibration/scorer
 *   - mulberry32 from @/lib/simulation/rng
 */

import { betProfit, betReturn, type JournalBet } from "@/lib/bet-assist/journal";
import {
  scoreCalibration,
  type CalibrationBucket,
  type CalibrationSummary,
  type ResolvedPrediction,
} from "@/lib/calibration/scorer";
import { mulberry32 } from "@/lib/simulation/rng";
import { round } from "@/lib/bet-assist/calculators";
import { getLeakLesson, type LeakId, type LeakSeverity, type ReportCardLeak } from "./leaks";

// ── Documented threshold constants ───────────────────────────────────────────

/** Minimum non-void settled bets required before issuing a non-"too_early" verdict. */
export const MIN_SETTLED_FOR_VERDICT = 50;

/** Minimum bets with closing odds required for the "early_skill_signs" verdict. */
export const MIN_CLV_SAMPLES_FOR_SKILL = 30;

/** Minimum mean CLV (strictly > 0) required for "early_skill_signs". */
export const CLV_SKILL_THRESHOLD = 0;

/** ROI threshold for confidence interval comparison (0 = break-even). */
export const ROI_ZERO_THRESHOLD = 0;

/** Default minimum segment sample size before a leak rule can fire. */
export const DEFAULT_MIN_LEAK_SAMPLE = 15;

/** Number of bootstrap resamples used to estimate the ROI confidence interval. */
export const BOOTSTRAP_RESAMPLES = 1000;

/** Confidence level for the bootstrap ROI interval (95% -> 2.5th to 97.5th percentile). */
export const BOOTSTRAP_CONFIDENCE = 0.95;

/** Default deterministic PRNG seed for bootstrap resampling. */
export const DEFAULT_BOOTSTRAP_SEED = 42;

/** Stake spike multiplier relative to the median stake (>3x median). */
export const STAKE_SPIKE_MULTIPLIER = 3;

/** Consecutive settled losses before checking for a loss-chasing stake increase. */
export const CHASING_MIN_LOSS_STREAK = 2;

/** Stake multiplier relative to the prior bet / median after a loss streak to flag chasing. */
export const CHASING_STAKE_MULTIPLIER = 1.5;

/** Odds threshold above which an accumulator or multi-leg selection is counted as a long accumulator. */
export const LONG_ACCA_MIN_ODDS = 5.0;

export const ODDS_BANDS = [
  { key: "<1.5", label: "Under 1.50", min: 1, max: 1.5 },
  { key: "1.5-2", label: "1.50 – 1.99", min: 1.5, max: 2.0 },
  { key: "2-3", label: "2.00 – 2.99", min: 2.0, max: 3.0 },
  { key: "3-5", label: "3.00 – 4.99", min: 3.0, max: 5.0 },
  { key: "5+", label: "5.00+", min: 5.0, max: Number.POSITIVE_INFINITY },
] as const;

export type OddsBandKey = (typeof ODDS_BANDS)[number]["key"];

export type ReportCardVerdict =
  | "too_early"
  | "no_edge_yet"
  | "early_skill_signs"
  | "losing_to_margin";

export interface SegmentBreakdown {
  key: string;
  label: string;
  bets: number;
  wins: number;
  staked: number;
  returned: number;
  profit: number;
  roi: number;
  strikeRate: number;
  /** Mean implied probability (1 / odds) of settled bets in this segment. */
  breakEvenRate: number;
  avgOdds: number;
}

export interface RoiConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
  /**
   * Non-parametric percentile bootstrap over settled bets (1,000 resamples
   * with replacement using seeded mulberry32 PRNG). Chosen over normal SE
   * because betting returns are right-skewed (especially at higher odds).
   */
  method: "bootstrap";
  resamples: number;
  seed: number;
}

export interface ClvSummary {
  /** Mean of (odds / closing_odds - 1) across settled non-void bets with closing_odds > 1. */
  mean: number | null;
  sampleCount: number;
  /** Share of CLV-tracked bets where taken odds beat closing odds (odds > closing_odds). */
  positiveShare: number | null;
}

export interface ExpectedVsActualSummary {
  /** Sum of stake * (odds / closing_odds - 1) across settled bets with closing odds. */
  expectedProfit: number | null;
  /** Actual settled profit across those same bets with closing odds. */
  actualProfit: number | null;
  /** actualProfit - expectedProfit (positive = running above closing-implied expectation). */
  delta: number | null;
  sampleSize: number;
  /** Always true: 1 / closing_odds is a single-way implied probability that still carries margin. */
  isApproximate: true;
  approximationNote: string;
}

export interface ReportCardCalibration extends CalibrationSummary {
  /** Binary Brier score mean((yourProb - outcome)^2), equivalent to 3-way Brier / 2. */
  binaryBrierScore: number;
  /** Average user-estimated probability across settled bets with yourProb. */
  avgPredictedProb: number;
  /** Actual win frequency across settled bets with yourProb. */
  actualWinRate: number;
  /** Direct 5-bucket reliability curve on yourProb (0-20% through 80-100%). */
  userProbBuckets: CalibrationBucket[];
}

export interface BehaviourFlags {
  chasing: {
    detected: boolean;
    instances: number;
    postStreakAvgStake: number | null;
    medianStake: number;
  };
  stakeSpikes: {
    detected: boolean;
    count: number;
    maxSpikeRatio: number;
    medianStake: number;
    spikeBetIds: string[];
  };
  longAccumulatorShare: {
    share: number;
    count: number;
    accumulatorShare: number;
    accumulatorCount: number;
    totalSettled: number;
  };
}

export interface EquityPoint {
  index: number;
  date: string;
  profit: number;
  drawdown: number;
}

export interface ReportCard {
  totalBets: number;
  settledBets: number;
  pendingBets: number;
  voidBets: number;
  wins: number;
  losses: number;
  staked: number;
  returned: number;
  profit: number;
  roi: number;
  strikeRate: number;
  /** Mean implied probability (1 / odds) across settled non-void bets. */
  breakEvenRate: number;
  /** strikeRate - breakEvenRate. */
  strikeVsBreakEven: number;
  maxDrawdown: number;
  equityCurve: EquityPoint[];
  clv: ClvSummary;
  calibration: ReportCardCalibration;
  expectedVsActual: ExpectedVsActualSummary;
  breakdowns: {
    byMarket: SegmentBreakdown[];
    byOddsBand: SegmentBreakdown[];
    byBookmaker: SegmentBreakdown[];
    byStakeTertile: SegmentBreakdown[];
    byBetType: SegmentBreakdown[];
    betTypeNote: string;
  };
  behaviourFlags: BehaviourFlags;
  roiInterval: RoiConfidenceInterval;
  verdict: ReportCardVerdict;
  verdictTitle: string;
  verdictExplanation: string;
  leaks: ReportCardLeak[];
}

export interface ComputeReportCardOptions {
  /** Minimum sample size per segment before emitting a leak (default 15). */
  minLeakSample?: number;
  /** Seed for the 1,000-resample bootstrap ROI confidence interval (default 42). */
  bootstrapSeed?: number;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Consistent with betProfit: a settled non-void bet counts as a winning
 * outcome when betProfit(b) > 0 (covers "won", "half_won", and above-stake
 * "cashed_out") and as a losing outcome when betProfit(b) < 0 (covers "lost",
 * "half_lost", and below-stake "cashed_out").
 */
export function isBetWin(b: Pick<JournalBet, "status" | "odds" | "stake" | "cashoutAmount">): boolean {
  return betProfit(b) > 0;
}

export function isBetLoss(b: Pick<JournalBet, "status" | "odds" | "stake" | "cashoutAmount">): boolean {
  return betProfit(b) < 0;
}

const ACCA_PATTERN = /\b(acca|accumulator|parlay|multi|treble|double|\d+\s*-\s*fold|\d+\s+legs?)\b/i;
const MULTI_LEG_DELIM = /\s*(?:\+|&|\/|\band\b)\s*/i;

export function isAccumulatorBet(
  b: Pick<JournalBet, "market" | "selection" | "notes" | "legCount">,
): boolean {
  if (typeof b.legCount === "number" && Number.isFinite(b.legCount)) {
    if (b.legCount >= 2) return true;
  }
  const market = (b.market ?? "").trim();
  if (market.toLowerCase() === "accumulator") return true;
  if (ACCA_PATTERN.test(market) || ACCA_PATTERN.test(b.selection ?? "")) return true;
  if (b.notes && ACCA_PATTERN.test(b.notes)) return true;
  return false;
}

export function isLongAccumulatorBet(
  b: Pick<JournalBet, "market" | "selection" | "notes" | "odds" | "legCount">,
): boolean {
  if (typeof b.legCount === "number" && Number.isFinite(b.legCount)) {
    if (b.legCount >= 4) return true;
    if (b.legCount >= 2 && b.odds >= LONG_ACCA_MIN_ODDS) return true;
    if (b.legCount === 1 && (b.market ?? "").trim().toLowerCase() !== "accumulator") {
      return false;
    }
  }
  if (!isAccumulatorBet(b)) return false;
  if (b.odds >= LONG_ACCA_MIN_ODDS) return true;
  const foldMatch = `${b.market} ${b.selection} ${b.notes ?? ""}`.match(/(\d+)\s*-\s*fold|(\d+)\s+legs?/i);
  if (foldMatch) {
    const legs = Number(foldMatch[1] ?? foldMatch[2]);
    if (Number.isFinite(legs) && legs >= 4) return true;
  }
  const parts = (b.selection ?? "").split(MULTI_LEG_DELIM).filter(Boolean);
  return parts.length >= 4;
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildSegment(key: string, label: string, bets: JournalBet[]): SegmentBreakdown {
  let staked = 0;
  let returned = 0;
  let wins = 0;
  let impliedSum = 0;
  let oddsSum = 0;

  for (const b of bets) {
    const ret = betReturn(b);
    staked += b.stake;
    returned += ret;
    if (isBetWin(b)) wins += 1;
    impliedSum += 1 / b.odds;
    oddsSum += b.odds;
  }

  const count = bets.length;
  const profit = returned - staked;

  return {
    key,
    label,
    bets: count,
    wins,
    staked: round(staked, 2),
    returned: round(returned, 2),
    profit: round(profit, 2),
    roi: staked > 0 ? round(profit / staked, 4) : 0,
    strikeRate: count > 0 ? round(wins / count, 4) : 0,
    breakEvenRate: count > 0 ? round(impliedSum / count, 4) : 0,
    avgOdds: count > 0 ? round(oddsSum / count, 3) : 0,
  };
}

function computeStakeTertiles(settled: JournalBet[]): SegmentBreakdown[] {
  const keys = [
    { key: "small", label: "Small (1st tertile)" },
    { key: "medium", label: "Medium (2nd tertile)" },
    { key: "large", label: "Large (3rd tertile)" },
  ];

  if (settled.length === 0) {
    return keys.map(({ key, label }) => buildSegment(key, label, []));
  }

  const sortedStakes = settled.map((b) => b.stake).sort((a, b) => a - b);
  const n = sortedStakes.length;
  const q1 = sortedStakes[Math.floor((n - 1) / 3)];
  const q2 = sortedStakes[Math.floor((2 * (n - 1)) / 3)];

  // Use natural value cutoffs when stakes have enough spread to populate all 3 tertiles
  if (q1 < q2) {
    const low = settled.filter((b) => b.stake <= q1);
    const mid = settled.filter((b) => b.stake > q1 && b.stake <= q2);
    const high = settled.filter((b) => b.stake > q2);
    if (low.length > 0 && mid.length > 0 && high.length > 0) {
      return [
        buildSegment("small", `Small (≤ ${round(q1, 2)})`, low),
        buildSegment("medium", `Medium (${round(q1, 2)} – ${round(q2, 2)})`, mid),
        buildSegment("large", `Large (> ${round(q2, 2)})`, high),
      ];
    }
  }

  // Fallback for flat or heavily tied stakes: rank-order partition into 3 slices
  const byStakeAsc = [...settled].sort((a, b) => a.stake - b.stake);
  const cut1 = Math.ceil(n / 3);
  const cut2 = Math.ceil((2 * n) / 3);
  return [
    buildSegment("small", keys[0].label, byStakeAsc.slice(0, cut1)),
    buildSegment("medium", keys[1].label, byStakeAsc.slice(cut1, cut2)),
    buildSegment("large", keys[2].label, byStakeAsc.slice(cut2)),
  ];
}

/**
 * Computes a 95% confidence interval for ROI via seeded non-parametric
 * bootstrap (1,000 resamples with replacement over settled non-void bets).
 */
export function computeBootstrapRoiInterval(
  settled: JournalBet[],
  seed = DEFAULT_BOOTSTRAP_SEED,
  resamples = BOOTSTRAP_RESAMPLES,
): RoiConfidenceInterval {
  const n = settled.length;
  if (n === 0) {
    return {
      lower: 0,
      upper: 0,
      confidence: BOOTSTRAP_CONFIDENCE,
      method: "bootstrap",
      resamples,
      seed,
    };
  }

  const profits = settled.map((b) => betProfit(b));
  const stakes = settled.map((b) => b.stake);

  if (n === 1) {
    const singleRoi = stakes[0] > 0 ? round(profits[0] / stakes[0], 4) : 0;
    return {
      lower: singleRoi,
      upper: singleRoi,
      confidence: BOOTSTRAP_CONFIDENCE,
      method: "bootstrap",
      resamples,
      seed,
    };
  }

  const rng = mulberry32(seed);
  const sampleRois: number[] = new Array(resamples);

  for (let r = 0; r < resamples; r++) {
    let pSum = 0;
    let sSum = 0;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(rng() * n);
      pSum += profits[idx];
      sSum += stakes[idx];
    }
    sampleRois[r] = sSum > 0 ? pSum / sSum : 0;
  }

  sampleRois.sort((a, b) => a - b);
  const alpha = (1 - BOOTSTRAP_CONFIDENCE) / 2;
  const lowIdx = Math.max(0, Math.min(resamples - 1, Math.floor(alpha * resamples)));
  const highIdx = Math.max(0, Math.min(resamples - 1, Math.floor((1 - alpha) * resamples)));

  return {
    lower: round(sampleRois[lowIdx], 4),
    upper: round(sampleRois[highIdx], 4),
    confidence: BOOTSTRAP_CONFIDENCE,
    method: "bootstrap",
    resamples,
    seed,
  };
}

const USER_PROB_BUCKETS = [
  { label: "0-20%", min: 0, max: 0.2 },
  { label: "20-40%", min: 0.2, max: 0.4 },
  { label: "40-60%", min: 0.4, max: 0.6 },
  { label: "60-80%", min: 0.6, max: 0.8 },
  { label: "80-100%", min: 0.8, max: 1.01 },
];

function computeBetCalibration(settled: JournalBet[]): ReportCardCalibration {
  const withProb = settled.filter(
    (b) => b.yourProb !== null && Number.isFinite(b.yourProb) && b.yourProb > 0 && b.yourProb < 1,
  );

  // Map each binary bet into ResolvedPrediction to reuse scoreCalibration from lib/calibration/scorer.ts
  const mapped: ResolvedPrediction[] = withProb.map((b) => {
    const p = b.yourProb as number;
    return {
      predictedHomeWinProb: p,
      predictedDrawProb: 0,
      predictedAwayWinProb: 1 - p,
      actualResult: isBetWin(b) ? "home_win" : "away_win",
      createdAt: b.settledAt ?? b.placedAt,
    };
  });

  const base = scoreCalibration(mapped);

  const userProbBuckets: CalibrationBucket[] = USER_PROB_BUCKETS.map(({ label, min, max }) => {
    const inBucket = withProb.filter((b) => {
      const p = b.yourProb as number;
      return p >= min && p < max;
    });
    const count = inBucket.length;
    const predictedSum = inBucket.reduce((s, b) => s + (b.yourProb as number), 0);
    const wins = inBucket.filter((b) => isBetWin(b)).length;
    return {
      bucketLabel: label,
      bucketMin: min,
      bucketMax: max,
      predictedAvg: count > 0 ? round(predictedSum / count, 4) : 0,
      actualFrequency: count > 0 ? round(wins / count, 4) : 0,
      sampleSize: count,
    };
  });

  const avgPredictedProb =
    withProb.length > 0
      ? round(withProb.reduce((s, b) => s + (b.yourProb as number), 0) / withProb.length, 4)
      : 0;
  const actualWinRate =
    withProb.length > 0
      ? round(withProb.filter((b) => isBetWin(b)).length / withProb.length, 4)
      : 0;

  return {
    ...base,
    binaryBrierScore: round(base.brierScore / 2, 4),
    avgPredictedProb,
    actualWinRate,
    userProbBuckets,
  };
}

function computeBehaviourFlags(settled: JournalBet[]): BehaviourFlags {
  const stakes = settled.map((b) => b.stake);
  const medianStake = round(computeMedian(stakes), 2);

  // 1. Chasing: stake increase (>= 1.5x prior stake or >= 1.5x median while increasing) after >= 2 consecutive losses
  let lossStreak = 0;
  let chasingInstances = 0;
  let postStreakStakeSum = 0;
  let postStreakCount = 0;

  for (let i = 0; i < settled.length; i++) {
    const b = settled[i];
    if (lossStreak >= CHASING_MIN_LOSS_STREAK && i > 0) {
      const prevStake = settled[i - 1].stake;
      postStreakCount += 1;
      postStreakStakeSum += b.stake;
      const jumpedVsPrev = prevStake > 0 && b.stake >= prevStake * CHASING_STAKE_MULTIPLIER;
      const jumpedVsMedian =
        medianStake > 0 && b.stake > prevStake && b.stake >= medianStake * CHASING_STAKE_MULTIPLIER;
      if (jumpedVsPrev || jumpedVsMedian) {
        chasingInstances += 1;
      }
    }

    if (isBetLoss(b)) {
      lossStreak += 1;
    } else if (isBetWin(b)) {
      lossStreak = 0;
    }
  }

  // 2. Stake spikes (> 3x the median stake)
  const spikeThreshold = medianStake * STAKE_SPIKE_MULTIPLIER;
  const spikeBets =
    medianStake > 0 ? settled.filter((b) => b.stake > spikeThreshold) : [];
  const maxStake = stakes.length > 0 ? Math.max(...stakes) : 0;
  const maxSpikeRatio = medianStake > 0 ? round(maxStake / medianStake, 2) : 0;

  // 3. Accumulator & long-accumulator share
  const accaBets = settled.filter((b) => isAccumulatorBet(b));
  const longAccaBets = settled.filter((b) => isLongAccumulatorBet(b));
  const totalSettled = settled.length;

  return {
    chasing: {
      detected: chasingInstances > 0,
      instances: chasingInstances,
      postStreakAvgStake:
        postStreakCount > 0 ? round(postStreakStakeSum / postStreakCount, 2) : null,
      medianStake,
    },
    stakeSpikes: {
      detected: spikeBets.length > 0,
      count: spikeBets.length,
      maxSpikeRatio,
      medianStake,
      spikeBetIds: spikeBets.map((b) => b.id),
    },
    longAccumulatorShare: {
      share: totalSettled > 0 ? round(longAccaBets.length / totalSettled, 4) : 0,
      count: longAccaBets.length,
      accumulatorShare: totalSettled > 0 ? round(accaBets.length / totalSettled, 4) : 0,
      accumulatorCount: accaBets.length,
      totalSettled,
    },
  };
}

function determineVerdict(
  settledCount: number,
  roiInterval: RoiConfidenceInterval,
  clv: ClvSummary,
): { verdict: ReportCardVerdict; title: string; explanation: string } {
  if (settledCount < MIN_SETTLED_FOR_VERDICT) {
    const remaining = MIN_SETTLED_FOR_VERDICT - settledCount;
    return {
      verdict: "too_early",
      title: "Too early to tell",
      explanation: `You have ${settledCount} settled bet${settledCount === 1 ? "" : "s"} (${remaining} more needed to reach ${MIN_SETTLED_FOR_VERDICT}). At small sample sizes, short-term variance dominates any underlying signal.`,
    };
  }

  if (roiInterval.upper < ROI_ZERO_THRESHOLD) {
    return {
      verdict: "losing_to_margin",
      title: "Losing to bookmaker margin",
      explanation:
        "Across your settled sample, the 95% ROI confidence interval sits entirely below break-even. Bookmaker overround or price selection is eroding your bankroll over time.",
    };
  }

  if (
    clv.mean !== null &&
    clv.mean > CLV_SKILL_THRESHOLD &&
    clv.sampleCount >= MIN_CLV_SAMPLES_FOR_SKILL &&
    roiInterval.lower <= ROI_ZERO_THRESHOLD &&
    roiInterval.upper >= ROI_ZERO_THRESHOLD
  ) {
    return {
      verdict: "early_skill_signs",
      title: "Early signs of price-finding skill",
      explanation: `You are beating the closing line on average across ${clv.sampleCount} tracked bets while your ROI confidence interval still spans break-even. Beating the closing price is an encouraging process indicator, though variance still governs short-run returns.`,
    };
  }

  return {
    verdict: "no_edge_yet",
    title: "No statistically clear edge yet",
    explanation:
      "Your ROI confidence interval spans break-even and there is not yet enough positive closing-line evidence to separate skill from normal variance. Keep logging closing odds and reviewing leaks.",
  };
}

function makeLeak(
  id: LeakId,
  severity: LeakSeverity,
  message: string,
  sampleSize: number,
): ReportCardLeak {
  const mapping = getLeakLesson(id);
  return {
    id,
    severity,
    message,
    lessonSlug: mapping.fullSlug,
    lessonTitle: mapping.lessonTitle,
    lessonHref: mapping.href,
    sampleSize,
  };
}

function detectLeaks(
  settled: JournalBet[],
  clv: ClvSummary,
  calibration: ReportCardCalibration,
  byMarket: SegmentBreakdown[],
  byOddsBand: SegmentBreakdown[],
  byStakeTertile: SegmentBreakdown[],
  behaviourFlags: BehaviourFlags,
  minSample: number,
): ReportCardLeak[] {
  const leaks: ReportCardLeak[] = [];

  // 1. Longshot bias: bets at odds >= 3.0 with sample >= minSample and ROI < -10%
  const highOddsBets = settled.filter((b) => b.odds >= 3.0);
  if (highOddsBets.length >= minSample) {
    const seg = buildSegment("3+", "Odds 3.00+", highOddsBets);
    if (seg.roi < -0.1) {
      leaks.push(
        makeLeak(
          "longshot_bias",
          seg.roi < -0.25 ? "high" : "medium",
          `Across ${seg.bets} settled bets at odds of 3.00 or higher, your ROI is ${(seg.roi * 100).toFixed(1)}%. Bookmakers often load extra margin onto longshots.`,
          seg.bets,
        ),
      );
    }
  } else {
    // Also check individual 3-5 or 5+ band if either has >= minSample
    const bandLong = byOddsBand.find((b) => (b.key === "3-5" || b.key === "5+") && b.bets >= minSample && b.roi < -0.1);
    if (bandLong) {
      leaks.push(
        makeLeak(
          "longshot_bias",
          bandLong.roi < -0.25 ? "high" : "medium",
          `In the ${bandLong.label} odds band (${bandLong.bets} bets), your ROI is ${(bandLong.roi * 100).toFixed(1)}%.`,
          bandLong.bets,
        ),
      );
    }
  }

  // 2. Accumulator drain: >= minSample accumulator bets with ROI < -5%, OR >= minSample total bets with long-acca share >= 20%
  const accaBets = settled.filter((b) => isAccumulatorBet(b));
  if (accaBets.length >= minSample) {
    const accaSeg = buildSegment("accumulator", "Accumulators", accaBets);
    if (accaSeg.roi < -0.05) {
      leaks.push(
        makeLeak(
          "accumulator_drain",
          accaSeg.roi < -0.2 ? "high" : "medium",
          `Your ${accaSeg.bets} accumulator bets have returned ${(accaSeg.roi * 100).toFixed(1)}% ROI. Every extra leg compounds the bookmaker's overround.`,
          accaSeg.bets,
        ),
      );
    }
  } else if (
    settled.length >= minSample &&
    behaviourFlags.longAccumulatorShare.share >= 0.25
  ) {
    leaks.push(
      makeLeak(
        "accumulator_drain",
        "medium",
        `${Math.round(behaviourFlags.longAccumulatorShare.share * 100)}% of your settled bets (${settled.length} total) are long accumulators, where margin compounds on every leg.`,
        settled.length,
      ),
    );
  }

  // 3. Chasing losses: >= minSample settled bets and stake jumps after a losing streak
  if (settled.length >= minSample && behaviourFlags.chasing.detected) {
    leaks.push(
      makeLeak(
        "chasing_losses",
        behaviourFlags.chasing.instances >= 3 ? "high" : "medium",
        `We spotted ${behaviourFlags.chasing.instances} instance${behaviourFlags.chasing.instances === 1 ? "" : "s"} across ${settled.length} bets where your stake jumped by 50%+ right after a losing streak.`,
        settled.length,
      ),
    );
  }

  // 4. Stake spikes: >= minSample settled bets and at least 1 bet > 3x median stake
  if (settled.length >= minSample && behaviourFlags.stakeSpikes.detected) {
    leaks.push(
      makeLeak(
        "stake_spikes",
        behaviourFlags.stakeSpikes.maxSpikeRatio >= 5 ? "high" : "medium",
        `${behaviourFlags.stakeSpikes.count} bet${behaviourFlags.stakeSpikes.count === 1 ? " was" : "s were"} staked at more than 3× your median stake (${behaviourFlags.stakeSpikes.medianStake}), up to ${behaviourFlags.stakeSpikes.maxSpikeRatio}× median.`,
        settled.length,
      ),
    );
  }

  // 5. Negative CLV: >= minSample bets with closing odds and mean CLV < -1%
  if (clv.sampleCount >= minSample && clv.mean !== null && clv.mean < -0.01) {
    leaks.push(
      makeLeak(
        "negative_clv",
        clv.mean < -0.03 ? "high" : "medium",
        `Across ${clv.sampleCount} bets with closing odds, your average closing-line value is ${(clv.mean * 100).toFixed(1)}%. Consistently taking prices below the close makes breaking even much harder.`,
        clv.sampleCount,
      ),
    );
  }

  // 6. Poor calibration: >= minSample bets with yourProb and (Brier > 0.55 or overconfidence > 8%)
  if (calibration.sampleSize >= minSample) {
    const overconfidence = calibration.avgPredictedProb - calibration.actualWinRate;
    if (calibration.brierScore > 0.55 || Math.abs(overconfidence) > 0.08) {
      const detail =
        overconfidence > 0.08
          ? `your average estimated chance (${Math.round(calibration.avgPredictedProb * 100)}%) is higher than your actual hit rate (${Math.round(calibration.actualWinRate * 100)}%)`
          : `your Brier score is ${calibration.brierScore.toFixed(3)}`;
      leaks.push(
        makeLeak(
          "poor_calibration",
          calibration.brierScore > 0.65 || overconfidence > 0.15 ? "high" : "medium",
          `Across ${calibration.sampleSize} bets with probability estimates, ${detail}. Tightening probability calibration helps avoid overstating value.`,
          calibration.sampleSize,
        ),
      );
    }
  }

  // 7. Weak market segment: worst market with >= minSample bets and ROI < -15%
  const weakMarkets = byMarket
    .filter((m) => m.key.toLowerCase() !== "accumulator" && m.bets >= minSample && m.roi < -0.15)
    .sort((a, b) => a.roi - b.roi);
  if (weakMarkets.length > 0) {
    const worst = weakMarkets[0];
    leaks.push(
      makeLeak(
        "weak_market_segment",
        worst.roi < -0.25 ? "high" : "medium",
        `Your "${worst.label}" market has ${worst.bets} settled bets at ${(worst.roi * 100).toFixed(1)}% ROI (${worst.profit >= 0 ? "+" : ""}${worst.profit.toFixed(2)}).`,
        worst.bets,
      ),
    );
  }

  // 8. Oversized stakes underperforming: Large tertile has >= minSample bets, ROI < -10%, and trails Small tertile
  const smallTertile = byStakeTertile.find((t) => t.key === "small");
  const largeTertile = byStakeTertile.find((t) => t.key === "large");
  if (
    largeTertile &&
    smallTertile &&
    largeTertile.bets >= minSample &&
    largeTertile.roi < -0.1 &&
    largeTertile.roi < smallTertile.roi - 0.05
  ) {
    leaks.push(
      makeLeak(
        "oversized_stakes_underperforming",
        "medium",
        `Your largest stake tertile (${largeTertile.bets} bets) has a ${(largeTertile.roi * 100).toFixed(1)}% ROI, trailing your smallest stake tertile (${(smallTertile.roi * 100).toFixed(1)}% ROI).`,
        largeTertile.bets,
      ),
    );
  }

  // 9. Missing closing odds: >= minSample settled bets and < 20% have closing odds
  if (settled.length >= minSample && clv.sampleCount / settled.length < 0.2) {
    leaks.push(
      makeLeak(
        "missing_closing_odds",
        "low",
        `Only ${clv.sampleCount} of your ${settled.length} settled bets include closing odds. Recording kick-off prices is the fastest way to measure whether you are beating the market.`,
        settled.length,
      ),
    );
  }

  const severityOrder: Record<LeakSeverity, number> = { high: 0, medium: 1, low: 2 };
  return leaks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ── Public entrypoint ────────────────────────────────────────────────────────

export function computeReportCard(
  bets: JournalBet[],
  options: ComputeReportCardOptions = {},
): ReportCard {
  const minLeakSample = options.minLeakSample ?? DEFAULT_MIN_LEAK_SAMPLE;
  const bootstrapSeed = options.bootstrapSeed ?? DEFAULT_BOOTSTRAP_SEED;

  const pendingBets = bets.filter((b) => b.status === "pending").length;
  const voidBets = bets.filter((b) => b.status === "void").length;

  // Exclude pending and void bets from settled metrics
  const settled = bets
    .filter((b) => b.status !== "pending" && b.status !== "void")
    .sort(
      (a, b) =>
        new Date(a.settledAt ?? a.placedAt).getTime() -
        new Date(b.settledAt ?? b.placedAt).getTime(),
    );

  let staked = 0;
  let returned = 0;
  let wins = 0;
  let losses = 0;
  let impliedProbSum = 0;
  let cumProfit = 0;
  let peakProfit = 0;
  let maxDrawdown = 0;
  const equityCurve: EquityPoint[] = [];

  for (let i = 0; i < settled.length; i++) {
    const b = settled[i];
    const ret = betReturn(b);
    const p = betProfit(b);

    staked += b.stake;
    returned += ret;
    if (p > 0) wins += 1;
    else if (p < 0) losses += 1;

    impliedProbSum += 1 / b.odds;
    cumProfit += p;
    if (cumProfit > peakProfit) {
      peakProfit = cumProfit;
    }
    const dd = peakProfit - cumProfit;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }

    equityCurve.push({
      index: i + 1,
      date: b.settledAt ?? b.placedAt,
      profit: round(cumProfit, 2),
      drawdown: round(dd, 2),
    });
  }

  const settledBets = settled.length;
  const profit = round(returned - staked, 2);
  const roi = staked > 0 ? round((returned - staked) / staked, 4) : 0;
  const strikeRate = settledBets > 0 ? round(wins / settledBets, 4) : 0;
  const breakEvenRate = settledBets > 0 ? round(impliedProbSum / settledBets, 4) : 0;
  const strikeVsBreakEven = settledBets > 0 ? round(strikeRate - breakEvenRate, 4) : 0;

  // CLV & Expected vs Actual profit on settled non-void bets with closing_odds > 1
  const clvBets = settled.filter(
    (b) => b.closingOdds !== null && Number.isFinite(b.closingOdds) && (b.closingOdds as number) > 1,
  );
  const clvSampleCount = clvBets.length;
  const clvMean =
    clvSampleCount > 0
      ? round(
          clvBets.reduce((s, b) => s + (b.odds / (b.closingOdds as number) - 1), 0) / clvSampleCount,
          4,
        )
      : null;
  const clvPositiveShare =
    clvSampleCount > 0
      ? round(
          clvBets.filter((b) => b.odds > (b.closingOdds as number)).length / clvSampleCount,
          4,
        )
      : null;

  const clv: ClvSummary = {
    mean: clvMean,
    sampleCount: clvSampleCount,
    positiveShare: clvPositiveShare,
  };

  const expectedProfit =
    clvSampleCount > 0
      ? round(
          clvBets.reduce((s, b) => s + b.stake * (b.odds / (b.closingOdds as number) - 1), 0),
          2,
        )
      : null;
  const actualProfitOnClv =
    clvSampleCount > 0 ? round(clvBets.reduce((s, b) => s + betProfit(b), 0), 2) : null;

  const expectedVsActual: ExpectedVsActualSummary = {
    expectedProfit,
    actualProfit: actualProfitOnClv,
    delta:
      expectedProfit !== null && actualProfitOnClv !== null
        ? round(actualProfitOnClv - expectedProfit, 2)
        : null,
    sampleSize: clvSampleCount,
    isApproximate: true,
    approximationNote:
      "Approximate: uses 1 / closing_odds as the baseline probability for each selection (single-way closing odds still include a small bookmaker margin).",
  };

  // Calibration
  const calibration = computeBetCalibration(settled);

  // Breakdowns
  const marketGroups = new Map<string, JournalBet[]>();
  const bookmakerGroups = new Map<string, JournalBet[]>();

  for (const b of settled) {
    const mKey = (b.market ?? "1X2").trim() || "1X2";
    const mList = marketGroups.get(mKey) ?? [];
    mList.push(b);
    marketGroups.set(mKey, mList);

    const bkKey = (b.bookmaker ?? "").trim() || "Unspecified";
    const bkList = bookmakerGroups.get(bkKey) ?? [];
    bkList.push(b);
    bookmakerGroups.set(bkKey, bkList);
  }

  const byMarket = [...marketGroups.entries()]
    .map(([m, list]) => buildSegment(m, m, list))
    .sort((a, b) => b.bets - a.bets || b.staked - a.staked);

  const byOddsBand = ODDS_BANDS.map(({ key, label, min, max }) =>
    buildSegment(
      key,
      label,
      settled.filter((b) => b.odds >= min && b.odds < max),
    ),
  );

  const byBookmaker = [...bookmakerGroups.entries()]
    .map(([bk, list]) => buildSegment(bk, bk, list))
    .sort((a, b) => b.bets - a.bets || b.staked - a.staked);

  const byStakeTertile = computeStakeTertiles(settled);

  const singles = settled.filter((b) => !isAccumulatorBet(b));
  const accumulators = settled.filter((b) => isAccumulatorBet(b));
  const byBetType: SegmentBreakdown[] = [
    buildSegment("single", "Single", singles),
    buildSegment("accumulator", "Accumulator", accumulators),
  ];

  const betTypeNote =
    "Uses bet_journal.leg_count (1 = Single, ≥2 = Accumulator, ≥4 = Long accumulator), with automatic fallback to market = 'Accumulator' or multi-leg selection keywords for legacy entries.";

  // Behaviour flags
  const behaviourFlags = computeBehaviourFlags(settled);

  // ROI confidence interval via seeded bootstrap
  const roiInterval = computeBootstrapRoiInterval(settled, bootstrapSeed);

  // Verdict
  const { verdict, title: verdictTitle, explanation: verdictExplanation } = determineVerdict(
    settledBets,
    roiInterval,
    clv,
  );

  // Leaks
  const leaks = detectLeaks(
    settled,
    clv,
    calibration,
    byMarket,
    byOddsBand,
    byStakeTertile,
    behaviourFlags,
    minLeakSample,
  );

  return {
    totalBets: bets.length,
    settledBets,
    pendingBets,
    voidBets,
    wins,
    losses,
    staked: round(staked, 2),
    returned: round(returned, 2),
    profit,
    roi,
    strikeRate,
    breakEvenRate,
    strikeVsBreakEven,
    maxDrawdown: round(maxDrawdown, 2),
    equityCurve,
    clv,
    calibration,
    expectedVsActual,
    breakdowns: {
      byMarket,
      byOddsBand,
      byBookmaker,
      byStakeTertile,
      byBetType,
      betTypeNote,
    },
    behaviourFlags,
    roiInterval,
    verdict,
    verdictTitle,
    verdictExplanation,
    leaks,
  };
}
