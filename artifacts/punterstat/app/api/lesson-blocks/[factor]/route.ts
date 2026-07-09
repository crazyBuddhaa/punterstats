import { NextRequest, NextResponse } from "next/server";
import { getBlockStat, type BlockFactor } from "@/lib/lessons/data-blocks";

const VALID_FACTORS: BlockFactor[] = [
  "home_win_rate",
  "avg_goals",
  "btts_rate",
  "over25_rate",
];

/**
 * GET /api/lesson-blocks/[factor]?league=E0&seasons=5
 *
 * Returns a pre-aggregated stat from the historical_matches dataset for
 * embedding in lesson content. Designed for future client-side use when
 * data blocks are embedded in lessons that are rendered client-side.
 *
 * The server-component LessonContent (components/lessons/lesson-content.tsx)
 * calls getBlockStat() directly rather than hitting this route — this route
 * exists for client-side access when needed (e.g. interactive lesson previews).
 *
 * Auth: public — no user data is returned, only aggregated match statistics.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ factor: string }> },
) {
  const { factor } = await params;

  if (!VALID_FACTORS.includes(factor as BlockFactor)) {
    return NextResponse.json(
      { error: `Unknown factor "${factor}". Valid: ${VALID_FACTORS.join(", ")}` },
      { status: 400 },
    );
  }

  const { searchParams } = req.nextUrl;
  const league = searchParams.get("league") ?? undefined;
  const seasonsStr = searchParams.get("seasons");
  const seasons = seasonsStr ? parseInt(seasonsStr, 10) : undefined;

  const stat = await getBlockStat({ factor: factor as BlockFactor, league, seasons });

  if (!stat) {
    return NextResponse.json(
      { error: "No data available for the requested parameters." },
      { status: 404 },
    );
  }

  // Cache for 1 hour — dataset updates are infrequent (daily sync at most)
  return NextResponse.json(stat, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
