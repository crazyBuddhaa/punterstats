import type { Rng } from "./rng";

/**
 * Poisson goal-model utilities. Two independent Poisson-distributed goal
 * counts (home, away) are the standard simplification for modelling a
 * football scoreline from a 1X2 (home/draw/away) market. It ignores
 * low-score correlation adjustments (e.g. Dixon-Coles), which is an accepted
 * simplification for simulation purposes here.
 */

export interface Scoreline {
  home: number;
  away: number;
}

export interface OneXTwoProbs {
  home: number;
  draw: number;
  away: number;
}

/** Sample a single Poisson-distributed value using Knuth's algorithm. */
export function samplePoisson(rng: Rng, lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

/** Sample a full match scoreline from independent home/away Poisson goal rates. */
export function sampleScoreline(rng: Rng, lambdaHome: number, lambdaAway: number): Scoreline {
  return { home: samplePoisson(rng, lambdaHome), away: samplePoisson(rng, lambdaAway) };
}

function poissonPmf(lambda: number, k: number): number {
  return (Math.exp(-lambda) * lambda ** k) / factorial(k);
}

const FACT_CACHE: number[] = [1];
function factorial(n: number): number {
  for (let i = FACT_CACHE.length; i <= n; i++) FACT_CACHE[i] = FACT_CACHE[i - 1] * i;
  return FACT_CACHE[n];
}

/** Derives 1X2 probabilities implied by a pair of independent Poisson goal rates. */
export function poisson1x2Probs(lambdaHome: number, lambdaAway: number, maxGoals = 10): OneXTwoProbs {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (let h = 0; h <= maxGoals; h++) {
    const ph = poissonPmf(lambdaHome, h);
    for (let a = 0; a <= maxGoals; a++) {
      const pa = poissonPmf(lambdaAway, a);
      const p = ph * pa;
      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;
    }
  }
  const total = home + draw + away;
  return total > 0 ? { home: home / total, draw: draw / total, away: away / total } : { home: 0, draw: 0, away: 0 };
}

/**
 * Fits (lambdaHome, lambdaAway) so that the resulting Poisson-implied 1X2
 * probabilities best match the de-vigged fair 1X2 probabilities from the
 * market. Coarse-to-fine grid search — cheap and deterministic, run once per
 * fixture (not once per trial).
 */
export function fit1x2Lambdas(target: OneXTwoProbs): { lambdaHome: number; lambdaAway: number } {
  let best = { lambdaHome: 1.3, lambdaAway: 1.1, err: Infinity };

  const search = (hMin: number, hMax: number, aMin: number, aMax: number, steps: number) => {
    const hStep = (hMax - hMin) / steps;
    const aStep = (aMax - aMin) / steps;
    for (let i = 0; i <= steps; i++) {
      const lambdaHome = Math.max(0.05, hMin + i * hStep);
      for (let j = 0; j <= steps; j++) {
        const lambdaAway = Math.max(0.05, aMin + j * aStep);
        const probs = poisson1x2Probs(lambdaHome, lambdaAway);
        const err =
          (probs.home - target.home) ** 2 + (probs.draw - target.draw) ** 2 + (probs.away - target.away) ** 2;
        if (err < best.err) best = { lambdaHome, lambdaAway, err };
      }
    }
  };

  // Coarse pass over a wide range, then refine around the best coarse match.
  search(0.1, 4.5, 0.1, 4.5, 30);
  search(Math.max(0.05, best.lambdaHome - 0.3), best.lambdaHome + 0.3, Math.max(0.05, best.lambdaAway - 0.3), best.lambdaAway + 0.3, 20);

  return { lambdaHome: best.lambdaHome, lambdaAway: best.lambdaAway };
}

/** Which side of a 1X2 market a scoreline resolves to. */
export function resultSide(scoreline: Scoreline): "home" | "draw" | "away" {
  if (scoreline.home > scoreline.away) return "home";
  if (scoreline.home < scoreline.away) return "away";
  return "draw";
}
