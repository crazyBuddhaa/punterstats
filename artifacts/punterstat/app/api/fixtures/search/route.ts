import { NextRequest, NextResponse } from "next/server";
import { getFixtures } from "@/lib/sports-data/router";

// Fixture data uses an adaptive 1–2 hour Supabase cache (see lib/cache/locks.ts).
// HTTP layer mirrors the soft TTL (1 h) for the CDN, with stale-while-revalidate
// covering the remaining hour up to the hard TTL.
const SOFT_TTL = 60 * 60;     // 1 hour
const HARD_TTL = 2 * 60 * 60; // 2 hours
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${SOFT_TTL}, stale-while-revalidate=${HARD_TTL - SOFT_TTL}`,
};

// Allowlist of league names the UI exposes — keeps the league param from
// being used as a free-form filter string. Must stay in sync with the
// SUPPORTED_LEAGUES constant in fixture-search.tsx.
const ALLOWED_LEAGUES = new Set([
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "Europa League",
  "Championship",
  "Eredivisie",
  "Primeira Liga",
  "Scottish Premiership",
  "World Cup",
]);

const MAX_Q_LENGTH = 100;

export async function GET(req: NextRequest) {
  const rawQ      = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const rawLeague = req.nextUrl.searchParams.get("league")?.trim() ?? "";

  // Input validation.
  if (rawQ.length > MAX_Q_LENGTH) {
    return NextResponse.json({ success: false, error: "Query too long" }, { status: 400 });
  }

  const search     = rawQ.length >= 2 ? rawQ : undefined;
  const leagueRaw  = rawLeague || undefined;
  const league     = leagueRaw && ALLOWED_LEAGUES.has(leagueRaw) ? leagueRaw : undefined;

  // Reject unknown league values (prevents free-form string injection).
  if (leagueRaw && !league) {
    return NextResponse.json({ success: false, error: "Unrecognised league" }, { status: 400 });
  }

  // Require at least a 2-char team query OR a known league.
  if (!search && !league) {
    return NextResponse.json(
      { success: false, error: "Provide a team name (2+ chars) or select a league" },
      { status: 400 },
    );
  }

  const result = await getFixtures({ search, league });

  if (!result.success) {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(
    { ...result, fixtures: result.fixtures.slice(0, 15) },
    { headers: CACHE_HEADERS },
  );
}
