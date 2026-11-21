import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { predictMatchFromModel } from "@/lib/model/dixon-coles-engine";
import {
  getBookmakerMeta,
  parseConvertBetCodesResponse,
  resolveBookmakerKey,
  type CbcRetrieveResponse,
} from "@/lib/bet-assist/booking-code";

const CBC_BASE_URL = "https://convertbetcodes.com/api";

/** Map a decoded market + selection onto our Dixon-Coles v2.0 derived probability if supported. */
function lookupModelProb(
  homeTeam: string | null,
  awayTeam: string | null,
  match: string,
  marketRaw: string,
  selectionRaw: string,
): { prob: number; leagueCode: string | null } | null {
  let home = homeTeam;
  let away = awayTeam;
  if (!home || !away) {
    const parts = match.split(/\s+vs\.?\s+|\s+v\s+|\s+-\s+/i).map((s) => s.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    home = parts[0];
    away = parts[1];
  }

  const pred = predictMatchFromModel(home, away);
  if (!pred) return null;

  const market = marketRaw.toLowerCase();
  const sel = selectionRaw.toLowerCase().trim();
  const m = pred.markets;

  let prob: number | null = null;
  if (market.includes("1x2") || market === "match result" || market === "regular time") {
    if (sel === "home" || sel === "1" || sel === "w1" || sel === "home win" || sel.includes(home.toLowerCase())) {
      prob = pred.homeWinProb;
    } else if (sel === "draw" || sel === "x") {
      prob = pred.drawProb;
    } else if (sel === "away" || sel === "2" || sel === "w2" || sel === "away win" || sel.includes(away.toLowerCase())) {
      prob = pred.awayWinProb;
    }
  } else if (market.includes("double chance")) {
    if (sel === "1x" || sel.includes("home or draw")) prob = m.doubleChanceHD;
    else if (sel === "x2" || sel === "2x" || sel.includes("draw or away")) prob = m.doubleChanceDA;
    else if (sel === "12" || sel.includes("home or away")) prob = m.doubleChanceHA;
  } else if (market.includes("draw no bet") || market === "dnb") {
    if (sel === "home" || sel === "1" || sel === "w1") prob = m.homeDnb;
    else if (sel === "away" || sel === "2" || sel === "w2") prob = m.awayDnb;
  } else if (market.includes("btts") || market.includes("both teams") || market.includes("gg/ng")) {
    if (sel === "yes" || sel === "gg" || sel === "btts yes") prob = m.btts;
    else if (sel === "no" || sel === "ng" || sel === "btts no") prob = m.noBtts;
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
  const apiKey = process.env.CONVERTBETCODES_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Booking code lookup is not configured yet (missing CONVERTBETCODES_API_KEY)." },
      { status: 503 },
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
      { status: 429 },
    );
  }

  const rawCode = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  const rawBookmaker = (req.nextUrl.searchParams.get("bookmaker") ?? "sportybet:ng").trim().toLowerCase();

  if (!/^[A-Z0-9-]{4,24}$/.test(rawCode)) {
    return NextResponse.json(
      { error: "Enter a valid booking code (4–24 letters/numbers)." },
      { status: 400 },
    );
  }

  const originBookie = resolveBookmakerKey(rawBookmaker);
  if (!originBookie) {
    return NextResponse.json({ error: "Unsupported bookmaker selected." }, { status: 400 });
  }

  const bookieMeta = getBookmakerMeta(originBookie);

  try {
    const url =
      `${CBC_BASE_URL}/retrieve_bet_code` +
      `?origin_bookie=${encodeURIComponent(originBookie)}` +
      `&booking_code=${encodeURIComponent(rawCode)}` +
      `&api_key=${encodeURIComponent(apiKey)}`;

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await upstream.json().catch(() => null)) as CbcRetrieveResponse | null;
    const upstreamStatus = typeof data?.status === "number" ? data.status : Number(data?.status);
    const bodyFailed = Number.isFinite(upstreamStatus) && upstreamStatus >= 400;

    if (!upstream.ok || !data || bodyFailed) {
      const msg =
        (typeof data?.error === "string" ? data.error : data?.error?.message) ||
        (data?.message && data.message.toLowerCase() !== "success" ? data.message : null) ||
        `Could not decode booking code (${bodyFailed ? upstreamStatus : upstream.status}).`;
      const outStatus =
        (upstream.status >= 400 && upstream.status < 500) || (bodyFailed && upstreamStatus < 500)
          ? 400
          : 502;
      return NextResponse.json({ error: msg }, { status: outStatus });
    }

    const parsedLegs = parseConvertBetCodesResponse(data);
    if (parsedLegs.length === 0) {
      return NextResponse.json(
        { error: "Booking code was found, but it contains no readable selections with odds." },
        { status: 404 },
      );
    }

    const legs = parsedLegs.map((leg) => {
      const modelHit = leg.isFootball
        ? lookupModelProb(leg.homeTeam, leg.awayTeam, leg.event, leg.market, leg.rawSelection)
        : null;

      return {
        event: leg.event,
        market: leg.market,
        selection: leg.selection,
        rawSelection: leg.rawSelection,
        odds: leg.odds,
        tournament: leg.tournament,
        startTime: leg.startTime,
        score: null,
        status: null,
        modelProb: modelHit?.prob ?? null,
        modelLeague: modelHit?.leagueCode ?? null,
      };
    });

    return NextResponse.json({
      code: rawCode,
      bookmaker: bookieMeta?.label ?? data.data?.home?.bookie ?? originBookie,
      bookmakerKey: originBookie,
      totalOdds: data.data?.home?.odds ? Number(data.data.home.odds) : null,
      status: "ok",
      legs,
    });
  } catch (err) {
    console.error("[decode-slip] ConvertBetCodes error:", err);
    return NextResponse.json(
      { error: "Booking code service timed out. Please try again." },
      { status: 504 },
    );
  }
}
