import { NextResponse } from "next/server";
import { getOdds } from "@/lib/odds/client";
import { computeValueFromOddsEvent } from "@/lib/spot-the-value/calculator";
import { getFixtures } from "@/lib/sports-data/router";
import type { Fixture } from "@/lib/sports-data/types";
import { createClient } from "@/lib/supabase/server";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics/tracker";

// HTTP cache TTLs mirror the underlying Supabase cache TTLs so the browser
// and Vercel CDN can serve the same response without hitting the origin.
const ODDS_CACHE_SECONDS = 5 * 60;      // odds_cache TTL: 5 min
const FIXTURE_CACHE_SECONDS = 15 * 60;  // fixtures_cache TTL: 15 min

function cacheHeaders(seconds: number) {
  return {
    "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds}`,
  };
}

/**
 * GET /api/spot-the-value?sport=<key>
 *   Fetches live h2h odds from The Odds API and returns value assessments.
 *
 * GET /api/spot-the-value?sport=fixtures&league=<name>
 *   Fetches upcoming fixtures from the sports-data router (footballdata.io →
 *   football-data.org fallback) for leagues not covered by The Odds API.
 *   Returns raw fixture data without market odds so the client can render
 *   a manual odds-entry form.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? "soccer_epl";

  // ── Fixture-only mode ────────────────────────────────────────────────────
  if (sport === "fixtures") {
    const league = searchParams.get("league") ?? "";
    const result = await getFixtures({ league: league || undefined, search: league || undefined });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    const fixtures: Pick<Fixture, "homeTeam" | "awayTeam" | "kickoff" | "league" | "status">[] =
      result.fixtures
        .filter((f) => f.status === "scheduled" || f.status === "live")
        .slice(0, 15)
        .map(({ homeTeam, awayTeam, kickoff, league, status }) => ({
          homeTeam,
          awayTeam,
          kickoff,
          league,
          status,
        }));

    return NextResponse.json(
      { mode: "fixtures", fixtures, league, fromCache: result.fromCache },
      { headers: cacheHeaders(FIXTURE_CACHE_SECONDS) },
    );
  }

  // ── Odds mode (default) ──────────────────────────────────────────────────
  const result = await getOdds(sport);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  const matches = result.events
    .map((event) => computeValueFromOddsEvent(event))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .slice(0, 15);

  if (matches.length > 0) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await trackEvent(user?.id ?? null, AnalyticsEvent.VALUE_COMPARISON_VIEWED, {
      sport,
      matchCount: matches.length,
    });
  }

  return NextResponse.json(
    { mode: "odds", matches, fromCache: result.fromCache, sport },
    { headers: cacheHeaders(ODDS_CACHE_SECONDS) },
  );
}
