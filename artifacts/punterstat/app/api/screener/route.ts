import { NextRequest, NextResponse } from "next/server";
import { getFixtures } from "@/lib/sports-data/router";
import { getFootballDataFixtures } from "@/lib/sports-data/football-data";
import { checkSharpMarketOdds } from "@/lib/odds/sharp-check";
import { scoreFixturesForScreener } from "@/lib/screener/engine";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const league = req.nextUrl.searchParams.get("league") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;

    const fixturesRes = await getFixtures({ league, search });
    if (!fixturesRes.success) {
      return NextResponse.json(
        { success: false, error: fixturesRes.error, matches: [] },
        { status: 502 },
      );
    }

    let rawFixtures = fixturesRes.fixtures;
    let screened = scoreFixturesForScreener(rawFixtures);
    let source = fixturesRes.source;

    // If the primary provider returned fixtures that aren't in our Dixon-Coles leagues
    // (or returned 0 scheduled matches), also pull football-data.org Top 5 European fixtures.
    if (screened.length === 0 && source !== "football-data") {
      const fdRes = await getFootballDataFixtures({ league, search });
      if (fdRes.success && fdRes.fixtures.length > 0) {
        rawFixtures = [...rawFixtures, ...fdRes.fixtures];
        screened = scoreFixturesForScreener(rawFixtures);
        source = fdRes.source;
      }
    }

    if (screened.length === 0) {
      console.warn("[api/screener] 0 modeled matches:", {
        totalFixtures: rawFixtures.length,
        scheduledCount: rawFixtures.filter((f) => f.status === "scheduled").length,
        source,
      });
    }

    // Enrich up to 25 upcoming matches with cached sharp consensus (reads Supabase odds_cache only, zero API quota)
    const enriched = await Promise.all(
      screened.slice(0, 25).map(async (m) => {
        const sharp = await checkSharpMarketOdds(
          m.homeTeam,
          m.awayTeam,
          `${m.favoriteTeam} to win`,
          m.favoriteFairOdds,
        );
        return {
          ...m,
          sharpFavoriteProb: sharp?.sharpFairProb ?? null,
          sharpSourceLabel: sharp?.sourceLabel ?? null,
        };
      }),
    );

    const matches = [...enriched, ...screened.slice(25)];

    return NextResponse.json({
      success: true,
      matches,
      totalFixtures: rawFixtures.length,
      modeledCount: matches.length,
      source,
      fromCache: fixturesRes.fromCache,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load daily match screener";
    return NextResponse.json({ success: false, error: msg, matches: [] }, { status: 500 });
  }
}
