import { createAdminClient } from "@/lib/supabase/admin";
import {
  asianTotalOverProb,
  deriveFullMarkets,
  europeanHandicapProbs,
  GLOBAL_DC_RHO,
  outcomeOrOver25Prob,
  predictMatchFromModel,
  type FullDerivedMarkets,
} from "@/lib/model/dixon-coles-engine";
import {
  CARDS_DISPERSION_R,
  CORNERS_DISPERSION_R,
  deriveCardMarkets,
  deriveCornerMarkets,
  probOverLine,
  type MicroMarkets,
} from "@/lib/model/micro-markets";
import type { MatchResult } from "@/lib/match-breakdown/types";

export type CompetitionStage =
  | "league"
  | "cup_group"
  | "cup_knockout"
  | "derby"
  | "relegation_or_title";

export type LineupStatus =
  | "full_strength"
  | "minor_absences"
  | "key_starters_out"
  | "heavy_rotation";

export interface TeamSnapshot {
  name: string;
  last5: MatchResult[];
  pointsLast5: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  venueAvgGoalsFor: number | null;
  venueAvgGoalsAgainst: number | null;
  venueSampleSize: number;
  avgCornersFor: number | null;
  avgCornersAgainst: number | null;
  cornersSampleSize: number;
  avgCardsFor: number | null;
  avgCardsAgainst: number | null;
  cardsSampleSize: number;
  daysSinceLastMatch: number | null;
  cleanSheetPct: number;
  elo: number | null;
  sampleSize: number;
}

export interface H2HSnapshot {
  meetings: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoals: number;
  bttsPct: number;
}

export interface MatchIntel {
  homeTeam: string;
  awayTeam: string;
  competitionStage: CompetitionStage;
  homeLineup: LineupStatus;
  awayLineup: LineupStatus;
  home: TeamSnapshot;
  away: TeamSnapshot;
  h2h: H2HSnapshot;
  lambdaHome: number;
  lambdaAway: number;
  rho: number;
  markets: FullDerivedMarkets;
  microMarkets: MicroMarkets;
  strengthEdgeLabel: string;
  dataSource: "dixon_coles+history" | "history_only" | "dixon_coles_only" | "baseline";
  factors: string[];
  riskNotes: string[];
}

