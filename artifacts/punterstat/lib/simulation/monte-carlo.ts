import { createRng, type Rng } from "./rng";

export interface BankrollPoint {
  bet: number;
  balance: number;
}

export interface TrialResult {
  points: BankrollPoint[];
  finalBalance: number;
  wins: number;
  losses: number;
  maxDrawdown: number;
  ruined: boolean;
}

export interface DistributionStats {
  numTrials: number;
  numBets: number;
  seed: number;
  /** Fraction (0-1) of individual bets across all trials that won. */
  winRate: number;
  /** Mean final balance across all trials. */
  meanFinalBalance: number;
  /** Median final balance across all trials. */
  medianFinalBalance: number;
  /** Expected ROI on total staked, based on mean profit/loss. */
  expectedRoiPct: number;
  /** Population variance of final balances. */
  variance: number;
  /** Standard deviation of final balances (sqrt of variance). */
  stdDev: number;
  /** Average of each trial's worst peak-to-trough drawdown, as a % of starting balance. */
  avgMaxDrawdownPct: number;
  /** Worst single-trial max drawdown, as a % of starting balance. */
  worstMaxDrawdownPct: number;
  /** Fraction (0-1) of trials that hit a zero (or near-zero) balance at any point. */
  riskOfRuin: number;
  /** Fraction (0-1) of trials that ended above the starting balance. */
  profitRate: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface DistributionResult {
  trials: TrialResult[];
  stats: DistributionStats;
  /** Per-bet-index percentile band, for charting. */
  balanceHistory: Array<{ bet: number; median: number; p10: number; p90: number }>;
}

export interface RunDistributionParams {
  /** Probability (0-1) that a single bet wins. */
  winProb: number;
  decimalOdds: number;
  /** Fixed stake per bet. For dynamic staking rules, use lib/simulation/staking.ts instead. */
  stakePerBet: number;
  numBets: number;
  numTrials?: number;
  startingBalance?: number;
  seed?: number;
  /** Ruin threshold as a fraction of starting balance (default: balance <= 0). */
  ruinThresholdPct?: number;
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.floor(sortedAsc.length * p)));
  return sortedAsc[idx];
}

function runSingleTrial(
  rng: Rng,
  winProb: number,
  decimalOdds: number,
  stakePerBet: number,
  numBets: number,
  startingBalance: number,
  ruinThreshold: number
): TrialResult {
  let balance = startingBalance;
  let peak = startingBalance;
  let maxDrawdown = 0;
  let wins = 0;
  let losses = 0;
  let ruined = false;

  const points: BankrollPoint[] = [{ bet: 0, balance: startingBalance }];

  for (let b = 1; b <= numBets; b++) {
    if (balance <= ruinThreshold) {
      points.push({ bet: b, balance });
      continue;
    }
    const stake = Math.min(stakePerBet, balance);
    const win = rng() < winProb;
    if (win) {
      balance = balance + (decimalOdds - 1) * stake;
      wins++;
    } else {
      balance = balance - stake;
      losses++;
    }
    balance = Math.max(0, Math.round(balance * 100) / 100);
    if (balance <= ruinThreshold) ruined = true;

    peak = Math.max(peak, balance);
    const drawdown = peak > 0 ? (peak - balance) / peak : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);

    points.push({ bet: b, balance });
  }

  return { points, finalBalance: balance, wins, losses, maxDrawdown, ruined };
}

/**
 * Runs a true Monte Carlo distribution: thousands of independent trials of
 * the same betting parameters, rather than a single Math.random() draw.
 * Returns per-trial paths plus aggregate distribution statistics (win rate,
 * expected ROI, variance/std dev, drawdown, risk of ruin, percentiles).
 */
export function runDistribution(params: RunDistributionParams): DistributionResult {
  const {
    winProb,
    decimalOdds,
    stakePerBet,
    numBets,
    numTrials = 1000,
    startingBalance = 10_000,
    seed,
    ruinThresholdPct = 0,
  } = params;

  const { rng, seed: usedSeed } = createRng(seed);
  const ruinThreshold = startingBalance * ruinThresholdPct;

  const trials: TrialResult[] = [];
  let totalWins = 0;
  let totalBets = 0;
  let totalStaked = 0;
  let totalProfit = 0;

  for (let t = 0; t < numTrials; t++) {
    const trial = runSingleTrial(rng, winProb, decimalOdds, stakePerBet, numBets, startingBalance, ruinThreshold);
    trials.push(trial);
    totalWins += trial.wins;
    totalBets += trial.wins + trial.losses;
    totalStaked += (trial.wins + trial.losses) * stakePerBet;
    totalProfit += trial.finalBalance - startingBalance;
  }

  const finals = trials.map((t) => t.finalBalance).sort((a, b) => a - b);
  const mean = finals.reduce((s, v) => s + v, 0) / numTrials;
  const variance = finals.reduce((s, v) => s + (v - mean) ** 2, 0) / numTrials;
  const stdDev = Math.sqrt(variance);
  const median = percentile(finals, 0.5);

  const drawdowns = trials.map((t) => t.maxDrawdown).sort((a, b) => a - b);
  const avgMaxDrawdownPct = (drawdowns.reduce((s, v) => s + v, 0) / numTrials) * 100;
  const worstMaxDrawdownPct = (drawdowns[drawdowns.length - 1] ?? 0) * 100;

  const riskOfRuin = trials.filter((t) => t.ruined).length / numTrials;
  const profitRate = trials.filter((t) => t.finalBalance > startingBalance).length / numTrials;

  const stats: DistributionStats = {
    numTrials,
    numBets,
    seed: usedSeed,
    winRate: totalBets > 0 ? totalWins / totalBets : 0,
    meanFinalBalance: Math.round(mean * 100) / 100,
    medianFinalBalance: Math.round(median * 100) / 100,
    expectedRoiPct: totalStaked > 0 ? Math.round((totalProfit / totalStaked) * 10000) / 100 : 0,
    variance: Math.round(variance * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    avgMaxDrawdownPct: Math.round(avgMaxDrawdownPct * 10) / 10,
    worstMaxDrawdownPct: Math.round(worstMaxDrawdownPct * 10) / 10,
    riskOfRuin: Math.round(riskOfRuin * 1000) / 1000,
    profitRate: Math.round(profitRate * 1000) / 1000,
    p10: percentile(finals, 0.1),
    p50: median,
    p90: percentile(finals, 0.9),
  };

  const balanceHistory = Array.from({ length: numBets + 1 }, (_, i) => {
    const vals = trials.map((t) => t.points[i]?.balance ?? t.finalBalance).sort((a, b) => a - b);
    return {
      bet: i,
      median: percentile(vals, 0.5),
      p10: percentile(vals, 0.1),
      p90: percentile(vals, 0.9),
    };
  });

  return { trials, stats, balanceHistory };
}
