import { NextRequest, NextResponse } from "next/server";
import { getSeasons, getLeagues } from "@/lib/historical-stats/queries";

export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const league = sp.get("league") ?? undefined;
  const mode   = sp.get("mode");

  try {
    if (mode === "leagues") {
      const leagues = await getLeagues();
      return NextResponse.json({ success: true, leagues });
    }
    const seasons = await getSeasons(league);
    return NextResponse.json({ success: true, seasons });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