export interface MatchIntelOptions {
  competitionStage?: CompetitionStage;
  homeLineup?: LineupStatus;
  awayLineup?: LineupStatus;
  leagueCode?: string | null;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const teamCache = new Map<string, CacheEntry<TeamSnapshot>>();
const h2hCache = new Map<string, CacheEntry<H2HSnapshot>>();

function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function setCached<T>(map: Map<string, CacheEntry<T>>, key: string, value: T): void {
  if (map.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (oldestKey !== undefined) map.delete(oldestKey);
  }
  map.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function safeLike(name: string): string {
  return name.trim().replace(/[%_\\]/g, "");
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function computeDaysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const parsed = Date.parse(dateStr);
  if (!Number.isFinite(parsed)) return null;
  const diffDays = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
  // Ignore stale historical seasons (> 60 days) or future-dated fixtures (< 0)
  if (diffDays < 0 || diffDays > 60) return null;
  return diffDays;
}

const TEAM_HISTORY_SELECT =
  "match_date, home_team, away_team, home_goals, away_goals, home_elo, away_elo, home_corners, away_corners, home_yellow_cards, away_yellow_cards, home_red_cards, away_red_cards";

async function fetchTeamSnapshot(
  admin: ReturnType<typeof createAdminClient>,
  teamName: string,
  venue: "home" | "away",
): Promise<TeamSnapshot> {
  const safe = safeLike(teamName);
  const empty: TeamSnapshot = {
    name: teamName,
    last5: [],
    pointsLast5: 0,
    avgGoalsFor: 1.35,
    avgGoalsAgainst: 1.3,
    venueAvgGoalsFor: null,
    venueAvgGoalsAgainst: null,
    venueSampleSize: 0,
    avgCornersFor: null,
    avgCornersAgainst: null,
    cornersSampleSize: 0,
    avgCardsFor: null,
    avgCardsAgainst: null,
    cardsSampleSize: 0,
    daysSinceLastMatch: null,
    cleanSheetPct: 28,
    elo: null,
    sampleSize: 0,
  };
  if (safe.length < 2) return empty;

  const cacheKey = `${safe.toLowerCase()}::${venue}`;
  const cached = getCached(teamCache, cacheKey);
  if (cached) return cached;

  let { data } = await admin
    .from("historical_matches")
    .select(TEAM_HISTORY_SELECT)
    .or(`home_team.ilike.${safe},away_team.ilike.${safe}`)
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)
    .order("match_date", { ascending: false })
    .limit(12);

  if (!data || data.length === 0) {
    const partial = await admin
      .from("historical_matches")
      .select(TEAM_HISTORY_SELECT)
      .or(`home_team.ilike.%${safe}%,away_team.ilike.%${safe}%`)
      .not("home_goals", "is", null)
      .not("away_goals", "is", null)
      .order("match_date", { ascending: false })
      .limit(12);
    data = partial.data;
  }

  if (!data || data.length === 0) {
    setCached(teamCache, cacheKey, empty);
    return empty;
  }

  const lower = teamName.trim().toLowerCase();
  const last5: MatchResult[] = [];
  let pts5 = 0;
  let gfSum = 0;
  let gaSum = 0;
  let venueGfSum = 0;
  let venueGaSum = 0;
  let venueCount = 0;
  let cornersForSum = 0;
  let cornersAgSum = 0;
  let cornersCount = 0;
  let cardsForSum = 0;
  let cardsAgSum = 0;
  let cardsCount = 0;
  let cs = 0;
  let latestElo: number | null = null;
  const daysSinceLastMatch = computeDaysSince(data[0]?.match_date as string | undefined);

  for (const m of data) {
    const isHome =
      m.home_team.toLowerCase() === lower ||
      (m.away_team.toLowerCase() !== lower && m.home_team.toLowerCase().includes(lower));
    const gf = Number(isHome ? m.home_goals : m.away_goals);
    const ga = Number(isHome ? m.away_goals : m.home_goals);
    gfSum += gf;
    gaSum += ga;
    if ((venue === "home" && isHome) || (venue === "away" && !isHome)) {
      venueGfSum += gf;
      venueGaSum += ga;
      venueCount += 1;
    }
    if (m.home_corners !== null && m.away_corners !== null) {
      const cf = Number(isHome ? m.home_corners : m.away_corners);
      const ca = Number(isHome ? m.away_corners : m.home_corners);
      if (Number.isFinite(cf) && Number.isFinite(ca)) {
        cornersForSum += cf;
        cornersAgSum += ca;
        cornersCount += 1;
      }
    }
    if (m.home_yellow_cards !== null && m.away_yellow_cards !== null) {
      const hCards = Number(m.home_yellow_cards) + Number(m.home_red_cards ?? 0);
      const aCards = Number(m.away_yellow_cards) + Number(m.away_red_cards ?? 0);
      const cardF = isHome ? hCards : aCards;
      const cardA = isHome ? aCards : hCards;
      if (Number.isFinite(cardF) && Number.isFinite(cardA)) {
        cardsForSum += cardF;
        cardsAgSum += cardA;
        cardsCount += 1;
      }
    }
    if (ga === 0) cs++;
    if (latestElo === null) {
      const e = isHome ? m.home_elo : m.away_elo;
      if (e !== null && e !== undefined && Number.isFinite(Number(e))) {
        latestElo = Math.round(Number(e));
      }
    }
    if (last5.length < 5) {
      const res: MatchResult = gf > ga ? "W" : gf < ga ? "L" : "D";
      last5.push(res);
      pts5 += res === "W" ? 3 : res === "D" ? 1 : 0;
    }
  }

  const snapshot: TeamSnapshot = {
    name: teamName,
    last5,
    pointsLast5: pts5,
    avgGoalsFor: Number((gfSum / data.length).toFixed(2)),
    avgGoalsAgainst: Number((gaSum / data.length).toFixed(2)),
    venueAvgGoalsFor: venueCount >= 3 ? Number((venueGfSum / venueCount).toFixed(2)) : null,
    venueAvgGoalsAgainst: venueCount >= 3 ? Number((venueGaSum / venueCount).toFixed(2)) : null,
    venueSampleSize: venueCount,
    avgCornersFor: cornersCount >= 3 ? Number((cornersForSum / cornersCount).toFixed(2)) : null,
    avgCornersAgainst: cornersCount >= 3 ? Number((cornersAgSum / cornersCount).toFixed(2)) : null,
    cornersSampleSize: cornersCount,
    avgCardsFor: cardsCount >= 3 ? Number((cardsForSum / cardsCount).toFixed(2)) : null,
    avgCardsAgainst: cardsCount >= 3 ? Number((cardsAgSum / cardsCount).toFixed(2)) : null,
    cardsSampleSize: cardsCount,
    daysSinceLastMatch,
    cleanSheetPct: Math.round((cs / data.length) * 100),
    elo: latestElo,
    sampleSize: data.length,
  };
  setCached(teamCache, cacheKey, snapshot);
  return snapshot;
}

async function fetchH2HSnapshot(
  admin: ReturnType<typeof createAdminClient>,
  homeTeam: string,
  awayTeam: string,
): Promise<H2HSnapshot> {
  const sh = safeLike(homeTeam);
  const sa = safeLike(awayTeam);
  const empty: H2HSnapshot = {
    meetings: 0,
    homeWins: 0,
    draws: 0,
    awayWins: 0,
    avgGoals: 2.5,
    bttsPct: 50,
  };
  if (sh.length < 2 || sa.length < 2) return empty;

  const cacheKey = `${sh.toLowerCase()}::vs::${sa.toLowerCase()}`;
  const cached = getCached(h2hCache, cacheKey);
  if (cached) return cached;

  const { data } = await admin
    .from("historical_matches")
    .select("home_team, away_team, home_goals, away_goals")
    .or(
      `and(home_team.ilike.%${sh}%,away_team.ilike.%${sa}%),` +
      `and(home_team.ilike.%${sa}%,away_team.ilike.%${sh}%)`,
    )
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)
    .order("match_date", { ascending: false })
    .limit(12);

