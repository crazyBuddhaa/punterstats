import { getOdds } from "@/lib/odds/client";
import { createClient } from "@/lib/supabase/server";
import { buildMatchPick, type MatchPick } from "./picks";
import { buildLeagueRatings, ratingsProbs, SPORT_TO_LEAGUE, type ResultRow } from "./ratings";

export const PICK_LEAGUES = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_germany_bundesliga", label: "Bundesliga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
  { key: "soccer_france_ligue_one", label: "Ligue 1" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
] as const;

export type PicksResult =
  | { success: true; picks: MatchPick[]; fromCache: boolean; ratingsAvailable: boolean }
  | { success: false; error: string };

async function loadRatings(sportKey: string) {
  const league = SPORT_TO_LEAGUE[sportKey];
  if (!league) return null;
  try {
    const since = new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("historical_matches")
      .select("home_team, away_team, home_goals, away_goals, match_date")
      .eq("league_code", league)
      .gte("match_date", since)
      .order("match_date", { ascending: false })
      .limit(1000);
    if (error || !data) return null;
    return buildLeagueRatings(data as ResultRow[]);
  } catch {
    return null;
  }
}

/** Upcoming fixtures for one league with model probabilities and value flags. */
export async function getPicks(sportKey: string): Promise<PicksResult> {
  const [odds, ratings] = await Promise.all([getOdds(sportKey), loadRatings(sportKey)]);
  if (!odds.success) return { success: false, error: odds.error };

  const now = Date.now();
  const picks = odds.events
    .filter((e) => new Date(e.commenceTime).getTime() > now)
    .map((e) => buildMatchPick(e, ratings ? ratingsProbs(ratings, e.homeTeam, e.awayTeam) : null))
    .filter((p): p is MatchPick => p !== null)
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())
    .slice(0, 30);

  return { success: true, picks, fromCache: odds.fromCache, ratingsAvailable: !!ratings };
}
