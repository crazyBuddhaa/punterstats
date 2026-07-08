import { NextRequest, NextResponse } from "next/server";
import { getOdds } from "@/lib/odds/client";

const DEFAULT_SPORT_KEYS = [
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_spain_la_liga",
];

// Odds data uses an adaptive 1–2 hour Supabase cache (see lib/cache/locks.ts).
// HTTP layer mirrors the soft TTL (1 h) so CDN-cached responses are consistent,
// with stale-while-revalidate up to the hard TTL (2 h).
const SOFT_TTL = 60 * 60;   // 1 hour
const HARD_TTL = 2 * 60 * 60; // 2 hours
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${SOFT_TTL}, stale-while-revalidate=${HARD_TTL - SOFT_TTL}`,
};

export async function GET(req: NextRequest) {
  const sportKey = req.nextUrl.searchParams.get("sport") ?? DEFAULT_SPORT_KEYS[0];

  const result = await getOdds(sportKey);

  if (!result.success) {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result, { headers: CACHE_HEADERS });
}
