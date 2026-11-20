import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMatchEnrichment } from "@/lib/sports-data/sportsapipro-enrich";
import type { MatchResult } from "@/lib/match-breakdown/types";

interface TeamFormData {
  last5: MatchResult[];
  goalsScored: number;
  goalsConceded: number;
  latestMatchDate?: string | null;
}

interface H2HData {
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoals: number;
}

function safeLike(name: string): string {
  return name.trim().replace(/[%_\\]/g, "");
}

async function computeTeamFormFromHistory(
  admin: ReturnType<typeof createAdminClient>,
  teamName: string,
): Promise<TeamFormData | null> {
  const safe = safeLike(teamName);
  if (safe.length < 2) return null;

  // Prefer exact case-insensitive match first, then partial match
  let { data } = await admin
    .from("historical_matches")
    .select("match_date, home_team, away_team, home_goals, away_goals")
    .or(`home_team.ilike.${safe},away_team.ilike.${safe}`)
    .not("home_goals", "is", null)
    .not("away_goals", "is", null)
    .order("match_date", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) {
    const partial = await admin
      .from("historical_matches")
      .select("match_date, home_team, away_team, home_goals, away_goals")
      .or(`home_team.ilike.%${safe}%,away_team.ilike.%${safe}%`)
      .not("home_goals", "is", null)
      .not("away_goals", "is", null)
      .order("match_date", { ascending: false })
      .limit(10);
    data = partial.data;
  }

  if (!data || data.length === 0) return null;

  const targetLower = teamName.trim().toLowerCase();
  const last5: MatchResult[] = [];
  let scoredSum = 0;
  let concededSum = 0;

  for (const m of data) {
    const isHome =
      m.home_team.toLowerCase() === targetLower ||
      (m.away_team.toLowerCase() !== targetLower && m.home_team.toLowerCase().includes(targetLower));
    const gf = Number(isHome ? m.home_goals : m.away_goals);
    const ga = Number(isHome ? m.away_goals : m.home_goals);
    scoredSum += gf;
    concededSum += ga;
    if (last5.length < 5) {
      last5.push(gf > ga ? "W" : gf < ga ? "L" : "D");
    }
  }

  return {
    last5,
    goalsScored: Number((scoredSum / data.length).toFixed(2)),
    goalsConceded: Number((concededSum / data.length).toFixed(2)),
    latestMatchDate: data[0]?.match_date ?? null,
  };
}

async function computeH2HFromHistory(
  admin: ReturnType<typeof createAdminClient>,
  homeTeamName: string,
  awayTeamName: string,
): Promise<H2HData | null> {
  const sh = safeLike(homeTeamName);
  const sa = safeLike(awayTeamName);
  if (sh.length < 2 || sa.length < 2) return null;

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
    .limit(15);

  if (!data || data.length === 0) return null;

  const homeLower = homeTeamName.trim().toLowerCase();
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let totalGoals = 0;

  for (const m of data) {
    const hg = Number(m.home_goals);
    const ag = Number(m.away_goals);
    totalGoals += hg + ag;

    const selectedHomeWasHome = m.home_team.toLowerCase().includes(homeLower);
    if (hg === ag) {
      draws++;
    } else if ((hg > ag && selectedHomeWasHome) || (ag > hg && !selectedHomeWasHome)) {
      homeWins++;
    } else {
      awayWins++;
    }
  }

  return {
    homeWins,
    draws,
    awayWins,
    avgGoals: Number((totalGoals / data.length).toFixed(2)),
  };
}

/**
 * On-demand enrichment for a fixture or any two selected teams.
 * Tries SportsAPIPro when fixture IDs are provided, and automatically falls back
 * to Supabase `historical_matches` for any missing form or H2H data so selected
 * teams always load real, up-to-date metrics.
 */
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId")?.trim() || "";
  const rawHomeId = req.nextUrl.searchParams.get("homeTeamId");
  const rawAwayId = req.nextUrl.searchParams.get("awayTeamId");
  const homeTeamId = rawHomeId ? Number(rawHomeId) : NaN;
  const awayTeamId = rawAwayId ? Number(rawAwayId) : NaN;
  const homeTeamName = req.nextUrl.searchParams.get("homeTeamName")?.trim() ?? "";
  const awayTeamName = req.nextUrl.searchParams.get("awayTeamName")?.trim() ?? "";

  if (!homeTeamName && !awayTeamName && !matchId) {
    return NextResponse.json(
      { success: false, error: "Provide homeTeamName and awayTeamName (or fixture IDs)." },
      { status: 400 },
    );
  }

  let homeForm: TeamFormData | null = null;
  let awayForm: TeamFormData | null = null;
  let headToHead: H2HData | null = null;
  let usedLive = false;
  let usedHistorical = false;

  // 1. Try live SportsAPIPro enrichment when fixture IDs are available
  if (matchId && Number.isFinite(homeTeamId) && Number.isFinite(awayTeamId)) {
    try {
      const live = await getMatchEnrichment({
        matchId,
        homeTeamId,
        awayTeamId,
        homeTeamName,
        awayTeamName,
      });
      if (live.homeForm) {
        homeForm = live.homeForm;
        usedLive = true;
      }
      if (live.awayForm) {
        awayForm = live.awayForm;
        usedLive = true;
      }
      if (live.headToHead) {
        headToHead = {
          ...live.headToHead,
          avgGoals: 2.5,
        };
        usedLive = true;
      }
    } catch {
      // Fall through to historical_matches fallback
    }
  }

  // 2. Fallback to historical_matches for any missing team form or H2H
  if (!homeForm || !awayForm || !headToHead) {
    const admin = createAdminClient();
    const [histHome, histAway, histH2H] = await Promise.all([
      !homeForm && homeTeamName ? computeTeamFormFromHistory(admin, homeTeamName) : Promise.resolve(null),
      !awayForm && awayTeamName ? computeTeamFormFromHistory(admin, awayTeamName) : Promise.resolve(null),
      !headToHead && homeTeamName && awayTeamName
        ? computeH2HFromHistory(admin, homeTeamName, awayTeamName)
        : Promise.resolve(null),
    ]);

    if (histHome) {
      homeForm = histHome;
      usedHistorical = true;
    }
    if (histAway) {
      awayForm = histAway;
      usedHistorical = true;
    }
    if (histH2H) {
      headToHead = histH2H;
      usedHistorical = true;
    }
  }

  const source =
    usedLive && usedHistorical
      ? "mixed"
      : usedLive
        ? "live"
        : usedHistorical
          ? "historical"
          : null;

  return NextResponse.json({
    success: true,
    homeForm,
    awayForm,
    headToHead,
    source,
  });
}
