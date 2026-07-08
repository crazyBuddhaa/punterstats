import { NextRequest, NextResponse } from "next/server";
import { getH2H } from "@/lib/historical-stats/queries";

export async function GET(req: NextRequest) {
  const sp    = req.nextUrl.searchParams;
  const team1 = sp.get("team1")?.trim();
  const team2 = sp.get("team2")?.trim();

  if (!team1 || !team2) {
    return NextResponse.json(
      { success: false, error: "team1 and team2 are required" },
      { status: 400 }
    );
  }

  try {
    const summary = await getH2H(team1, team2);
    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
