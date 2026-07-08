import { NextRequest, NextResponse } from "next/server";
import { getTeams } from "@/lib/historical-stats/queries";

export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const league = sp.get("league") ?? undefined;
  const season = sp.get("season") ?? undefined;

  try {
    const teams = await getTeams(league, season);
    return NextResponse.json({ success: true, teams });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
