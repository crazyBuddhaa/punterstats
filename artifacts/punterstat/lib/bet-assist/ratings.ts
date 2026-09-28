/**
 * Bet Assist — team-strength ratings from historical results.
 *
 * A time-weighted attack/defence model (Maher / Dixon-Coles family):
 *
 *   λ_home = avgHomeGoals × homeAttack(H) × awayDefence(A)
 *   λ_away = avgAwayGoals × awayAttack(A) × homeDefence(H)
 *
 * Ratings are shrunk towards the league average (SHRINK_GAMES pseudo-games)
 * so teams with few matches don't get extreme numbers, and each match is
 * weighted by exp(−age / HALF_LIFE_DAYS · ln2) so recent form matters most.
 *
 * Pure functions only — the Supabase fetch lives in ./picks-server.ts.
 */

import { poisson1x2Probs } from "@/lib/simulation/poisson";
import type { OutcomeProbs } from "./picks";

export interface ResultRow {
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  match_date: string;
}

interface TeamAgg {
  homeFor: number;
  homeAgainst: number;
  homeW: number;
  awayFor: number;
  awayAgainst: number;
  awayW: number;
  games: number;
}

export interface LeagueRatings {
  avgHome: number;
  avgAway: number;
  teams: Map<string, TeamAgg>;
}

const HALF_LIFE_DAYS = 120;
const SHRINK_GAMES = 4;
const MIN_GAMES = 6;

/** Sport keys from The Odds API → football-data.co.uk league codes. */
export const SPORT_TO_LEAGUE: Record<string, string> = {
  soccer_epl: "E0",
  soccer_efl_champ: "E1",
  soccer_spain_la_liga: "SP1",
  soccer_germany_bundesliga: "D1",
  soccer_italy_serie_a: "I1",
  soccer_france_ligue_one: "F1",
  soccer_netherlands_eredivisie: "N1",
  soccer_portugal_primeira_liga: "P1",
  soccer_spl: "SC0",
  soccer_turkey_super_league: "T1",
};

/** Odds-API style names → football-data.co.uk style names (normalised form). */
const ALIASES: Record<string, string> = {
  "manchester united": "man united",
  "manchester city": "man city",
  "nottingham forest": "nottm forest",
  "wolverhampton wanderers": "wolves",
  "tottenham hotspur": "tottenham",
  "brighton and hove albion": "brighton",
  "newcastle united": "newcastle",
  "west ham united": "west ham",
  "leicester city": "leicester",
  "ipswich town": "ipswich",
  "leeds united": "leeds",
  "sheffield united": "sheffield united",
  "west bromwich albion": "west brom",
  "luton town": "luton",
  "norwich city": "norwich",
  "cardiff city": "cardiff",
  "swansea city": "swansea",
  "stoke city": "stoke",
  "hull city": "hull",
  "coventry city": "coventry",
  "queens park rangers": "qpr",
  "atletico madrid": "ath madrid",
  "athletic bilbao": "ath bilbao",
  "real sociedad": "sociedad",
  "rayo vallecano": "vallecano",
  "celta vigo": "celta",
  "espanyol": "espanol",
  "deportivo alaves": "alaves",
  "real betis": "betis",
  "bayern munich": "bayern munich",
  "borussia dortmund": "dortmund",
  "borussia monchengladbach": "mgladbach",
  "bayer leverkusen": "leverkusen",
  "eintracht frankfurt": "ein frankfurt",
  "vfb stuttgart": "stuttgart",
  "vfl wolfsburg": "wolfsburg",
  "sc freiburg": "freiburg",
  "fsv mainz 05": "mainz",
  "1 fc heidenheim": "heidenheim",
  "tsg hoffenheim": "hoffenheim",
  "1899 hoffenheim": "hoffenheim",
  "fc st pauli": "st pauli",
  "union berlin": "union berlin",
  "werder bremen": "werder bremen",
  "rb leipzig": "rb leipzig",
  "inter milan": "inter",
  "ac milan": "milan",
  "as roma": "roma",
  "ss lazio": "lazio",
  "hellas verona": "verona",
  "paris saint germain": "paris sg",
  "olympique marseille": "marseille",
  "olympique lyonnais": "lyon",
  "as monaco": "monaco",
  "stade rennais": "rennes",
};

const DROP_TOKENS = new Set(["fc", "afc", "cf", "sc", "ssc", "ac", "as", "calcio", "cfc", "1"]);

export function normaliseTeam(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (ALIASES[base]) return ALIASES[base];
  const stripped = base
    .split(" ")
    .filter((t) => !DROP_TOKENS.has(t))
    .join(" ")
    .replace(/\butd\b/g, "united");
  return ALIASES[stripped] ?? stripped;
}

export function buildLeagueRatings(rows: ResultRow[], now = new Date()): LeagueRatings | null {
  const played = rows.filter((r) => r.home_goals !== null && r.away_goals !== null);
  if (played.length < 30) return null;

  const teams = new Map<string, TeamAgg>();
  const get = (t: string) => {
    let a = teams.get(t);
    if (!a) {
      a = { homeFor: 0, homeAgainst: 0, homeW: 0, awayFor: 0, awayAgainst: 0, awayW: 0, games: 0 };
      teams.set(t, a);
    }
    return a;
  };

  let wSum = 0;
  let hg = 0;
  let ag = 0;
  for (const r of played) {
    const ageDays = Math.max(0, (now.getTime() - new Date(r.match_date).getTime()) / 86_400_000);
    const w = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    const h = get(normaliseTeam(r.home_team));
    const a = get(normaliseTeam(r.away_team));
    const hGoals = r.home_goals as number;
    const aGoals = r.away_goals as number;
    h.homeFor += hGoals * w;
    h.homeAgainst += aGoals * w;
    h.homeW += w;
    h.games += 1;
    a.awayFor += aGoals * w;
    a.awayAgainst += hGoals * w;
    a.awayW += w;
    a.games += 1;
    hg += hGoals * w;
    ag += aGoals * w;
    wSum += w;
  }

  return { avgHome: hg / wSum, avgAway: ag / wSum, teams };
}

function shrunk(sum: number, weight: number, avg: number): number {
  // Pseudo-games at the league average pull small samples towards 1.0.
  const k = SHRINK_GAMES * 0.5; // weights are ≤1, so use half-weight pseudo-games
  return (sum + k * avg) / (weight + k) / avg;
}

/** Returns model 1X2 probabilities, or null if either team lacks data. */
export function ratingsProbs(
  league: LeagueRatings,
  homeTeam: string,
  awayTeam: string,
): OutcomeProbs | null {
  const h = league.teams.get(normaliseTeam(homeTeam));
  const a = league.teams.get(normaliseTeam(awayTeam));
  if (!h || !a || h.games < MIN_GAMES || a.games < MIN_GAMES) return null;

  const homeAtt = shrunk(h.homeFor, h.homeW, league.avgHome);
  const homeDef = shrunk(h.homeAgainst, h.homeW, league.avgAway);
  const awayAtt = shrunk(a.awayFor, a.awayW, league.avgAway);
  const awayDef = shrunk(a.awayAgainst, a.awayW, league.avgHome);

  const lambdaHome = Math.min(4.5, Math.max(0.2, league.avgHome * homeAtt * awayDef));
  const lambdaAway = Math.min(4.5, Math.max(0.2, league.avgAway * awayAtt * homeDef));
  return poisson1x2Probs(lambdaHome, lambdaAway);
}
