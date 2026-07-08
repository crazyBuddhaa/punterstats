import { NextResponse } from "next/server";
import { getSports } from "@/lib/odds/client";
import { getFixtures } from "@/lib/sports-data/router";
import type { LeagueSearchResult } from "@/lib/spot-the-value/types";

/**
 * GET /api/spot-the-value/leagues?q=<query>
 *
 * Returns matching leagues from two sources:
 *   primary  — The Odds API sports list (live market odds available)
 *   secondary — Fixture router (footballdata.io → football-data.org fallback;
 *               no market odds, but fixture list + manual odds entry still works)
 *
 * The query is matched case-insensitively against league title / description / key.
 * Returns at most 8 primary and 5 secondary results.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ primary: [], secondary: [] });
  }

  // Run both lookups in parallel
  const [sports, fixturesResult] = await Promise.all([
    getSports(q),
    getFixtures({ search: q }),
  ]);

  // Primary: Odds API sports, soccer only, exclude outrights (winner markets)
  const primary: LeagueSearchResult[] = sports
    .filter((s) => s.group.toLowerCase() === "soccer" && !s.has_outrights && s.active)
    .slice(0, 8)
    .map((s) => ({ key: s.key, title: s.title, group: s.group, source: "odds-api" }));

  // Secondary: leagues surfaced by the fixture router that aren't already in primary
  const primaryKeys = new Set(primary.map((p) => p.key));
  const fixtureLeagues = new Map<string, string>(); // league name → de-duped

  if (fixturesResult.success) {
    for (const f of fixturesResult.fixtures) {
      fixtureLeagues.set(f.league, f.league);
    }
  }

  const secondary: LeagueSearchResult[] = Array.from(fixtureLeagues.values())
    .filter((name) => {
      // Only include if not already covered by a primary result
      const nameLc = name.toLowerCase();
      return !Array.from(primaryKeys).some((k) => k.toLowerCase().includes(nameLc.replace(/\s+/g, "_")));
    })
    .slice(0, 5)
    .map((name) => ({ key: name, title: name, group: "Soccer", source: "fixture" }));

  // Sports list (Odds API) is cached 1h by Next.js Data Cache; fixture cache
  // is 15 min. Use the shorter window so responses never outlive their data.
  return NextResponse.json(
    { primary, secondary },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${15 * 60}, stale-while-revalidate=${15 * 60}`,
      },
    },
  );
}
