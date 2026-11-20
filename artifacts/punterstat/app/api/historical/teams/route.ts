import { NextRequest, NextResponse } from "next/server";
import { getTeams } from "@/lib/historical-stats/queries";

export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const league = sp.get("league") ?? undefined;
  const season = sp.get("season") ?? undefined;
  const search = sp.get("q")?.trim() || undefined;

  try {
    const teams = await getTeams(league, season, search);
    return NextResponse.json(
      { success: true, teams },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