  if (!data || data.length === 0) {
    setCached(h2hCache, cacheKey, empty);
    return empty;
  }

  const homeLower = homeTeam.trim().toLowerCase();
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let goalsSum = 0;
  let bttsCount = 0;

  for (const m of data) {
    const hg = Number(m.home_goals);
    const ag = Number(m.away_goals);
    goalsSum += hg + ag;
    if (hg > 0 && ag > 0) bttsCount++;
    const selHomeWasHome = m.home_team.toLowerCase().includes(homeLower);
    if (hg === ag) draws++;
    else if ((hg > ag && selHomeWasHome) || (ag > hg && !selHomeWasHome)) homeWins++;
    else awayWins++;
  }

  const snap: H2HSnapshot = {
    meetings: data.length,
    homeWins,
    draws,
    awayWins,
    avgGoals: Number((goalsSum / data.length).toFixed(2)),
    bttsPct: Math.round((bttsCount / data.length) * 100),
  };
  setCached(h2hCache, cacheKey, snap);
  return snap;
}

const LINEUP_ATTACK_MULT: Record<LineupStatus, number> = {
  full_strength: 1.0,
  minor_absences: 0.96,
  key_starters_out: 0.87,
  heavy_rotation: 0.80,
};

const LINEUP_DEFENSE_LEAK: Record<LineupStatus, number> = {
  full_strength: 1.0,
  minor_absences: 1.04,
  key_starters_out: 1.13,
  heavy_rotation: 1.20,
};

