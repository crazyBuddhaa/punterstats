import { hasQuotaHeadroom, recordApiUsage } from "./router";
import type { HeadToHead, MatchResult, TeamForm } from "@/lib/match-breakdown/types";

/**
 * On-demand match enrichment — auto-fills the Match Analyzer's "Team Form"
 * and "Head-to-Head" steps from SportsAPIPro when a user selects a real
 * fixture, instead of requiring manual entry.
 *
 * This has no fallback provider (footballdata.io / football-data.org don't
 * expose team-form or H2H endpoints on their free tiers), so it gates on
 * hasQuotaHeadroom() and fails soft — the analyzer always still works with
 * manual entry when this is unavailable or budget-constrained.
 *
 * Docs: https://docs.sportsapipro.com/api-reference/football-v2/team
 * (events/last/{page}) and .../match/{matchId}/h2h.
 */
const BASE_URL = "https://api.sportsapipro.com/v2/football";
const SOURCE = "sportsapipro" as const;

interface RawTeam {
  id: number;
  name: string;
}

interface RawEvent {
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  homeScore?: { current?: number };
  awayScore?: { current?: number };
  status: { type: string };
}

interface TeamEventsResponse {
  success: boolean;
  data?: { events?: RawEvent[] };
}

interface H2HResponse {
  success: boolean;
  data?: { teamDuel?: { homeWins: number; awayWins: number; draws: number } };
}

export interface MatchEnrichment {
  homeForm?: TeamForm;
  awayForm?: TeamForm;
  headToHead?: Pick<HeadToHead, "homeWins" | "draws" | "awayWins">;
}

/**
 * Fetch a team's last 5 *finished* matches (any competition) and reduce them
 * to a TeamForm shape: most-recent-first W/D/L plus average goals
 * scored/conceded per game. Returns undefined on any failure — callers
 * should treat this as "couldn't auto-fill, fall back to manual entry".
 */
async function fetchTeamForm(teamId: number, teamName: string, apiKey: string): Promise<TeamForm | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/teams/${teamId}/events/last/0`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
    });
    await recordApiUsage(SOURCE);
    if (!res.ok) return undefined;

    const json = (await res.json()) as TeamEventsResponse;
    const events = json.data?.events?.filter((e) => e.status.type === "finished") ?? [];
    const last5 = events.slice(0, 5);
    if (last5.length === 0) return undefined;

    let scored = 0;
    let conceded = 0;
    const results: MatchResult[] = last5.map((e) => {
      const isHome = e.homeTeam.id === teamId;
      const gf = (isHome ? e.homeScore?.current : e.awayScore?.current) ?? 0;
      const ga = (isHome ? e.awayScore?.current : e.homeScore?.current) ?? 0;
      scored += gf;
      conceded += ga;
      if (gf > ga) return "W";
      if (gf < ga) return "L";
      return "D";
    });

    return {
      name: teamName,
      last5: results,
      goalsScored: Math.round((scored / last5.length) * 10) / 10,
      goalsConceded: Math.round((conceded / last5.length) * 10) / 10,
    };
  } catch (err) {
    console.warn(`[sports-data/sportsapipro-enrich] team form fetch failed for team ${teamId}:`, err);
    return undefined;
  }
}

async function fetchHeadToHead(
  matchId: string,
  apiKey: string
): Promise<Pick<HeadToHead, "homeWins" | "draws" | "awayWins"> | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/match/${matchId}/h2h`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
    });
    await recordApiUsage(SOURCE);
    if (!res.ok) return undefined;

    const json = (await res.json()) as H2HResponse;
    const duel = json.data?.teamDuel;
    if (!json.success || !duel) return undefined;

    // Note: SportsAPIPro's h2h endpoint reports win/draw/loss counts only —
    // it does not include an average-goals figure, so headToHead.avgGoals
    // is intentionally omitted here and left at the analyzer's manual default.
    return { homeWins: duel.homeWins, draws: duel.draws, awayWins: duel.awayWins };
  } catch (err) {
    console.warn(`[sports-data/sportsapipro-enrich] h2h fetch failed for match ${matchId}:`, err);
    return undefined;
  }
}

/**
 * Fetch form + head-to-head enrichment for a selected fixture. Always
 * degrades gracefully: missing API key, exhausted quota, or any partial
 * failure returns whatever succeeded (possibly nothing) rather than
 * throwing — the analyzer keeps working from manual entry either way.
 */
export async function getMatchEnrichment(params: {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}): Promise<MatchEnrichment> {
  const apiKey = process.env.SPORTSAPIPRO_API_KEY;
  if (!apiKey) return {};

  // No fallback provider for this feature — skip rather than push
  // SportsAPIPro over its daily budget when it's already running hot.
  if (!(await hasQuotaHeadroom(SOURCE))) return {};

  const [homeForm, awayForm, headToHead] = await Promise.all([
    fetchTeamForm(params.homeTeamId, params.homeTeamName, apiKey),
    fetchTeamForm(params.awayTeamId, params.awayTeamName, apiKey),
    fetchHeadToHead(params.matchId, apiKey),
  ]);

  return { homeForm, awayForm, headToHead };
}
