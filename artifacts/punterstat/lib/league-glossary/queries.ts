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

const SLUG_TO_LEAGUE_CODE: Record<string, string> = {
  "premier-league": "E0",
  "championship": "E1",
  "la-liga": "SP1",
  "bundesliga": "D1",
  "serie-a": "I1",
  "ligue-1": "F1",
  "eredivisie": "N1",
  "primeira-liga": "P1",
  "scottish-premiership": "SC0",
};

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export async function getTeamsByLeague(leagueId: string): Promise<LeagueTeam[]> {
  const supabase = await createClient();
  const [{ data }, { data: leagueRow }] = await Promise.all([
    supabase
      .from("league_teams")
      .select("*")
      .eq("league_id", leagueId)
      .eq("is_published", true)
      .order("sort_order"),
    supabase.from("leagues").select("slug").eq("id", leagueId).maybeSingle(),
  ]);

  const teams = (data ?? []).map(mapTeam);
  if (teams.length === 0) return teams;

  // Dynamically enrich teams from real historical_matches data
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const leagueCode = leagueRow?.slug ? SLUG_TO_LEAGUE_CODE[leagueRow.slug] : undefined;

    let matchQuery = admin
      .from("historical_matches")
      .select("match_date, home_team, away_team, home_goals, away_goals, home_elo, away_elo")
      .not("home_goals", "is", null)
      .not("away_goals", "is", null)
      .order("match_date", { ascending: false })
      .limit(500);

    if (leagueCode) matchQuery = matchQuery.eq("league_code", leagueCode);
    const { data: recentMatches } = await matchQuery;
    if (!recentMatches || recentMatches.length === 0) return teams;

    return teams.map((team) => {
      const target = normName(team.name);
      const teamMatches = recentMatches.filter((m) => {
        const h = normName(m.home_team);
        const a = normName(m.away_team);
        return h === target || a === target || h.includes(target) || target.includes(h) || a.includes(target) || target.includes(a);
      });

      if (teamMatches.length < 3) return team;

      const sample = teamMatches.slice(0, 20);
      let hW = 0, hD = 0, hL = 0, aW = 0, aD = 0, aL = 0;
      let gfSum = 0, gaSum = 0, cs = 0;
      let latestElo: number | null = null;
      const form: ("W" | "D" | "L")[] = [];
      let pts5 = 0;
      let latestMatchNote: string | null = null;

      for (const m of sample) {
        const hNorm = normName(m.home_team);
        const isHome = hNorm === target || hNorm.includes(target) || target.includes(hNorm);
        const gf = Number(isHome ? m.home_goals : m.away_goals);
        const ga = Number(isHome ? m.away_goals : m.home_goals);
        const opp = isHome ? m.away_team : m.home_team;

        gfSum += gf;
        gaSum += ga;
        if (ga === 0) cs++;

        if (latestElo === null) {
          const e = isHome ? m.home_elo : m.away_elo;
          if (e != null && Number.isFinite(Number(e))) latestElo = Math.round(Number(e));
        }

        const res: "W" | "D" | "L" = gf > ga ? "W" : gf < ga ? "L" : "D";
        if (latestMatchNote === null) {
          const dateStr = new Date(m.match_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
          latestMatchNote = `Last: ${res} ${gf}–${ga} ${isHome ? "vs" : "@"} ${opp} (${dateStr})`;
        }
        if (form.length < 5) {
          form.push(res);
          pts5 += res === "W" ? 3 : res === "D" ? 1 : 0;
        }

        if (isHome) {
          if (res === "W") hW++; else if (res === "D") hD++; else hL++;
        } else {
          if (res === "W") aW++; else if (res === "D") aD++; else aL++;
        }
      }

      const hTot = hW + hD + hL;
      const aTot = aW + aD + aL;
      const formSignal =
        pts5 >= 12
          ? `Hot streak (${pts5}/15 pts)`
          : pts5 >= 8
            ? `Solid form (${pts5}/15 pts)`
            : pts5 <= 4
              ? `Slump (${pts5}/15 pts)`
              : `Mixed form (${pts5}/15 pts)`;

      return {
        ...team,
        homeWinPct: hTot > 0 ? Math.round((hW / hTot) * 100) : team.homeWinPct,
        homeDrawPct: hTot > 0 ? Math.round((hD / hTot) * 100) : team.homeDrawPct,
        homeLossPct: hTot > 0 ? Math.round((hL / hTot) * 100) : team.homeLossPct,
        awayWinPct: aTot > 0 ? Math.round((aW / aTot) * 100) : team.awayWinPct,
        awayDrawPct: aTot > 0 ? Math.round((aD / aTot) * 100) : team.awayDrawPct,
        awayLossPct: aTot > 0 ? Math.round((aL / aTot) * 100) : team.awayLossPct,
        xgFor: Number((gfSum / sample.length).toFixed(2)),
        xgAgainst: Number((gaSum / sample.length).toFixed(2)),
        cleanSheetRate: Math.round((cs / sample.length) * 100),
        eloRating: latestElo,
        recentForm: form,
        formSignal,
        latestMatchNote,
        dataUpdatedAt: sample[0]?.match_date ?? null,
      };
    });
  } catch {
    return teams;
  }
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
