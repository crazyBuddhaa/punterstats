import { NextRequest, NextResponse } from "next/server";
import { getResults } from "@/lib/historical-stats/queries";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const league = sp.get("league") ?? undefined;
  const season = sp.get("season") ?? undefined;
  const team   = sp.get("team")   ?? undefined;
  const result = (sp.get("result") ?? undefined) as "H" | "D" | "A" | undefined;
  const page   = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const limit  = Math.min(50, Math.max(5, parseInt(sp.get("limit") ?? "25", 10)));

  try {
    const paged = await getResults({ league, season, team, result }, page, limit);
    return NextResponse.json({ success: true, ...paged });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
