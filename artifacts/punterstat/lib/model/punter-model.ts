/**
 * Per-User Empirical Bayes Betting Behavior & Leak Model.
 *
 * Trains exclusively on the signed-in user's own settled `bet_journal` rows
 * (zero cross-user leakage, zero Python server required). Uses hierarchical
 * Empirical Bayes shrinkage so estimates stay stable on small samples (10-30 bets)
 * and converge smoothly to the user's true edge/leak profile as they upload more
 * CSV bet history.
 */

import { betProfit, type JournalBet } from "@/lib/bet-assist/journal";
import { ODDS_BANDS, type OddsBandKey } from "@/lib/report-card/metrics";

/** Default prior ROI (-5% typical bookmaker overround) for Empirical Bayes shrinkage. */
export const EB_PRIOR_ROI = -0.05;

/** Equivalent sample size of the prior (higher = more conservative shrinkage). */
export const EB_PRIOR_STRENGTH = 15;

export type ModelMaturity = "cold" | "warming" | "active" | "mature";

export interface ShrunkSegment {
  key: string;
  label: string;
  bets: number;
  wins: number;
  staked: number;
  profit: number;
  rawRoi: number;
  /** Empirical Bayes shrunk ROI: (n * rawRoi + k * priorRoi) / (n + k). */
  shrunkRoi: number;
  rawWinRate: number;
  /** Beta-Binomial shrunk win rate anchored to the segment's implied break-even rate. */
  shrunkWinRate: number;
  breakEvenRate: number;
  avgOdds: number;
}

export interface TiltProfile {
  currentLossStreak: number;
  medianStake: number;
  p90Stake: number;
  postLossInstances: number;
  postLossAvgStake: number | null;
  postLossStakeRatio: number | null;
  postLossRoi: number | null;
  /** 0-100 composite tilt risk score based on loss-chasing history + active streak. */
  tiltRiskScore: number;
  tiltLevel: "low" | "elevated" | "high";
}

export interface PunterBehaviorModel {
  trainedAt: string;
  settledBets: number;
  maturity: ModelMaturity;
  overallRawRoi: number;
  overallShrunkRoi: number;
  byOddsBand: ShrunkSegment[];
  byBetType: ShrunkSegment[];
  byBookmaker: ShrunkSegment[];
  byMarket: ShrunkSegment[];
  bestSegment: ShrunkSegment | null;
  worstSegment: ShrunkSegment | null;
  tilt: TiltProfile;
}

export interface SlipProfileInput {
  combinedOdds: number;
  legCount: number;
  stake: number;
  bookmaker?: string | null;
}

export interface PersonalSlipInsight {
  maturity: ModelMaturity;
  settledBets: number;
  /** Blended Empirical Bayes expected ROI for this user on this slip profile. */
  predictedRoi: number;
  riskLevel: "aligned" | "caution" | "high_leak";
  matchedOddsBand: ShrunkSegment | null;
  matchedBetType: ShrunkSegment | null;
  matchedBookmaker: ShrunkSegment | null;
  stakeRatioToMedian: number | null;
  warnings: string[];
  strengths: string[];
}

export function getOddsBandKey(odds: number): OddsBandKey {
  for (const band of ODDS_BANDS) {
    if (odds >= band.min && odds < band.max) return band.key;
  }
  return "5+";
}

export function getBetTypeKey(legCount: number, market?: string): "single" | "multi" | "long_acca" {
  const effectiveLegs =
    legCount >= 2 ? legCount : market && market.toLowerCase().includes("accum") ? 2 : 1;
  if (effectiveLegs <= 1) return "single";
  if (effectiveLegs <= 3) return "multi";
  return "long_acca";
}

const BET_TYPE_LABELS: Record<"single" | "multi" | "long_acca", string> = {
  single: "Singles (1 leg)",
  multi: "Short Accas (2–3 legs)",
  long_acca: "Long Accas (4+ legs)",
};