export async function getMatchIntel(
  homeTeam: string,
  awayTeam: string,
  options: MatchIntelOptions = {},
): Promise<MatchIntel> {
  const competitionStage = options.competitionStage ?? "league";
  const homeLineup = options.homeLineup ?? "full_strength";
  const awayLineup = options.awayLineup ?? "full_strength";

  const admin = createAdminClient();
  const [homeSnap, awaySnap, h2hSnap] = await Promise.all([
    fetchTeamSnapshot(admin, homeTeam, "home"),
    fetchTeamSnapshot(admin, awayTeam, "away"),
    fetchH2HSnapshot(admin, homeTeam, awayTeam),
  ]);

  const dc = predictMatchFromModel(homeTeam, awayTeam, options.leagueCode);
  const hasHistory = homeSnap.sampleSize >= 3 && awaySnap.sampleSize >= 3;

  // Blend venue-specific home/away form (60%) with overall recent form (40%) when available
  const effHomeGf =
    homeSnap.venueAvgGoalsFor !== null
      ? 0.6 * homeSnap.venueAvgGoalsFor + 0.4 * homeSnap.avgGoalsFor
      : homeSnap.avgGoalsFor;
  const effHomeGa =
    homeSnap.venueAvgGoalsAgainst !== null
      ? 0.6 * homeSnap.venueAvgGoalsAgainst + 0.4 * homeSnap.avgGoalsAgainst
      : homeSnap.avgGoalsAgainst;
  const effAwayGf =
    awaySnap.venueAvgGoalsFor !== null
      ? 0.6 * awaySnap.venueAvgGoalsFor + 0.4 * awaySnap.avgGoalsFor
      : awaySnap.avgGoalsFor;
  const effAwayGa =
    awaySnap.venueAvgGoalsAgainst !== null
      ? 0.6 * awaySnap.venueAvgGoalsAgainst + 0.4 * awaySnap.avgGoalsAgainst
      : awaySnap.avgGoalsAgainst;

  // 1. Baseline expected goals (combining Dixon-Coles team strength + venue-weighted recent form)
  let lamH = 1.48;
  let lamA = 1.15;
  let rho = GLOBAL_DC_RHO;

  if (dc) {
    lamH = dc.lambdaHome;
    lamA = dc.lambdaAway;
    rho = dc.rho;
    if (hasHistory) {
      // Dynamic L1 (Historical DC) -> L2/L3 (Current-Season & Venue Form) weighting:
      // Historical baseline dominates early; current season takes over as sample matures.
      const minSample = Math.min(homeSnap.sampleSize, awaySnap.sampleSize);
      const isFreshSeason =
        homeSnap.daysSinceLastMatch !== null && awaySnap.daysSinceLastMatch !== null;
      const formWeight =
        minSample >= 10 && isFreshSeason ? 0.55 : minSample >= 5 ? 0.40 : 0.25;
      const dcWeight = 1 - formWeight;
      const formH = (effHomeGf + effAwayGa) / 2;
      const formA = (effAwayGf + effHomeGa) / 2;
      lamH = dcWeight * lamH + formWeight * (formH * 1.05);
      lamA = dcWeight * lamA + formWeight * (formA * 0.95);
    }
  } else if (hasHistory) {
    const formH = (effHomeGf + effAwayGa) / 2;
    const formA = (effAwayGf + effHomeGa) / 2;
    lamH = formH * 1.10;
    lamA = formA * 0.92;
    // Elo strength tilt when available
    if (homeSnap.elo !== null && awaySnap.elo !== null) {
      const eloDiff = clamp((homeSnap.elo - awaySnap.elo) / 400, -0.6, 0.6);
      lamH *= 1 + eloDiff * 0.25;
      lamA *= 1 - eloDiff * 0.25;
    }
  }

  // 2. Recent form momentum nudge (points in last 5: max 15, neutral ~7.5)
  if (homeSnap.last5.length >= 3 && awaySnap.last5.length >= 3) {
    const formDelta = (homeSnap.pointsLast5 - awaySnap.pointsLast5) / 15; // -1 to +1
    lamH *= 1 + formDelta * 0.08;
    lamA *= 1 - formDelta * 0.08;
  }

  // 3. H2H tilt if substantial sample (>= 4 meetings)
  if (h2hSnap.meetings >= 4) {
    const h2hGoalRatio = clamp(h2hSnap.avgGoals / Math.max(1.2, lamH + lamA), 0.88, 1.12);
    lamH *= 0.85 + 0.15 * h2hGoalRatio;
    lamA *= 0.85 + 0.15 * h2hGoalRatio;
  }

  // 4. Short-turnaround fatigue adjustment (played <= 3 days ago)
  if (homeSnap.daysSinceLastMatch !== null && homeSnap.daysSinceLastMatch <= 3) {
    lamH *= 0.96;
  }
  if (awaySnap.daysSinceLastMatch !== null && awaySnap.daysSinceLastMatch <= 3) {
    lamA *= 0.96;
  }

  // 5. Competition stage & lineup adjustments
  if (competitionStage === "cup_knockout") {
    // Knockout ties are tighter, cagier, higher draw/upset variance
    lamH *= 0.92;
    lamA *= 0.95;
  } else if (competitionStage === "derby") {
    // Derbies compress favourites and bring higher draw/card variance
    const avg = (lamH + lamA) / 2;
    lamH = 0.85 * lamH + 0.15 * avg;
    lamA = 0.85 * lamA + 0.15 * avg;
  } else if (competitionStage === "relegation_or_title") {
    lamH *= 1.05;
  }

  lamH = lamH * LINEUP_ATTACK_MULT[homeLineup] * LINEUP_DEFENSE_LEAK[awayLineup];
  lamA = lamA * LINEUP_ATTACK_MULT[awayLineup] * LINEUP_DEFENSE_LEAK[homeLineup];

  lamH = Number(clamp(lamH, 0.25, 4.2).toFixed(2));
  lamA = Number(clamp(lamA, 0.20, 3.8).toFixed(2));

  const markets = deriveFullMarkets(lamH, lamA, rho);

  // 6. Micro-markets (Corners & Cards) from historical team averages when >= 3 games exist
  let cornerMarkets = null;
  if (
    homeSnap.avgCornersFor !== null &&
    homeSnap.avgCornersAgainst !== null &&
    awaySnap.avgCornersFor !== null &&
    awaySnap.avgCornersAgainst !== null
  ) {
    let expHomeCorners = ((homeSnap.avgCornersFor + awaySnap.avgCornersAgainst) / 2) * 1.04;
    let expAwayCorners = ((awaySnap.avgCornersFor + homeSnap.avgCornersAgainst) / 2) * 0.96;
    if (competitionStage === "derby") {
      expHomeCorners *= 1.06;
      expAwayCorners *= 1.06;
    } else if (competitionStage === "cup_knockout") {
      expHomeCorners *= 0.96;
      expAwayCorners *= 0.96;
    }
    cornerMarkets = deriveCornerMarkets(
      clamp(expHomeCorners, 2.2, 9.0),
      clamp(expAwayCorners, 1.8, 8.0),
    );
  }

  let cardMarkets = null;
  if (
    homeSnap.avgCardsFor !== null &&
    homeSnap.avgCardsAgainst !== null &&
    awaySnap.avgCardsFor !== null &&
    awaySnap.avgCardsAgainst !== null
  ) {
    let expHomeCards = (homeSnap.avgCardsFor + awaySnap.avgCardsAgainst) / 2;
    let expAwayCards = (awaySnap.avgCardsFor + homeSnap.avgCardsAgainst) / 2;
    const stageCardMult =
      competitionStage === "derby"
        ? 1.22
        : competitionStage === "relegation_or_title"
          ? 1.12
          : competitionStage === "cup_knockout"
            ? 1.1
            : 1.0;
    expHomeCards *= stageCardMult;
    expAwayCards *= stageCardMult;
    cardMarkets = deriveCardMarkets(
      clamp(expHomeCards, 0.7, 4.2),
      clamp(expAwayCards, 0.7, 4.4),
    );
  }

  const microMarkets: MicroMarkets = {
    corners: cornerMarkets,
    cards: cardMarkets,
  };

  // Build plain-English Football Factors & Risk Notes
  const factors: string[] = [];
  const riskNotes: string[] = [];

  let strengthEdgeLabel = "Evenly matched";
  if (homeSnap.elo !== null && awaySnap.elo !== null) {
    const diff = homeSnap.elo - awaySnap.elo;
    if (diff >= 120) strengthEdgeLabel = `Strong ${homeTeam} strength edge (+${diff} Elo)`;
    else if (diff >= 50) strengthEdgeLabel = `Moderate ${homeTeam} edge (+${diff} Elo)`;
    else if (diff <= -120) strengthEdgeLabel = `Strong ${awayTeam} strength edge (+${Math.abs(diff)} Elo)`;
    else if (diff <= -50) strengthEdgeLabel = `Moderate ${awayTeam} edge (+${Math.abs(diff)} Elo)`;
    factors.push(`Team strength: ${homeTeam} ${homeSnap.elo} Elo vs ${awayTeam} ${awaySnap.elo} Elo.`);
  } else if (dc) {
    if (markets.homeWin - markets.awayWin > 0.22) strengthEdgeLabel = `${homeTeam} clear structural favourite`;
    else if (markets.awayWin - markets.homeWin > 0.18) strengthEdgeLabel = `${awayTeam} structural favourite`;
    factors.push(`Dixon-Coles xG projection: ${homeTeam} ${lamH.toFixed(2)} – ${lamA.toFixed(2)} ${awayTeam}.`);
  }

  if (homeSnap.last5.length >= 3) {
    const venueNote =
      homeSnap.venueAvgGoalsFor !== null
        ? `, home split ${homeSnap.venueAvgGoalsFor.toFixed(1)} GF / ${homeSnap.venueAvgGoalsAgainst?.toFixed(1)} GA`
        : "";
    factors.push(
      `${homeTeam} recent form: ${homeSnap.last5.join("-")} (${homeSnap.pointsLast5}/15 pts, ${homeSnap.avgGoalsFor.toFixed(1)} GF / ${homeSnap.avgGoalsAgainst.toFixed(1)} GA${venueNote}).`,
    );
  }
  if (awaySnap.last5.length >= 3) {
    const venueNote =
      awaySnap.venueAvgGoalsFor !== null
        ? `, away split ${awaySnap.venueAvgGoalsFor.toFixed(1)} GF / ${awaySnap.venueAvgGoalsAgainst?.toFixed(1)} GA`
        : "";
    factors.push(
      `${awayTeam} recent form: ${awaySnap.last5.join("-")} (${awaySnap.pointsLast5}/15 pts, ${awaySnap.avgGoalsFor.toFixed(1)} GF / ${awaySnap.avgGoalsAgainst.toFixed(1)} GA${venueNote}).`,
    );
  }
  if (h2hSnap.meetings > 0) {
    factors.push(
      `H2H (${h2hSnap.meetings} meetings): ${homeTeam} ${h2hSnap.homeWins}W, ${h2hSnap.draws}D, ${awayTeam} ${h2hSnap.awayWins}W · Avg ${h2hSnap.avgGoals.toFixed(1)} goals · BTTS ${h2hSnap.bttsPct}%.`,
    );
  }
  if (cornerMarkets || cardMarkets) {
    const parts: string[] = [];
    if (cornerMarkets) parts.push(`Exp. corners: ${cornerMarkets.expectedTotal.toFixed(1)}`);
    if (cardMarkets) parts.push(`Exp. cards: ${cardMarkets.expectedTotal.toFixed(1)}`);
    factors.push(parts.join(" · "));
  }

  if (homeSnap.daysSinceLastMatch !== null && homeSnap.daysSinceLastMatch <= 3) {
    riskNotes.push(
      `${homeTeam} played ${homeSnap.daysSinceLastMatch} day${homeSnap.daysSinceLastMatch === 1 ? "" : "s"} ago — short turnaround / rotation risk.`,
    );
  }
  if (awaySnap.daysSinceLastMatch !== null && awaySnap.daysSinceLastMatch <= 3) {
    riskNotes.push(
      `${awayTeam} played ${awaySnap.daysSinceLastMatch} day${awaySnap.daysSinceLastMatch === 1 ? "" : "s"} ago — short turnaround / travel fatigue risk.`,
    );
  }
  if (dc?.usedPromotedPrior) {
    riskNotes.push("One side is newly promoted or newly tracked — anchored to a conservative league prior.");
  }
  if (competitionStage === "cup_knockout") {
    riskNotes.push("Cup / knockout tie: favourites rotate or play cautiously; upset & draw risk is elevated.");
  } else if (competitionStage === "derby") {
    riskNotes.push("Derby fixture: form tables compress and draws / red-card swings happen more often.");
  }
  if (homeLineup === "key_starters_out" || homeLineup === "heavy_rotation") {
    riskNotes.push(`${homeTeam} lineup weakened (${homeLineup.replace(/_/g, " ")}) — attacking edge reduced.`);
  }
  if (awayLineup === "key_starters_out" || awayLineup === "heavy_rotation") {
    riskNotes.push(`${awayTeam} lineup weakened (${awayLineup.replace(/_/g, " ")}) — defensive vulnerability elevated.`);
  }
  if (homeSnap.last5.length >= 5 && homeSnap.pointsLast5 <= 4) {
    riskNotes.push(`${homeTeam} is in poor form (${homeSnap.pointsLast5}/15 pts in last 5).`);
  }
  if (awaySnap.last5.length >= 5 && awaySnap.pointsLast5 <= 4) {
    riskNotes.push(`${awayTeam} is in poor form (${awaySnap.pointsLast5}/15 pts in last 5).`);
  }

  const dataSource: MatchIntel["dataSource"] =
    dc && hasHistory
      ? "dixon_coles+history"
      : hasHistory
        ? "history_only"
        : dc
          ? "dixon_coles_only"
          : "baseline";

  return {
    homeTeam,
    awayTeam,
    competitionStage,
    homeLineup,
    awayLineup,
    home: homeSnap,
    away: awaySnap,
    h2h: h2hSnap,
    lambdaHome: lamH,
    lambdaAway: lamA,
    rho,
    markets,
    microMarkets,
    strengthEdgeLabel,
    dataSource,
    factors,
    riskNotes,
  };
}

