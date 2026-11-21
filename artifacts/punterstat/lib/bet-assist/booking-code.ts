/**
 * Shared ConvertBetCodes bookmaker registry, payload parser, and market normalizer.
 *
 * Used by `/api/bet-assist/decode-slip` and the Slip Checker / Bet Tracker UIs
 * so bookmaker dropdowns and upstream `origin_bookie` identifiers stay in sync.
 */

export interface BookingCodeBookmaker {
  /** ConvertBetCodes `origin_bookie` identifier (e.g. "sportybet:ng", "bet9ja") */
  key: string;
  /** User-facing dropdown label */
  label: string;
  /** Canonical bookmaker display name stored on logged bets */
  name: string;
}

export const BOOKING_CODE_BOOKMAKERS: readonly BookingCodeBookmaker[] = [
  { key: "sportybet:ng", label: "SportyBet (NG)", name: "SportyBet" },
  { key: "bet9ja", label: "Bet9ja", name: "Bet9ja" },
  { key: "betking:ng", label: "BetKing (NG)", name: "BetKing" },
  { key: "1xbet:ng", label: "1xBet (NG)", name: "1xBet" },
  { key: "msport", label: "MSport", name: "MSport" },
  { key: "betway:ng", label: "Betway (NG)", name: "Betway" },
  { key: "22bet", label: "22Bet", name: "22Bet" },
  { key: "betpawa:ng", label: "betPawa (NG)", name: "betPawa" },
  { key: "melbet", label: "Melbet", name: "Melbet" },
  { key: "paripesa", label: "PariPesa", name: "PariPesa" },
  { key: "betwinner:ng", label: "BetWinner (NG)", name: "BetWinner" },
  { key: "livescorebet:ng", label: "LiveScore Bet (NG)", name: "LiveScore Bet" },
  { key: "nairabet", label: "NairaBet", name: "NairaBet" },
  { key: "bangbet", label: "BangBet", name: "BangBet" },
  { key: "sportybet:gh", label: "SportyBet (GH)", name: "SportyBet" },
  { key: "sportybet:tz", label: "SportyBet (TZ)", name: "SportyBet" },
  { key: "sportybet:ug", label: "SportyBet (UG)", name: "SportyBet" },
  { key: "sportybet:zm", label: "SportyBet (ZM)", name: "SportyBet" },
  { key: "betika:ng", label: "Betika (NG)", name: "Betika" },
  { key: "betika:ke", label: "Betika (KE)", name: "Betika" },
  { key: "betway:za", label: "Betway (ZA)", name: "Betway" },
  { key: "betway:ke", label: "Betway (KE)", name: "Betway" },
  { key: "1xbet:xx", label: "1xBet (Global)", name: "1xBet" },
] as const;

/**
 * Legacy or shorthand bookmaker keys mapped onto ConvertBetCodes identifiers.
 */
const BOOKMAKER_KEY_ALIASES: Record<string, string> = {
  sportybet: "sportybet:ng",
  sportybet_ng: "sportybet:ng",
  sportybet_gh: "sportybet:gh",
  sportybet_tz: "sportybet:tz",
  sportybet_ug: "sportybet:ug",
  sportybet_zm: "sportybet:zm",
  betking: "betking:ng",
  onexbet: "1xbet:ng",
  "1xbet": "1xbet:ng",
  betway: "betway:ng",
  betpawa: "betpawa:ng",
  betwinner: "betwinner:ng",
  livescorebet: "livescorebet:ng",
  betika: "betika:ng",
};

const VALID_BOOKMAKER_KEYS = new Set(BOOKING_CODE_BOOKMAKERS.map((b) => b.key));

/** Resolve a client-supplied bookmaker key (or legacy alias) to a valid ConvertBetCodes key. */
export function resolveBookmakerKey(raw: string): string | null {
  const clean = raw.trim().toLowerCase();
  if (!clean) return null;
  if (VALID_BOOKMAKER_KEYS.has(clean)) return clean;
  const aliased = BOOKMAKER_KEY_ALIASES[clean];
  return aliased && VALID_BOOKMAKER_KEYS.has(aliased) ? aliased : null;
}

export function getBookmakerMeta(key: string): BookingCodeBookmaker | null {
  const resolved = resolveBookmakerKey(key);
  if (!resolved) return null;
  return BOOKING_CODE_BOOKMAKERS.find((b) => b.key === resolved) ?? null;
}