function normalizeBookmakerKey(bookmaker: string | null | undefined): string | null {
  if (!bookmaker) return null;
  const cleaned = bookmaker.trim().toLowerCase().replace(/\s+/g, " ");
  if (!cleaned) return null;
  // Normalize common country/code aliases (e.g. "sportybet_ng" / "sportybet (ng)" -> "sportybet")
  if (cleaned.startsWith("sportybet")) return "sportybet";
  if (cleaned.startsWith("bet9ja")) return "bet9ja";
  if (cleaned.startsWith("football.com") || cleaned === "footballcom") return "football.com";
  if (cleaned.startsWith("betking")) return "betking";
  if (cleaned.startsWith("1xbet") || cleaned === "onexbet") return "1xbet";
  if (cleaned.startsWith("msport")) return "msport";
  if (cleaned.startsWith("betway")) return "betway";
  if (cleaned.startsWith("22bet")) return "22bet";
  return cleaned;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

function buildShrunkSegments(
  bets: JournalBet[],
  keyFn: (b: JournalBet) => string | null,
  labelFn: (key: string) => string,
  priorRoi = EB_PRIOR_ROI,
  priorStrength = EB_PRIOR_STRENGTH,
): ShrunkSegment[] {
  const buckets = new Map<
    string,
    { label: string; bets: number; wins: number; staked: number; profit: number; impliedSum: number; oddsSum: number }
  >();

  for (const b of bets) {
    const key = keyFn(b);
    if (!key) continue;
    const entry = buckets.get(key) ?? {
      label: labelFn(key),
      bets: 0,
      wins: 0,
      staked: 0,
      profit: 0,
      impliedSum: 0,
      oddsSum: 0,
    };
    const profit = betProfit(b);
    entry.bets += 1;
    if (b.status === "won" || b.status === "half_won") entry.wins += 1;
    entry.staked += b.stake;
    entry.profit += profit;
    entry.impliedSum += b.odds > 1 ? 1 / b.odds : 0;
    entry.oddsSum += b.odds;
    buckets.set(key, entry);
  }

  return [...buckets.entries()]
    .map(([key, g]) => {
      const rawRoi = g.staked > 0 ? g.profit / g.staked : 0;
      const shrunkRoi = (g.bets * rawRoi + priorStrength * priorRoi) / (g.bets + priorStrength);
      const rawWinRate = g.bets > 0 ? g.wins / g.bets : 0;
      const breakEvenRate = g.bets > 0 ? g.impliedSum / g.bets : 0;
      const alpha0 = priorStrength * breakEvenRate;
      const shrunkWinRate = (g.wins + alpha0) / (g.bets + priorStrength);
      const avgOdds = g.bets > 0 ? g.oddsSum / g.bets : 0;

      return {
        key,
        label: g.label,
        bets: g.bets,
        wins: g.wins,
        staked: g.staked,
        profit: g.profit,
        rawRoi,
        shrunkRoi,
        rawWinRate,
        shrunkWinRate,
        breakEvenRate,
        avgOdds,
      };
    })
    .sort((a, b) => b.bets - a.bets);
}

function getMaturity(settledCount: number): ModelMaturity {
  if (settledCount < 10) return "cold";
  if (settledCount < 30) return "warming";
  if (settledCount < 100) return "active";
  return "mature";
}

/**
 * Train the personal Empirical Bayes behavior & leak model from a user's bet history.
 */
export function trainPunterModel(bets: JournalBet[]): PunterBehaviorModel {
  const settled = bets
    .filter((b) => b.status !== "pending" && b.status !== "void" && b.stake > 0 && b.odds > 1)
    .sort(
      (a, b) =>
        new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
    );

  const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
  const totalProfit = settled.reduce((s, b) => s + betProfit(b), 0);
  const overallRawRoi = totalStaked > 0 ? totalProfit / totalStaked : 0;
  const overallShrunkRoi =
    (settled.length * overallRawRoi + EB_PRIOR_STRENGTH * EB_PRIOR_ROI) /
    (settled.length + EB_PRIOR_STRENGTH);

  const byOddsBand = buildShrunkSegments(
    settled,
    (b) => getOddsBandKey(b.odds),
    (key) => ODDS_BANDS.find((band) => band.key === key)?.label ?? key,
  );

  const byBetType = buildShrunkSegments(
    settled,
    (b) => getBetTypeKey(b.legCount ?? 1, b.market),
    (key) => BET_TYPE_LABELS[key as keyof typeof BET_TYPE_LABELS] ?? key,
  );

  const bookieDisplayNames = new Map<string, string>();
  for (const b of settled) {
    const key = normalizeBookmakerKey(b.bookmaker);
    if (key && b.bookmaker && !bookieDisplayNames.has(key)) {
      bookieDisplayNames.set(key, b.bookmaker.trim());
    }
  }

  const byBookmaker = buildShrunkSegments(
    settled,
    (b) => normalizeBookmakerKey(b.bookmaker),
    (key) => bookieDisplayNames.get(key) ?? key,
  );

  const byMarket = buildShrunkSegments(
    settled,
    (b) => b.market.trim().toLowerCase() || null,
    (key) => {
      const sample = settled.find((b) => b.market.trim().toLowerCase() === key);
      return sample?.market.trim() ?? key;
    },
  );

  // Pick best & worst segments across odds bands, bet types, and bookmakers (min 5 bets)
  const candidateSegments = [...byOddsBand, ...byBetType, ...byBookmaker].filter((s) => s.bets >= 5);
  const sortedByRoi = [...candidateSegments].sort((a, b) => b.shrunkRoi - a.shrunkRoi);
  const bestSegment = sortedByRoi[0] ?? null;
  const worstSegment = sortedByRoi.length > 0 ? sortedByRoi[sortedByRoi.length - 1] : null;

  // Tilt & loss-chasing analysis
  const stakes = settled.map((b) => b.stake);
  const medianStake = median(stakes);
  const p90Stake = percentile(stakes, 0.9);

  let lossStreak = 0;
  let postLossInstances = 0;
  let postLossStakeSum = 0;
  let postLossProfitSum = 0;

  for (const b of settled) {
    if (lossStreak >= 2) {
      postLossInstances += 1;
      postLossStakeSum += b.stake;
      postLossProfitSum += betProfit(b);
    }
    if (b.status === "lost" || b.status === "half_lost") {
      lossStreak += 1;
    } else if (b.status === "won" || b.status === "half_won") {
      lossStreak = 0;
    }
  }

  const postLossAvgStake = postLossInstances > 0 ? postLossStakeSum / postLossInstances : null;
  const postLossStakeRatio =
    postLossAvgStake !== null && medianStake > 0 ? postLossAvgStake / medianStake : null;
  const postLossRoi =
    postLossInstances > 0 && postLossStakeSum > 0 ? postLossProfitSum / postLossStakeSum : null;

  // Composite 0-100 tilt risk score
  let tiltRiskScore = 0;
  if (postLossStakeRatio !== null && postLossStakeRatio > 1.2) {
    tiltRiskScore += Math.min(45, Math.round((postLossStakeRatio - 1.0) * 35));
  }
  if (postLossRoi !== null && postLossRoi < -0.1 && postLossInstances >= 3) {
    tiltRiskScore += Math.min(25, Math.round(Math.abs(postLossRoi) * 60));
  }
  if (lossStreak >= 2) {
    tiltRiskScore += Math.min(30, lossStreak * 10);
  }
  tiltRiskScore = Math.min(100, Math.max(0, tiltRiskScore));

  const tiltLevel: TiltProfile["tiltLevel"] =
    tiltRiskScore >= 55 ? "high" : tiltRiskScore >= 25 ? "elevated" : "low";

  return {
    trainedAt: new Date().toISOString(),
    settledBets: settled.length,
    maturity: getMaturity(settled.length),
    overallRawRoi,
    overallShrunkRoi,
    byOddsBand,
    byBetType,
    byBookmaker,
    byMarket,
    bestSegment,
    worstSegment,
    tilt: {
      currentLossStreak: lossStreak,
      medianStake,
      p90Stake,
      postLossInstances,
      postLossAvgStake,
      postLossStakeRatio,
      postLossRoi,
      tiltRiskScore,
      tiltLevel,
    },
  };
}

/**
 * Score a candidate slip in Slip Checker against the user's trained personal model.
 */
export function scoreSlipWithPunterModel(
  model: PunterBehaviorModel,
  slip: SlipProfileInput,
): PersonalSlipInsight {
  const oddsKey = getOddsBandKey(slip.combinedOdds);
  const typeKey = getBetTypeKey(slip.legCount);
  const bookieKey = normalizeBookmakerKey(slip.bookmaker);

  const matchedOddsBand = model.byOddsBand.find((s) => s.key === oddsKey) ?? null;
  const matchedBetType = model.byBetType.find((s) => s.key === typeKey) ?? null;
  const matchedBookmaker = bookieKey
    ? (model.byBookmaker.find((s) => s.key === bookieKey) ?? null)
    : null;

  // Weighted blend of matched Empirical Bayes ROI estimates
  const components: { roi: number; weight: number }[] = [];
  if (matchedOddsBand) components.push({ roi: matchedOddsBand.shrunkRoi, weight: 0.45 });
  if (matchedBetType) components.push({ roi: matchedBetType.shrunkRoi, weight: 0.35 });
  if (matchedBookmaker) components.push({ roi: matchedBookmaker.shrunkRoi, weight: 0.2 });

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const predictedRoi =
    totalWeight > 0
      ? components.reduce((s, c) => s + c.roi * c.weight, 0) / totalWeight
      : model.overallShrunkRoi;

  const stakeRatioToMedian =
    model.tilt.medianStake > 0 && slip.stake > 0 ? slip.stake / model.tilt.medianStake : null;

  const warnings: string[] = [];
  const strengths: string[] = [];

  const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

  if (matchedBetType && matchedBetType.bets >= 5) {
    if (matchedBetType.shrunkRoi <= -0.1) {
      warnings.push(
        `Historical leak in ${matchedBetType.label}: your shrunk ROI is ${fmtPct(matchedBetType.shrunkRoi)} across ${matchedBetType.bets} settled slips.`,
      );
    } else if (matchedBetType.shrunkRoi >= 0.02) {
      strengths.push(
        `${matchedBetType.label} is a profitable segment for you (${fmtPct(matchedBetType.shrunkRoi)} shrunk ROI across ${matchedBetType.bets} bets).`,
      );
    }
  }

  if (matchedOddsBand && matchedOddsBand.bets >= 5) {
    if (matchedOddsBand.shrunkRoi <= -0.1) {
      warnings.push(
        `In the ${matchedOddsBand.label} odds band, your model estimates ${fmtPct(matchedOddsBand.shrunkRoi)} ROI (${matchedOddsBand.bets} settled bets).`,
      );
    } else if (matchedOddsBand.shrunkRoi >= 0.02) {
      strengths.push(
        `You perform well in the ${matchedOddsBand.label} odds band (${fmtPct(matchedOddsBand.shrunkRoi)} shrunk ROI over ${matchedOddsBand.bets} bets).`,
      );
    }
  }

  if (matchedBookmaker && matchedBookmaker.bets >= 5 && matchedBookmaker.shrunkRoi <= -0.1) {
    warnings.push(
      `Your settled ROI on ${matchedBookmaker.label} is ${fmtPct(matchedBookmaker.shrunkRoi)} (${matchedBookmaker.bets} bets).`,
    );
  }

  if (stakeRatioToMedian !== null && stakeRatioToMedian >= 2.5 && model.settledBets >= 10) {
    if (model.tilt.currentLossStreak >= 2) {
      warnings.push(
        `Tilt alert: this stake is ${stakeRatioToMedian.toFixed(1)}× your median stake while you are on a ${model.tilt.currentLossStreak}-bet losing streak.`,
      );
    } else {
      warnings.push(
        `Stake spike: this stake is ${stakeRatioToMedian.toFixed(1)}× your usual median stake (₦${Math.round(model.tilt.medianStake).toLocaleString()}).`,
      );
    }
  } else if (model.tilt.currentLossStreak >= 3 && model.tilt.tiltLevel !== "low") {
    warnings.push(
      `You are currently on a ${model.tilt.currentLossStreak}-bet losing streak — keep stakes flat to avoid loss-chasing.`,
    );
  }

  const riskLevel: PersonalSlipInsight["riskLevel"] =
    warnings.length >= 2 || predictedRoi <= -0.15 || (stakeRatioToMedian !== null && stakeRatioToMedian >= 2.5 && model.tilt.currentLossStreak >= 2)
      ? "high_leak"
      : warnings.length === 1 || predictedRoi <= -0.08
        ? "caution"
        : "aligned";

  return {
    maturity: model.maturity,
    settledBets: model.settledBets,
    predictedRoi,
    riskLevel,
    matchedOddsBand,
    matchedBetType,
    matchedBookmaker,
    stakeRatioToMedian,
    warnings,
    strengths,
  };
}

/**
 * Deterministic fingerprint for deduplicating re-uploaded CSV bet history rows.
 */
export function betFingerprint(row: {
  placedAt?: string | null;
  eventName: string;
  selection: string;
  odds: number;
  stake: number;
  bookmaker?: string | null;
}): string {
  const datePart =
    row.placedAt && !Number.isNaN(Date.parse(row.placedAt))
      ? new Date(row.placedAt).toISOString().slice(0, 10)
      : "";
  const eventPart = row.eventName.trim().toLowerCase().replace(/\s+/g, " ");
  const selPart = row.selection.trim().toLowerCase().replace(/\s+/g, " ");
  const oddsPart = Number(row.odds).toFixed(2);
  const stakePart = Number(row.stake).toFixed(2);
  const bookiePart = normalizeBookmakerKey(row.bookmaker) ?? "";
  return `${datePart}|${eventPart}|${selPart}|${oddsPart}|${stakePart}|${bookiePart}`;
}
