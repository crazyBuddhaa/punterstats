import { NextRequest, NextResponse } from "next/server";
import { getFixtures } from "@/lib/sports-data/router";
import { checkSharpMarketOdds } from "@/lib/odds/sharp-check";
import { scoreFixturesForScreener } from "@/lib/screener/engine";

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

    const screened = scoreFixturesForScreener(fixturesRes.fixtures);

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
      totalFixtures: fixturesRes.fixtures.length,
      modeledCount: matches.length,
      source: fixturesRes.source,
      fromCache: fixturesRes.fromCache,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load daily match screener";
    return NextResponse.json({ success: false, error: msg, matches: [] }, { status: 500 });
  }
}
