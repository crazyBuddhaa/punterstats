/**
 * Seeded PRNG (mulberry32) so a simulation run is fully reproducible: same
 * seed + same params always produces the same trial paths. This lets a run
 * be saved, replayed, or shared (e.g. "look at this exact bad streak"),
 * which Math.random() can never guarantee.
 *
 * Not cryptographically secure — this is for reproducible simulation only.
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derives a numeric seed from an arbitrary string (e.g. a user-provided label). */
export function seedFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** A fresh, unpredictable seed for when reproducibility isn't required. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 4294967296);
}

export function createRng(seed?: number): { rng: Rng; seed: number } {
  const usedSeed = seed ?? randomSeed();
  return { rng: mulberry32(usedSeed), seed: usedSeed };
}
