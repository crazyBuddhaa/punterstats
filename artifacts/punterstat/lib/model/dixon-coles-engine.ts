import rawParams from "./artifacts/dixon_coles_mle_params.json";
import rawMetadata from "./artifacts/model_metadata.json";

export type ReliabilityTier = "Gold" | "Silver" | "Bronze";

export interface TeamStrength {
  attack: number;
  defense: number;
}

export interface LeagueDixonColesParams {
  home_adv: number;
  intercept: number;
  rho: number;
  xi: number;
  converged: boolean;
  teams: Record<string, TeamStrength>;
}

export interface ScorelineProb {
  score: string;
  home: number;
  away: number;
  prob: number;
}

export interface FullDerivedMarkets {
  homeWin: number;
  draw: number;
  awayWin: number;
  // Double chance & Draw No Bet
  doubleChanceHD: number;
  doubleChanceDA: number;
  doubleChanceHA: number;
  homeDnb: number;
  awayDnb: number;
  // Goal totals
  over05: number;
  under05: number;
  over15: number;
  under15: number;
  over25: number;
  under25: number;
  over35: number;
  under35: number;
  over45: number;
  under45: number;
  // BTTS & Clean sheets
  btts: number;
  noBtts: number;
  homeCleanSheet: number;
  awayCleanSheet: number;
  // Team totals
  homeOver05: number;
  homeOver15: number;
  awayOver05: number;
  awayOver15: number;
  // Asian handicaps (Home perspective)
  ahHomeMinus15: number;
  ahHomeMinus05: number;
  ahHomePlus05: number;
  ahHomePlus15: number;
  // Top exact scorelines
  topScorelines: ScorelineProb[];
}

export interface ModelMatchPrediction {
  matched: boolean;
  modelVersion: string;
  leagueCode: string | null;
  reliabilityTier: ReliabilityTier | null;
  lambdaHome: number;
  lambdaAway: number;
  rho: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  markets: FullDerivedMarkets;
}

const MAX_GOALS = 8;

const PARAMS_BY_LEAGUE = rawParams as Record<string, LeagueDixonColesParams>;

export const MODEL_VERSION: string = rawMetadata.model_version ?? "2.0.0";
export const DATASET_SHA256: string = rawMetadata.dataset_sha256 ?? "";
export const GLOBAL_DC_RHO: number =
  typeof rawMetadata.global_dc_rho === "number" ? rawMetadata.global_dc_rho : -0.056;
export const TEMPERATURE_DC_MLE: number =
  typeof rawMetadata.temperature_dc_mle === "number" ? rawMetadata.temperature_dc_mle : 1.0;

export const LEAGUE_DC_RHO: Record<string, number> =
  (rawMetadata.league_dc_rho as Record<string, number>) ?? {};

export const LEAGUE_RELIABILITY: Record<string, ReliabilityTier> =
  (rawMetadata.league_reliability as Record<string, ReliabilityTier>) ?? {};

/** Return the validation-fitted Dixon-Coles rho for a league, falling back to the global fitted rho. */
export function getLeagueRho(leagueCode?: string | null): number {
  if (!leagueCode) return GLOBAL_DC_RHO;
  const key = leagueCode.trim().toUpperCase();
  return LEAGUE_DC_RHO[key] ?? PARAMS_BY_LEAGUE[key]?.rho ?? GLOBAL_DC_RHO;
}

