/**
 * Negative Binomial pricing engine for football micro-markets (Corners & Cards).
 *
 * Corners and bookings are overdispersed (variance > mean) due to game-state
 * clustering (chasing a goal, red cards, tactical low blocks). Using a Negative
 * Binomial distribution instead of plain Poisson avoids underestimating tail
 * probabilities on lines like Over 10.5 corners or Over 5.5 cards.
 */

export const CORNERS_DISPERSION_R = 18;
export const CARDS_DISPERSION_R = 10;

export interface CornerMarkets {
  expectedHome: number;
  expectedAway: number;
  expectedTotal: number;
  over75: number;
  under75: number;
  over85: number;
  under85: number;
  over95: number;
  under95: number;
  over105: number;
  under105: number;
  over115: number;
  under115: number;
}

export interface CardMarkets {
  expectedHome: number;
  expectedAway: number;
  expectedTotal: number;
  over25: number;
  under25: number;
  over35: number;
  under35: number;
  over45: number;
  under45: number;
  over55: number;
  under55: number;
}

export interface MicroMarkets {
  corners: CornerMarkets | null;
  cards: CardMarkets | null;
}

/** Lanczos approximation of ln(Gamma(z)) for z > 0. */
function logGamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const zm = z - 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (zm + i);
  }
  const t = zm + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (zm + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Negative Binomial PMF P(X = k) parameterised by mean mu > 0 and dispersion r > 0. */
export function negBinomPmf(mu: number, r: number, k: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  if (mu <= 0) return k === 0 ? 1 : 0;
  const safeR = Math.max(0.5, r);
  const p = safeR / (safeR + mu);
  const logProb =
    logGamma(k + safeR) -
    logGamma(safeR) -
    logGamma(k + 1) +
    safeR * Math.log(p) +
    k * Math.log(1 - p);
  return Math.exp(logProb);
}

/** P(X > line) for a Negative Binomial count variable (e.g. line = 9.5 -> P(X >= 10)). */
export function probOverLine(mu: number, line: number, dispersionR: number): number {
  const maxUnder = Math.floor(line);
  if (maxUnder < 0) return 1;
  let cdf = 0;
  for (let k = 0; k <= maxUnder; k++) {
    cdf += negBinomPmf(mu, dispersionR, k);
  }
  return Math.max(0.001, Math.min(0.999, 1 - cdf));
}

function r4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

export function deriveCornerMarkets(expectedHome: number, expectedAway: number): CornerMarkets {
  const total = Math.max(2, expectedHome + expectedAway);
  const over75 = probOverLine(total, 7.5, CORNERS_DISPERSION_R);
  const over85 = probOverLine(total, 8.5, CORNERS_DISPERSION_R);
  const over95 = probOverLine(total, 9.5, CORNERS_DISPERSION_R);
  const over105 = probOverLine(total, 10.5, CORNERS_DISPERSION_R);
  const over115 = probOverLine(total, 11.5, CORNERS_DISPERSION_R);

  return {
    expectedHome: Math.round(expectedHome * 10) / 10,
    expectedAway: Math.round(expectedAway * 10) / 10,
    expectedTotal: Math.round(total * 10) / 10,
    over75: r4(over75),
    under75: r4(1 - over75),
    over85: r4(over85),
    under85: r4(1 - over85),
    over95: r4(over95),
    under95: r4(1 - over95),
    over105: r4(over105),
    under105: r4(1 - over105),
    over115: r4(over115),
    under115: r4(1 - over115),
  };
}

export function deriveCardMarkets(expectedHome: number, expectedAway: number): CardMarkets {
  const total = Math.max(0.8, expectedHome + expectedAway);
  const over25 = probOverLine(total, 2.5, CARDS_DISPERSION_R);
  const over35 = probOverLine(total, 3.5, CARDS_DISPERSION_R);
  const over45 = probOverLine(total, 4.5, CARDS_DISPERSION_R);
  const over55 = probOverLine(total, 5.5, CARDS_DISPERSION_R);

  return {
    expectedHome: Math.round(expectedHome * 10) / 10,
    expectedAway: Math.round(expectedAway * 10) / 10,
    expectedTotal: Math.round(total * 10) / 10,
    over25: r4(over25),
    under25: r4(1 - over25),
    over35: r4(over35),
    under35: r4(1 - over35),
    over45: r4(over45),
    under45: r4(1 - over45),
    over55: r4(over55),
    under55: r4(1 - over55),
  };
}