/**
 * Map a user's selection text (e.g. "Arsenal to win", "Over 2.5", "BTTS Yes",
 * "1X", "Over 9.5 corners", "Over 3.5 cards") to the football-model probability.
 */
export function estimateSelectionProb(intel: MatchIntel, selection: string): number | null {
  const s = selection.toLowerCase().trim();
  if (!s) return null;
  const m = intel.markets;
  const hLower = intel.homeTeam.toLowerCase();
  const aLower = intel.awayTeam.toLowerCase();
  const mentionsHome = s.includes(hLower) || hLower.split(" ").filter((w) => w.length >= 4).some((w) => s.includes(w));
  const mentionsAway = s.includes(aLower) || aLower.split(" ").filter((w) => w.length >= 4).some((w) => s.includes(w));

  // 3-Way European Handicap (e.g. "Home (3:0)", "Away (0:2)", "Draw (1:0)", "Handicap 3:0 Home")
  const ehMatch = s.match(/\((\d)\s*:\s*(\d)\)/) ?? (s.includes("handicap") ? s.match(/(\d)\s*:\s*(\d)/) : null);
  if (ehMatch) {
    const hStart = Number(ehMatch[1]);
    const aStart = Number(ehMatch[2]);
    const eh = europeanHandicapProbs(intel.lambdaHome, intel.lambdaAway, intel.rho, hStart, aStart);
    if (s.includes("draw") || /\bx\b/.test(s)) return eh.draw;
    if (s.includes("home") || /\b1\b/.test(s) || (mentionsHome && !mentionsAway)) return eh.homeWin;
    if (s.includes("away") || /\b2\b/.test(s) || (mentionsAway && !mentionsHome)) return eh.awayWin;
  }

  // Micro-markets: Corners & Cards (checked before generic Over/Under goals)
  const isCornerSel = s.includes("corner");
  const isCardSel = s.includes("card") || s.includes("booking");
  if (isCornerSel || isCardSel) {
    const lineMatch = s.match(/(over|ov|o|under|un|u)\s*(\d+(?:\.\d+)?)/);
    if (!lineMatch) return null;
    const isOver = lineMatch[1].startsWith("o");
    const line = Number(lineMatch[2]);
    if (!Number.isFinite(line) || line < 0) return null;

    if (isCornerSel && intel.microMarkets?.corners) {
      const cm = intel.microMarkets.corners;
      const mu =
        s.includes("home") || (mentionsHome && !mentionsAway)
          ? cm.expectedHome
          : s.includes("away") || (mentionsAway && !mentionsHome)
            ? cm.expectedAway
            : cm.expectedTotal;
      const pOver = probOverLine(mu, line, CORNERS_DISPERSION_R);
      return isOver ? pOver : 1 - pOver;
    }

    if (isCardSel && intel.microMarkets?.cards) {
      const dm = intel.microMarkets.cards;
      const mu =
        s.includes("home") || (mentionsHome && !mentionsAway)
          ? dm.expectedHome
          : s.includes("away") || (mentionsAway && !mentionsHome)
            ? dm.expectedAway
            : dm.expectedTotal;
      const pOver = probOverLine(mu, line, CARDS_DISPERSION_R);
      return isOver ? pOver : 1 - pOver;
    }

    return null;
  }

  // Home/Away or Over 2.5 combo (e.g. "Away or Over 2.5", "Home or Over 2.5")
  if (s.includes("or over 2.5") || s.includes("or o2.5")) {
    if (s.includes("home") || (mentionsHome && !mentionsAway)) {
      return outcomeOrOver25Prob(intel.lambdaHome, intel.lambdaAway, intel.rho, "home");
    }
    if (s.includes("away") || (mentionsAway && !mentionsHome)) {
      return outcomeOrOver25Prob(intel.lambdaHome, intel.lambdaAway, intel.rho, "away");
    }
  }

  // Team Over 0.5 / Over 1.5 (e.g. "Atletico Madrid Over 0.5", "Home Over 1.5", "Away Over 0.5")
  if (s.includes("home") || s.includes("away") || (mentionsHome !== mentionsAway)) {
    const isHomeSide = s.includes("home") || (mentionsHome && !mentionsAway);
    if (/\b(over|ov|o)\s*0\.5\b/.test(s)) return isHomeSide ? m.homeOver05 : m.awayOver05;
    if (/\b(over|ov|o)\s*1\.5\b/.test(s)) return isHomeSide ? m.homeOver15 : m.awayOver15;
  }

  // Whole-number Asian Totals (e.g. "Over 2", "Over 3", "Under 2", "Under 3")
  const asianMatch = s.match(/\b(over|ov|o|under|un|u)\s*(2|3)(?:\.0)?\b(?!\.\d)/);
  if (asianMatch) {
    const isOver = asianMatch[1].startsWith("o");
    const line = Number(asianMatch[2]);
    const asian = asianTotalOverProb(intel.lambdaHome, intel.lambdaAway, intel.rho, line);
    return isOver ? asian.conditionalWinProb : 1 - asian.conditionalWinProb;
  }

  if (/\b(over|ov|o)\s*0\.5\b/.test(s)) return m.over05;
  if (/\b(under|un|u)\s*0\.5\b/.test(s)) return m.under05;
  if (/\b(over|ov|o)\s*1\.5\b/.test(s)) return m.over15;
  if (/\b(under|un|u)\s*1\.5\b/.test(s)) return m.under15;
  if (/\b(over|ov|o)\s*2\.5\b/.test(s)) return m.over25;
  if (/\b(under|un|u)\s*2\.5\b/.test(s)) return m.under25;
  if (/\b(over|ov|o)\s*3\.5\b/.test(s)) return m.over35;
  if (/\b(under|un|u)\s*3\.5\b/.test(s)) return m.under35;

  if (s === "gg" || s === "btts" || s.includes("btts yes") || s.includes("both teams to score")) {
    return s.includes("no") ? m.noBtts : m.btts;
  }
  if (s === "ng" || s.includes("btts no") || s.includes("no goal")) return m.noBtts;

  if (s === "1x" || s.includes("home or draw")) return m.doubleChanceHD;
  if (s === "x2" || s.includes("away or draw") || s.includes("draw or away")) return m.doubleChanceDA;
  if (s === "12" || s.includes("home or away")) return m.doubleChanceHA;

  if (s === "draw" || s === "x") return m.draw;
  if (s === "1" || s === "home" || s === "home win" || s === "home to win") return m.homeWin;
  if (s === "2" || s === "away" || s === "away win" || s === "away to win") return m.awayWin;

  if (s.includes("or draw")) {
    if (mentionsHome && !mentionsAway) return m.doubleChanceHD;
    if (mentionsAway && !mentionsHome) return m.doubleChanceDA;
  }
  if (s.includes("dnb") || s.includes("draw no bet")) {
    if (mentionsHome && !mentionsAway) return m.homeDnb;
    if (mentionsAway && !mentionsHome) return m.awayDnb;
  }
  if (mentionsHome && !mentionsAway) return m.homeWin;
  if (mentionsAway && !mentionsHome) return m.awayWin;

  return null;
}