/** Raw item inside ConvertBetCodes `GET /retrieve_bet_code` `data.lists[]`. */
export interface CbcListEntry {
  home?: {
    item_name?: string;
    home_team?: string;
    away_team?: string;
    item_date?: string;
    item_utc_date?: string;
    sport_id?: string;
    tournament_name?: string;
    category_name?: string;
    market_name?: string;
    outcome_name?: string;
    odd_value?: string | number;
    score?: string;
    status?: string;
  };
}

export interface CbcRetrieveResponse {
  status?: number | string;
  message?: string;
  error?: string | { message?: string };
  data?: {
    home?: {
      bookie?: string;
      odds?: number | string;
      no_of_entries?: number;
    };
    lists?: CbcListEntry[];
  };
}

export interface NormalizedBookingLeg {
  event: string;
  homeTeam: string | null;
  awayTeam: string | null;
  market: string;
  rawSelection: string;
  selection: string;
  odds: number;
  tournament: string | null;
  startTime: string | null;
  isFootball: boolean;
}

/**
 * Normalize bookmaker-specific outcome shorthand (e.g. 1xBet/22Bet `W1`, `W2`, `2X`)
 * into clean selection strings that both humans and our Slip Checker market parser understand.
 */
export function normalizeDecodedSelection(
  marketRaw: string,
  outcomeRaw: string,
): string {
  const market = marketRaw.trim();
  const outcome = outcomeRaw.trim();
  if (!outcome) return market || "1X2";

  const mLow = market.toLowerCase();
  const oLow = outcome.toLowerCase();

  // 1xBet / 22Bet shorthand in 1X2
  if (mLow === "1x2" || mLow === "match result" || mLow === "regular time") {
    if (oLow === "w1" || oLow === "1" || oLow === "home") return "Home Win";
    if (oLow === "w2" || oLow === "2" || oLow === "away") return "Away Win";
    if (oLow === "x" || oLow === "draw") return "Draw";
  }

  // Double Chance shorthand (`2X` -> `X2`)
  if (mLow.includes("double chance")) {
    if (oLow === "1x" || oLow === "home or draw") return "1X";
    if (oLow === "x2" || oLow === "2x" || oLow === "draw or away") return "X2";
    if (oLow === "12" || oLow === "home or away") return "12";
  }

  // BTTS / GG-NG
  if (mLow.includes("both teams") || mLow.includes("btts") || mLow.includes("gg/ng")) {
    if (oLow === "yes" || oLow === "gg") return "BTTS Yes";
    if (oLow === "no" || oLow === "ng") return "BTTS No";
  }

  // 22Bet / 1xBet "Team 1/2, Result + Total" e.g. "Team 2 To Win And Total > (1.5) - Yes"
  const comboMatch = outcome.match(/team\s*(1|2)\s+to\s+win\s+and\s+total\s*>\s*\(?(\d+(?:\.\d+)?)\)?/i);
  if (comboMatch) {
    const side = comboMatch[1] === "1" ? "Home" : "Away";
    return `${side} & Over ${comboMatch[2]}`;
  }

  return market ? `${market}: ${outcome}` : outcome;
}

/**
 * Parse a ConvertBetCodes `retrieve_bet_code` JSON response into normalized legs.
 */
export function parseConvertBetCodesResponse(
  payload: CbcRetrieveResponse | null,
): NormalizedBookingLeg[] {
  const lists = payload?.data?.lists;
  if (!Array.isArray(lists) || lists.length === 0) return [];

  const legs: NormalizedBookingLeg[] = [];
  for (const entry of lists) {
    const item = entry?.home;
    if (!item) continue;

    const oddsNum = Number(item.odd_value);
    if (!Number.isFinite(oddsNum) || oddsNum <= 1) continue;

    const homeTeam = (item.home_team ?? "").trim() || null;
    const awayTeam = (item.away_team ?? "").trim() || null;
    const event =
      homeTeam && awayTeam
        ? `${homeTeam} vs ${awayTeam}`
        : (item.item_name ?? "").replace(/\s+-\s+/, " vs ").trim() || "Match";

    const market = (item.market_name ?? "1X2").trim();
    const rawSelection = (item.outcome_name ?? "").trim();
    const selection = normalizeDecodedSelection(market, rawSelection);

    const sportLow = (item.sport_id ?? "").toLowerCase();
    const isFootball =
      !sportLow || sportLow.includes("socc") || sportLow.includes("foot");

    legs.push({
      event,
      homeTeam,
      awayTeam,
      market,
      rawSelection,
      selection,
      odds: oddsNum,
      tournament: (item.tournament_name ?? item.category_name ?? "").trim() || null,
      startTime: (item.item_utc_date ?? item.item_date ?? "").trim() || null,
      isFootball,
    });
  }

  return legs;
}
