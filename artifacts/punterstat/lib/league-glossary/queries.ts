import { createClient } from "@/lib/supabase/server";
import type { League, LeagueTeam } from "./types";

// ── Mappers ────────────────────────────────────────────────

function mapLeague(row: Record<string, unknown>): League {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    country: row.country as string,
    sport: row.sport as string,
    logoUrl: row.logo_url as string | null,
    season: row.season as string,
    playingStyle: row.playing_style as League["playingStyle"],
    styleSummary: row.style_summary as string | null,
    avgGoalsPerGame: row.avg_goals_per_game as number | null,
    xgTrend: row.xg_trend as string | null,
    homeAdvantageIndex: row.home_advantage_index as number | null,
    homeWinPct: row.home_win_pct as number | null,
    drawPct: row.draw_pct as number | null,
    awayWinPct: row.away_win_pct as number | null,
    ouReferenceLine: row.ou_reference_line as number | null,
    overPct: row.over_pct as number | null,
    fatiguePattern: row.fatigue_pattern as string | null,
    parityScore: row.parity_score as number | null,
    parityNote: row.parity_note as string | null,
    isPublished: row.is_published as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapTeam(row: Record<string, unknown>): LeagueTeam {
  return {
    id: row.id as string,
    leagueId: row.league_id as string,
    slug: row.slug as string,
    name: row.name as string,
    logoUrl: row.logo_url as string | null,
    season: row.season as string,
    playingStyle: row.playing_style as string | null,
    typicalFormation: row.typical_formation as string | null,
    homeWinPct: row.home_win_pct as number | null,
    homeDrawPct: row.home_draw_pct as number | null,
    homeLossPct: row.home_loss_pct as number | null,
    awayWinPct: row.away_win_pct as number | null,
    awayDrawPct: row.away_draw_pct as number | null,
    awayLossPct: row.away_loss_pct as number | null,
    xgFor: row.xg_for as number | null,
    xgAgainst: row.xg_against as number | null,
    cleanSheetRate: row.clean_sheet_rate as number | null,
    styleNote: row.style_note as string | null,
    isPublished: row.is_published as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Queries ────────────────────────────────────────────────

export async function getLeagues(): Promise<League[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map(mapLeague);
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ? mapLeague(data) : null;
}

export async function getTeamsByLeague(leagueId: string): Promise<LeagueTeam[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("league_teams")
    .select("*")
    .eq("league_id", leagueId)
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map(mapTeam);
}

export async function getTeamCount(leagueId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("league_teams")
    .select("id", { count: "exact", head: true })
    .eq("league_id", leagueId)
    .eq("is_published", true);
  return count ?? 0;
}