export interface MarketAlternative {
  label: string;
  modelProb: number;
  fairOdds: number;
}

/**
 * Return the top 3 best-fitting same-match market options from the Dixon-Coles
 * matrix for ANY matched fixture so punters can see if a cleaner or safer option
 * fits the matchup better than their current pick.
 */
export function suggestMarketAlternatives(
  intel: MatchIntel,
  selection: string,
  decimalOdds: number,
): MarketAlternative[] {
  if (intel.dataSource === "baseline") return [];
  const s = selection.toLowerCase().trim();
  const m = intel.markets;

  const pool: Array<{ label: string; key: string; prob: number }> = [
    { label: `${intel.homeTeam} to win`, key: "home_win", prob: m.homeWin },
    { label: `${intel.awayTeam} to win`, key: "away_win", prob: m.awayWin },
    { label: "1X (Home or Draw)", key: "1x", prob: m.doubleChanceHD },
    { label: "X2 (Draw or Away)", key: "x2", prob: m.doubleChanceDA },
    { label: `${intel.homeTeam} DNB`, key: "home_dnb", prob: m.homeDnb },
    { label: `${intel.awayTeam} DNB`, key: "away_dnb", prob: m.awayDnb },
    { label: "Over 1.5 goals", key: "o15", prob: m.over15 },
    { label: "Over 2.5 goals", key: "o25", prob: m.over25 },
    { label: "Under 2.5 goals", key: "u25", prob: m.under25 },
    { label: "BTTS Yes", key: "btts", prob: m.btts },
    { label: `${intel.homeTeam} Over 0.5 Goals`, key: "ho05", prob: m.homeOver05 },
    { label: `${intel.awayTeam} Over 0.5 Goals`, key: "ao05", prob: m.awayOver05 },
    { label: `${intel.homeTeam} Over 1.5 Goals`, key: "ho15", prob: m.homeOver15 },
    { label: `${intel.awayTeam} Over 1.5 Goals`, key: "ao15", prob: m.awayOver15 },
    { label: `${intel.homeTeam} -1.5 Handicap`, key: "ah_h_15", prob: m.ahHomeMinus15 },
  ];

  // Filter out the exact option the user already picked
  const filtered = pool.filter((c) => {
    const lbl = c.label.toLowerCase();
    if (s === lbl || lbl.includes(s) || (s.length >= 4 && s.includes(lbl))) return false;
    if ((s === "1" || s === "home" || s === "home win") && c.key === "home_win") return false;
    if ((s === "2" || s === "away" || s === "away win") && c.key === "away_win") return false;
    if ((s === "1x" || s.includes("home or draw")) && c.key === "1x") return false;
    if ((s === "x2" || s.includes("away or draw") || s.includes("draw or away")) && c.key === "x2") return false;
    if (s.includes("over 1.5") && c.key === "o15") return false;
    if (s.includes("over 2.5") && c.key === "o25") return false;
    if (s.includes("under 2.5") && c.key === "u25") return false;
    if ((s === "gg" || s.includes("btts")) && c.key === "btts") return false;
    return true;
  });

  // For tight heavy favorites (<= 1.38), surface stronger-paying 45–78% markets;
  // otherwise surface the highest-probability clean options (55–88%) that fit the match.
  const minP = decimalOdds <= 1.38 ? 0.45 : 0.56;
  const maxP = decimalOdds <= 1.38 ? 0.78 : 0.88;

  return filtered
    .filter((c) => c.prob >= minP && c.prob <= maxP)
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 3)
    .map((c) => ({
      label: c.label,
      modelProb: Math.round(c.prob * 1000) / 1000,
      fairOdds: Math.round((1 / c.prob) * 100) / 100,
    }));
}

