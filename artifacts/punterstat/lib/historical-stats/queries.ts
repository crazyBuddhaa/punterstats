import { createAdminClient } from "@/lib/supabase/admin";
import type {
  HistoricalMatch,
  ResultsFilter,
  PaginatedResults,
  H2HSummary,
  LeagueOption,
} from "./types";
import { LEAGUE_MAP } from "./league-map";

const RESULTS_COLUMNS = [
  "id", "source", "external_id", "league_code", "league_name",
  "season", "match_date", "match_time", "home_team", "away_team",
  "home_goals", "away_goals", "result",
  "ht_home_goals", "ht_away_goals",
  "home_shots", "away_shots", "home_shots_on_target", "away_shots_on_target",
  "home_corners", "away_corners", "home_fouls", "away_fouls",
  "home_yellow_cards", "away_yellow_cards", "home_red_cards", "away_red_cards",
  "home_elo", "away_elo",
  "form3_home", "form5_home", "form3_away", "form5_away",
  "avg_home_odds", "avg_draw_odds", "avg_away_odds",
  "max_home_odds", "max_draw_odds", "max_away_odds",
  "over25_odds", "under25_odds",
  "handi_size", "handi_home_odds", "handi_away_odds",
  "prob_lth", "prob_lta", "prob_vhd", "prob_vad", "prob_htb", "prob_phb",
].join(", ");

export async function getResults(
  filter: ResultsFilter,
  page = 1,
  limit = 25
): Promise<PaginatedResults> {
  const supabase = createAdminClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("historical_matches")
    .select(RESULTS_COLUMNS, { count: "exact" });

  if (filter.league) query = query.eq("league_code", filter.league);
  if (filter.season) query = query.eq("season", filter.season);
  if (filter.result) query = query.eq("result", filter.result);
  if (filter.team) {
    query = query.or(
      `home_team.ilike.%${filter.team}%,away_team.ilike.%${filter.team}%`
    );
  }

  const { data, count, error } = await query
    .order("match_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as unknown as HistoricalMatch[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getH2H(
  team1: string,
  team2: string
): Promise<H2HSummary> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("historical_matches")
    .select(RESULTS_COLUMNS)
    .or(
      `and(home_team.ilike.${team1},away_team.ilike.${team2}),` +
      `and(home_team.ilike.${team2},away_team.ilike.${team1})`
    )
    .order("match_date", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  const matches = (data ?? []) as unknown as HistoricalMatch[];
  let team1Wins = 0, team2Wins = 0, draws = 0;
  let team1Goals = 0, team2Goals = 0;

  for (const m of matches) {
    const t1IsHome = m.home_team.toLowerCase() === team1.toLowerCase();
    const hg = m.home_goals ?? 0;
    const ag = m.away_goals ?? 0;

    if (t1IsHome) {
      team1Goals += hg;
      team2Goals += ag;
    } else {
      team1Goals += ag;
      team2Goals += hg;
    }

    if (m.result === "H") {
      t1IsHome ? team1Wins++ : team2Wins++;
    } else if (m.result === "A") {
      t1IsHome ? team2Wins++ : team1Wins++;
    } else if (m.result === "D") {
      draws++;
    }
  }

  return {
    team1,
    team2,
    total: matches.length,
    team1Wins,
    team2Wins,
    draws,
    team1Goals,
    team2Goals,
    matches,
  };
}

export async function getTeams(league?: string, season?: string): Promise<string[]> {
  const supabase = createAdminClient();

  let hq = supabase
    .from("historical_matches")
    .select("home_team");
  let aq = supabase
    .from("historical_matches")
    .select("away_team");

  if (league) { hq = hq.eq("league_code", league); aq = aq.eq("league_code", league); }
  if (season) { hq = hq.eq("season", season);       aq = aq.eq("season", season); }

  const [{ data: hd }, { data: ad }] = await Promise.all([hq, aq]);

  const names = new Set<string>();
  (hd ?? []).forEach((r) => names.add(r.home_team));
  (ad ?? []).forEach((r) => names.add(r.away_team));

  return [...names].sort();
}

export async function getSeasons(league?: string): Promise<string[]> {
  const supabase = createAdminClient();

  let q = supabase
    .from("historical_matches")
    .select("season");
  if (league) q = q.eq("league_code", league);

  const { data } = await q;
  const seasons = [...new Set((data ?? []).map((r) => r.season))].sort(
    (a, b) => b.localeCompare(a)
  );
  return seasons;
}

export async function getLeagues(): Promise<LeagueOption[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("historical_matches")
    .select("league_code, league_name");

  const seen = new Map<string, string>();
  for (const r of data ?? []) {
    if (!seen.has(r.league_code)) seen.set(r.league_code, r.league_name);
  }

  return [...seen.entries()]
    .map(([code, name]) => ({
      code,
      name,
      country: LEAGUE_MAP[code]?.country ?? "",
    }))
    .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
}
