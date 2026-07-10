import { NextRequest, NextResponse } from "next/server";
import { getMatchEnrichment } from "@/lib/sports-data/sportsapipro-enrich";

/**
 * On-demand enrichment for a selected fixture — recent form (last 5) and
 * head-to-head record, sourced from SportsAPIPro. Keeps the API key
 * server-side; the client only ever calls this route.
 *
 * Purely additive: any failure returns `{ success: true, ... }` with empty
 * fields rather than an error, so the client always falls back to manual
 * entry silently instead of surfacing a scary error for an optional feature.
 */
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId")?.trim();
  const homeTeamId = Number(req.nextUrl.searchParams.get("homeTeamId"));
  const awayTeamId = Number(req.nextUrl.searchParams.get("awayTeamId"));
  const homeTeamName = req.nextUrl.searchParams.get("homeTeamName")?.trim() ?? "";
  const awayTeamName = req.nextUrl.searchParams.get("awayTeamName")?.trim() ?? "";

  if (!matchId || !Number.isFinite(homeTeamId) || !Number.isFinite(awayTeamId)) {
    return NextResponse.json(
      { success: false, error: "matchId, homeTeamId and awayTeamId are required" },
      { status: 400 }
    );
  }

  const enrichment = await getMatchEnrichment({
    matchId,
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName,
  });

  return NextResponse.json({ success: true, ...enrichment });
}