/** Return the data reliability tier ("Gold" | "Silver" | "Bronze") for a league, or null if unknown. */
export function getLeagueReliability(leagueCode?: string | null): ReliabilityTier | null {
  if (!leagueCode) return null;
  const key = leagueCode.trim().toUpperCase();
  return LEAGUE_RELIABILITY[key] ?? null;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function normTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Lazy-built normalised lookup index: leagueCode -> Map<normName, TeamStrength>
let teamIndexCache: Map<string, Map<string, TeamStrength>> | null = null;

function getTeamIndex(): Map<string, Map<string, TeamStrength>> {
  if (teamIndexCache) return teamIndexCache;
  teamIndexCache = new Map();
  for (const [leagueCode, league] of Object.entries(PARAMS_BY_LEAGUE)) {
    const map = new Map<string, TeamStrength>();
    for (const [teamName, strength] of Object.entries(league.teams)) {
      map.set(normTeamName(teamName), strength);
    }
    teamIndexCache.set(leagueCode, map);
  }
  return teamIndexCache;
}

/** P(X = k) for Poisson(lambda) computed in log-space for numerical stability. */
export function poissonPmf(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = k * Math.log(lambda) - lambda;
  for (let i = 1; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

/** Dixon-Coles low-score tau adjustment factor. */
export function dixonColesTau(
  i: number,
  j: number,
  lambda: number,
  mu: number,
  rho: number
): number {
  if (i === 0 && j === 0) return Math.max(1e-6, 1 - lambda * mu * rho);
  if (i === 0 && j === 1) return Math.max(1e-6, 1 + lambda * rho);
  if (i === 1 && j === 0) return Math.max(1e-6, 1 + mu * rho);
  if (i === 1 && j === 1) return Math.max(1e-6, 1 - rho);
  return 1;
}

/** Build the normalised Dixon-Coles joint scoreline probability matrix P(i, j). */
export function buildDixonColesScoreMatrix(
  lambdaHome: number,
  lambdaAway: number,
  rho: number = GLOBAL_DC_RHO,
  maxGoals: number = MAX_GOALS
): number[][] {
  const lam = clamp(lambdaHome, 0.05, 6.0);
  const mu = clamp(lambdaAway, 0.05, 6.0);
  const mat: number[][] = [];
  let total = 0;

  for (let i = 0; i <= maxGoals; i++) {
    mat[i] = [];
    const ph = poissonPmf(lam, i);
    for (let j = 0; j <= maxGoals; j++) {
      const p = ph * poissonPmf(mu, j) * dixonColesTau(i, j, lam, mu, rho);
      mat[i][j] = p;
      total += p;
    }
  }

  if (total > 0) {
    for (let i = 0; i <= maxGoals; i++) {
      for (let j = 0; j <= maxGoals; j++) {
        mat[i][j] /= total;
      }
    }
  }

  return mat;
}

/** Apply temperature scaling to a 3-class probability vector. */
export function applyTemperature1x2(
  probs: [number, number, number],
  temperature: number
): [number, number, number] {
  const t = Math.max(0.2, temperature);
  const scaled = probs.map((p) => Math.exp(Math.log(Math.max(1e-9, p)) / t));
  const sum = scaled[0] + scaled[1] + scaled[2];
  return [scaled[0] / sum, scaled[1] / sum, scaled[2] / sum];
}

/** Derive all coherent betting markets + top exact scorelines from (lambdaHome, lambdaAway, rho). */
export function deriveFullMarkets(
  lambdaHome: number,
  lambdaAway: number,
  rho: number = GLOBAL_DC_RHO,
  topKScorelines = 5
): FullDerivedMarkets {
  const mat = buildDixonColesScoreMatrix(lambdaHome, lambdaAway, rho, MAX_GOALS);

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let under05 = 0;
  let under15 = 0;
  let under25 = 0;
  let under35 = 0;
  let under45 = 0;
  let btts = 0;
  let pHomeScore0 = 0;
  let pAwayScore0 = 0;
  let homeOver05 = 0;
  let homeOver15 = 0;
  let awayOver05 = 0;
  let awayOver15 = 0;
  let ahHomeMinus15 = 0;
  let ahHomePlus15 = 0;

  const scorelines: ScorelineProb[] = [];

  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const p = mat[i][j];
      const tot = i + j;
      const diff = i - j;

      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;

      if (tot <= 0) under05 += p;
      if (tot <= 1) under15 += p;
      if (tot <= 2) under25 += p;
      if (tot <= 3) under35 += p;
      if (tot <= 4) under45 += p;

      if (i > 0 && j > 0) btts += p;
      if (i === 0) pHomeScore0 += p;
      if (j === 0) pAwayScore0 += p;

      if (i >= 1) homeOver05 += p;
      if (i >= 2) homeOver15 += p;
      if (j >= 1) awayOver05 += p;
      if (j >= 2) awayOver15 += p;

      if (diff >= 2) ahHomeMinus15 += p;
      if (diff >= -1) ahHomePlus15 += p;

      scorelines.push({ score: `${i}-${j}`, home: i, away: j, prob: p });
    }
  }

  scorelines.sort((a, b) => b.prob - a.prob);
  const nonDraw = Math.max(1e-9, homeWin + awayWin);

  return {
    homeWin,
    draw,
    awayWin,
    doubleChanceHD: homeWin + draw,
    doubleChanceDA: draw + awayWin,
    doubleChanceHA: homeWin + awayWin,
    homeDnb: homeWin / nonDraw,
    awayDnb: awayWin / nonDraw,
    over05: 1 - under05,
    under05,
    over15: 1 - under15,
    under15,
    over25: 1 - under25,
    under25,
    over35: 1 - under35,
    under35,
    over45: 1 - under45,
    under45,
    btts,
    noBtts: 1 - btts,
    homeCleanSheet: pAwayScore0,
    awayCleanSheet: pHomeScore0,
    homeOver05,
    homeOver15,
    awayOver05,
    awayOver15,
    ahHomeMinus15,
    ahHomeMinus05: homeWin,
    ahHomePlus05: homeWin + draw,
    ahHomePlus15,
    topScorelines: scorelines.slice(0, topKScorelines).map((s) => ({
      ...s,
      prob: Math.round(s.prob * 10000) / 10000,
    })),
  };
}

/**
 * Predict expected goals and calibrated markets for a match using the v2.0
 * time-decayed Dixon-Coles MLE parameters fitted on 39 leagues.
 *
 * Returns `matched: false` if either team is not present in the model registry
 * so callers can cleanly fall back to heuristic estimation.
 */
export function predictMatchFromModel(
  homeTeam: string,
  awayTeam: string,
  leagueCode?: string | null
): ModelMatchPrediction | null {
  const normHome = normTeamName(homeTeam);
  const normAway = normTeamName(awayTeam);
  if (!normHome || !normAway) return null;

  const idx = getTeamIndex();
  let resolvedLeague: string | null = null;
  let hStrength: TeamStrength | undefined;
  let aStrength: TeamStrength | undefined;

  if (leagueCode) {
    const key = leagueCode.trim().toUpperCase();
    const lMap = idx.get(key);
    if (lMap) {
      hStrength = lMap.get(normHome);
      aStrength = lMap.get(normAway);
      if (hStrength && aStrength) resolvedLeague = key;
    }
  }

  // If leagueCode omitted or teams weren't both found there, search across all 39 leagues
  if (!resolvedLeague) {
    for (const [lc, lMap] of idx.entries()) {
      const h = lMap.get(normHome);
      const a = lMap.get(normAway);
      if (h && a) {
        resolvedLeague = lc;
        hStrength = h;
        aStrength = a;
        break;
      }
    }
  }

  if (!resolvedLeague || !hStrength || !aStrength) return null;

  const league = PARAMS_BY_LEAGUE[resolvedLeague];
  const lamH = Math.exp(
    clamp(league.intercept + league.home_adv + hStrength.attack - aStrength.defense, -3.0, 2.2)
  );
  const lamA = Math.exp(
    clamp(league.intercept + aStrength.attack - hStrength.defense, -3.0, 2.2)
  );
  const rho = getLeagueRho(resolvedLeague);
  const markets = deriveFullMarkets(lamH, lamA, rho);
  const [calH, calD, calA] = applyTemperature1x2(
    [markets.homeWin, markets.draw, markets.awayWin],
    TEMPERATURE_DC_MLE
  );

  return {
    matched: true,
    modelVersion: MODEL_VERSION,
    leagueCode: resolvedLeague,
    reliabilityTier: getLeagueReliability(resolvedLeague),
    lambdaHome: lamH,
    lambdaAway: lamA,
    rho,
    homeWinProb: calH,
    drawProb: calD,
    awayWinProb: calA,
    markets: {
      ...markets,
      homeWin: calH,
      draw: calD,
      awayWin: calA,
      doubleChanceHD: calH + calD,
      doubleChanceDA: calD + calA,
      doubleChanceHA: calH + calA,
    },
  };
}
