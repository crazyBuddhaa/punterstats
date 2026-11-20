import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { predictMatchFromModel } from "@/lib/model/dixon-coles-engine";

const MBC_BASE_URL = "https://api.managebetcodes.app/v1";

const ALLOWED_BOOKMAKERS = new Set([
  "sportybet",
  "bet9ja",
  "football.com",
  "betking",
  "onexbet",
  "msport",
  "betway",
  "22bet",
  "sportybet_gh",
  "sportybet_ke",
  "sportybet_za",
  "sportybet_tz",
]);

interface MbcSelection {
  match?: string;
  market?: string;
  selection?: string;
  odds?: string | number;
  score?: string;
  status?: string;
  sport?: string;
  start_time?: string;
  match_time?: string;
}

interface MbcViewResponse {
  bookmaker?: { key?: string; name?: string };
  bookmaker_key?: string;
  code?: string;
  status?: string;
  selections?: MbcSelection[];
  error?: string | { message?: string };
  message?: string;
}

/** Map a decoded market + selection onto our Dixon-Coles v2.0 derived probability if supported. */
function lookupModelProb(
  match: string,
  marketRaw: string,
  selectionRaw: string
): { prob: number; leagueCode: string | null } | null {
  const parts = match.split(/\s+vs\.?\s+|\s+v\s+/i).map((s) => s.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const pred = predictMatchFromModel(parts[0], parts[1]);
  if (!pred) return null;

  const market = marketRaw.toLowerCase();
  const sel = selectionRaw.toLowerCase().trim();
  const m = pred.markets;

  let prob: number | null = null;
  if (market.includes("1x2") || market === "match result") {
    if (sel === "home" || sel === "1" || sel.includes(parts[0].toLowerCase())) prob = pred.homeWinProb;
    else if (sel === "draw" || sel === "x") prob = pred.drawProb;
    else if (sel === "away" || sel === "2" || sel.includes(parts[1].toLowerCase())) prob = pred.awayWinProb;
  } else if (market.includes("double chance")) {
    if (sel === "1x" || sel.includes("home or draw")) prob = m.doubleChanceHD;
    else if (sel === "x2" || sel.includes("draw or away")) prob = m.doubleChanceDA;
    else if (sel === "12" || sel.includes("home or away")) prob = m.doubleChanceHA;
  } else if (market.includes("draw no bet") || market === "dnb") {
    if (sel === "home" || sel === "1") prob = m.homeDnb;
    else if (sel === "away" || sel === "2") prob = m.awayDnb;
  } else if (market.includes("btts") || market.includes("both teams")) {
    if (sel === "yes" || sel === "gg") prob = m.btts;
    else if (sel === "no" || sel === "ng") prob = m.noBtts;
  } else if (market.includes("over/under") || market.includes("total")) {
    if (sel.includes("over 0.5")) prob = m.over05;
    else if (sel.includes("under 0.5")) prob = m.under05;
    else if (sel.includes("over 1.5")) prob = m.over15;
    else if (sel.includes("under 1.5")) prob = m.under15;
    else if (sel.includes("over 2.5")) prob = m.over25;
    else if (sel.includes("under 2.5")) prob = m.under25;
    else if (sel.includes("over 3.5")) prob = m.over35;
    else if (sel.includes("under 3.5")) prob = m.under35;
    else if (sel.includes("over 4.5")) prob = m.over45;
    else if (sel.includes("under 4.5")) prob = m.under45;
  }

  return prob !== null ? { prob: Math.round(prob * 1000) / 1000, leagueCode: pred.leagueCode } : null;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.MANAGEBETCODES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Booking code lookup is not configured yet (missing MANAGEBETCODES_API_KEY)." },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  const rl = await checkRateLimit(`decode-slip:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many booking code lookups. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const rawCode = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  const bookmaker = (req.nextUrl.searchParams.get("bookmaker") ?? "sportybet").trim().toLowerCase();

  if (!/^[A-Z0-9-]{4,24}$/.test(rawCode)) {
    return NextResponse.json(
      { error: "Enter a valid booking code (4–24 letters/numbers)." },
      { status: 400 }
    );
  }
  if (!ALLOWED_BOOKMAKERS.has(bookmaker)) {
    return NextResponse.json({ error: "Unsupported bookmaker selected." }, { status: 400 });
  }

  try {
    const url = `${MBC_BASE_URL}/view?code=${encodeURIComponent(rawCode)}&bookmaker=${encodeURIComponent(bookmaker)}`;
    const upstream = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await upstream.json().catch(() => null)) as MbcViewResponse | null;
    if (!upstream.ok || !data) {
      const msg =
        (typeof data?.error === "string" ? data.error : data?.error?.message) ||
        data?.message ||
        `Could not decode booking code (${upstream.status}).`;
      return NextResponse.json({ error: msg }, { status: upstream.status >= 400 && upstream.status < 500 ? 400 : 502 });
    }

    const rawSelections = data.selections ?? [];
    if (rawSelections.length === 0) {
      return NextResponse.json(
        { error: "Booking code was found, but it contains no readable selections." },
        { status: 404 }
      );
    }

    const legs = rawSelections
      .map((s) => {
        const match = (s.match ?? "").trim();
        const market = (s.market ?? "1X2").trim();
        const selection = (s.selection ?? "").trim();
        const oddsNum = Number(s.odds);
        const isFootball = !s.sport || s.sport.toLowerCase().includes("foot") || s.sport.toLowerCase().includes("socc");
        const modelHit = isFootball && match ? lookupModelProb(match, market, selection) : null;

        return {
          event: match || "Match",
          market,
          selection: selection ? `${market}: ${selection}` : market,
          rawSelection: selection,
          odds: Number.isFinite(oddsNum) && oddsNum > 1 ? oddsNum : null,
          score: s.score || null,
          status: s.status || null,
          startTime: s.start_time || null,
          modelProb: modelHit?.prob ?? null,
          modelLeague: modelHit?.leagueCode ?? null,
        };
      })
      .filter((l) => l.odds !== null);

    return NextResponse.json({
      code: data.code ?? rawCode,
      bookmaker: data.bookmaker?.name ?? bookmaker,
      bookmakerKey: data.bookmaker_key ?? bookmaker,
      status: data.status ?? null,
      legs,
    });
  } catch (err) {
    console.error("[decode-slip] upstream error:", err);
    return NextResponse.json(
      { error: "Booking code service timed out. Please try again." },
      { status: 504 }
    );
  }
}
