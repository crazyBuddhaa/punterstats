/**
 * Bet Assist — pure betting calculators.
 *
 * Everything here is deterministic, side-effect free and safe to import from
 * both client and server components. Odds are decimal unless stated.
 */

// ── Odds formats ─────────────────────────────────────────────────────────────

export type OddsFormat = "decimal" | "fractional" | "american";

export interface ConvertedOdds {
  decimal: number;
  fractional: string;
  american: string;
  impliedProb: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Parses odds in any supported format into decimal odds. Returns null when invalid. */
export function toDecimal(value: string, format: OddsFormat): number | null {
  const v = value.trim();
  if (!v) return null;

  if (format === "decimal") {
    const d = Number(v);
    return Number.isFinite(d) && d > 1 ? d : null;
  }

  if (format === "fractional") {
    const m = v.match(/^(\d+(?:\.\d+)?)\s*[/-]\s*(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const num = Number(m[1]);
    const den = Number(m[2]);
    if (!(num > 0) || !(den > 0)) return null;
    return 1 + num / den;
  }

  const a = Number(v.replace(/^\+/, ""));
  if (!Number.isFinite(a) || Math.abs(a) < 100) return null;
  return a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a);
}

/** Decimal → fractional, reduced to the nearest simple fraction (denominator ≤ 100). */
export function decimalToFractional(decimal: number): string {
  const profit = decimal - 1;
  let bestNum = Math.round(profit);
  let bestDen = 1;
  let bestErr = Math.abs(profit - bestNum);
  for (let den = 1; den <= 100; den++) {
    const num = Math.round(profit * den);
    const err = Math.abs(profit - num / den);
    if (err < bestErr - 1e-9) {
      bestErr = err;
      bestNum = num;
      bestDen = den;
    }
    if (err < 1e-6) break;
  }
  const g = gcd(Math.max(bestNum, 1), bestDen);
  return `${Math.max(bestNum, 0) / g}/${bestDen / g}`;
}

export function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
  return `${Math.round(-100 / (decimal - 1))}`;
}

export function convertOdds(value: string, format: OddsFormat): ConvertedOdds | null {
  const decimal = toDecimal(value, format);
  if (decimal === null) return null;
  return {
    decimal: round(decimal, 3),
    fractional: decimalToFractional(decimal),
    american: decimalToAmerican(decimal),
    impliedProb: 1 / decimal,
  };
}

// ── Market margin ────────────────────────────────────────────────────────────

export interface MarginResult {
  /** Bookmaker margin as a fraction, e.g. 0.052 for 5.2%. */
  margin: number;
  /** Fair (margin-free) probability per outcome, same order as input. */
  fairProbs: number[];
  /** Fair decimal odds per outcome. */
  fairOdds: number[];
}

/** Proportional de-vig of a complete market (all outcomes). */
export function marketMargin(decimalOdds: number[]): MarginResult | null {
  if (decimalOdds.length < 2 || decimalOdds.some((o) => !(o > 1))) return null;
  const implied = decimalOdds.map((o) => 1 / o);
  const book = implied.reduce((s, p) => s + p, 0);
  const fairProbs = implied.map((p) => p / book);
  return {
    margin: book - 1,
    fairProbs,
    fairOdds: fairProbs.map((p) => 1 / p),
  };
}

// ── Expected value & Kelly ───────────────────────────────────────────────────

/** Expected value per 1 unit staked: p·(odds−1) − (1−p) = p·odds − 1. */
export function expectedValue(prob: number, decimalOdds: number): number {
  return prob * decimalOdds - 1;
}

export interface KellyResult {
  /** Full-Kelly fraction of bankroll (0 when there is no edge). */
  fullFraction: number;
  /** Fraction after applying the Kelly multiplier (e.g. 0.25 for quarter Kelly). */
  fraction: number;
  stake: number;
  edge: number;
}

/**
 * Kelly criterion: f* = (b·p − q) / b, where b = odds − 1.
 * Negative results mean "no bet" and are clamped to 0.
 */
export function kellyStake(
  prob: number,
  decimalOdds: number,
  bankroll: number,
  multiplier = 0.25,
): KellyResult {
  const b = decimalOdds - 1;
  const edge = expectedValue(prob, decimalOdds);
  if (!(b > 0) || !(prob > 0) || !(prob < 1)) {
    return { fullFraction: 0, fraction: 0, stake: 0, edge };
  }
  const full = Math.max(0, (b * prob - (1 - prob)) / b);
  const fraction = full * multiplier;
  return { fullFraction: full, fraction, stake: round(bankroll * fraction, 2), edge };
}

// ── Accumulators ─────────────────────────────────────────────────────────────

export interface AccaResult {
  combinedOdds: number;
  impliedProb: number;
  returns: number;
  profit: number;
  /** Margin compounded across legs, assuming `perLegMargin` on each leg. */
  compoundedMargin: number;
}

export function accumulator(legOdds: number[], stake: number, perLegMargin = 0.05): AccaResult | null {
  if (legOdds.length === 0 || legOdds.some((o) => !(o > 1))) return null;
  const combinedOdds = legOdds.reduce((acc, o) => acc * o, 1);
  const returns = stake * combinedOdds;
  return {
    combinedOdds: round(combinedOdds, 3),
    impliedProb: 1 / combinedOdds,
    returns: round(returns, 2),
    profit: round(returns - stake, 2),
    compoundedMargin: Math.pow(1 + perLegMargin, legOdds.length) - 1,
  };
}

// ── Arbitrage ────────────────────────────────────────────────────────────────

export interface ArbResult {
  isArb: boolean;
  /** Sum of implied probabilities of the best prices. < 1 means an arbitrage exists. */
  book: number;
  /** Guaranteed return as a fraction of total stake (negative when no arb). */
  profitPct: number;
  stakes: number[];
  payout: number;
}

/** Splits `totalStake` across outcomes so every outcome pays out the same amount. */
export function arbitrage(bestOdds: number[], totalStake: number): ArbResult | null {
  if (bestOdds.length < 2 || bestOdds.some((o) => !(o > 1)) || !(totalStake > 0)) return null;
  const implied = bestOdds.map((o) => 1 / o);
  const book = implied.reduce((s, p) => s + p, 0);
  const stakes = implied.map((p) => round((totalStake * p) / book, 2));
  const payout = round(totalStake / book, 2);
  return { isArb: book < 1, book, profitPct: 1 / book - 1, stakes, payout };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function pct(n: number, dp = 1): string {
  return `${(n * 100).toFixed(dp)}%`;
}
