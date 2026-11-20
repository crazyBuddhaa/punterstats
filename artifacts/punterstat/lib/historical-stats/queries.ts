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
      if (t1IsHome) team1Wins++;
      else team2Wins++;
    } else if (m.result === "A") {
      if (t1IsHome) team2Wins++;
      else team1Wins++;
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

export async function getTeams(
  league?: string,
  season?: string,
  search?: string,
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_distinct_historical_teams",
    {
      p_league_code: league || null,
      p_season: season || null,
      p_search: search || null,
    },
  );

  if (!rpcError && Array.isArray(rpcData)) {
    return (rpcData as Array<{ team_name: string }>)
      .map((r) => r.team_name)
      .filter(Boolean);
  }

  // Fallback if migration 063 RPC is not yet applied: paginate across pages
  const names = new Set<string>();
  const pageSize = 1000;
  for (let offset = 0; offset < 30000; offset += pageSize) {
    let q = supabase
      .from("historical_matches")
      .select("home_team, away_team")
      .range(offset, offset + pageSize - 1);
    if (league) q = q.eq("league_code", league);
    if (season) q = q.eq("season", season);
    if (search) {
      q = q.or(`home_team.ilike.%${search}%,away_team.ilike.%${search}%`);
    }
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    for (const r of data) {
      if (r.home_team) names.add(r.home_team);
      if (r.away_team) names.add(r.away_team);
    }
    if (data.length < pageSize) break;
  }

  let list = [...names];
  if (search) {
    const qLower = search.toLowerCase();
    list = list.filter((t) => t.toLowerCase().includes(qLower));
  }
  return list.sort();
}

export async function getSeasons(league?: string): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_distinct_historical_seasons",
    { p_league_code: league || null },
  );

  if (!rpcError && Array.isArray(rpcData)) {
    return (rpcData as Array<{ season: string }>)
      .map((r) => r.season)
      .filter(Boolean);
  }

  // Fallback if migration 063 RPC is not yet applied
  const seasons = new Set<string>();
  const pageSize = 1000;
  for (let offset = 0; offset < 30000; offset += pageSize) {
    let q = supabase
      .from("historical_matches")
      .select("season")
      .range(offset, offset + pageSize - 1);
    if (league) q = q.eq("league_code", league);
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    for (const r of data) {
      if (r.season) seasons.add(r.season);
    }
    if (data.length < pageSize) break;
  }

  return [...seasons].sort((a, b) => b.localeCompare(a));
}

export async function getLeagues(): Promise<LeagueOption[]> {
  const supabase = createAdminClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_distinct_historical_leagues",
  );

  const seen = new Map<string, string>();
  if (!rpcError && Array.isArray(rpcData)) {
    for (const r of rpcData as Array<{ league_code: string; league_name: string }>) {
      if (r.league_code && !seen.has(r.league_code)) {
        seen.set(r.league_code, r.league_name || LEAGUE_MAP[r.league_code]?.name || r.league_code);
      }
    }
  } else {
    // Fallback if migration 063 RPC is not yet applied
    const pageSize = 1000;
    for (let offset = 0; offset < 30000; offset += pageSize) {
      const { data, error } = await supabase
        .from("historical_matches")
        .select("league_code, league_name")
        .range(offset, offset + pageSize - 1);
      if (error || !data || data.length === 0) break;
      for (const r of data) {
        if (r.league_code && !seen.has(r.league_code)) {
          seen.set(r.league_code, r.league_name || LEAGUE_MAP[r.league_code]?.name || r.league_code);
        }
      }
      if (data.length < pageSize) break;
    }
  }

  return [...seen.entries()]
    .map(([code, name]) => ({
      code,
      name: LEAGUE_MAP[code]?.name ?? name,
      country: LEAGUE_MAP[code]?.country ?? "",
    }))
    .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
}

export interface LeagueBenchmark {
  code: string;
  name: string;
  matches: number;
  avgGoals: number;
  homeWinPct: number;
  bttsPct: number;
  over25Pct: number;
}

const TOP_LEAGUES: Array<{ code: string; name: string }> = [
  { code: "E0", name: "Premier League" },
  { code: "SP1", name: "La Liga" },
  { code: "I1", name: "Serie A" },
  { code: "D1", name: "Bundesliga" },
  { code: "F1", name: "Ligue 1" },
];

export async function getLeagueBenchmarks(): Promise<LeagueBenchmark[]> {
  try {
    const supabase = createAdminClient();
    const results = await Promise.all(
      TOP_LEAGUES.map(async ({ code, name }) => {
        const { data, error } = await supabase
          .from("historical_matches")
          .select("home_goals, away_goals, result")
          .eq("league_code", code)
          .not("home_goals", "is", null)
          .not("away_goals", "is", null)
          .order("match_date", { ascending: false })
          .limit(1000);

        if (error || !data || data.length === 0) return null;
        const n = data.length;
        let totalGoals = 0;
        let homeWins = 0;
        let btts = 0;
        let over25 = 0;
        for (const r of data) {
          const hg = Number(r.home_goals);
          const ag = Number(r.away_goals);
          totalGoals += hg + ag;
          if (r.result === "H" || hg > ag) homeWins++;
          if (hg > 0 && ag > 0) btts++;
          if (hg + ag >= 3) over25++;
        }
        return {
          code,
          name,
          matches: n,
          avgGoals: totalGoals / n,
          homeWinPct: (homeWins / n) * 100,
          bttsPct: (btts / n) * 100,
          over25Pct: (over25 / n) * 100,
        };
      }),
    );
    return results.filter((r): r is LeagueBenchmark => r !== null);
  } catch {
    return [];
  }
}
