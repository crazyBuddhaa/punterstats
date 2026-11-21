/**
 * Shared ManageBetCodes bookmaker registry and key resolver.
 *
 * Used by `/api/bet-assist/decode-slip` and the Slip Checker / Bet Tracker UIs
 * so bookmaker dropdowns and upstream `bookmaker` identifiers stay in sync.
 */

export interface BookingCodeBookmaker {
  /** ManageBetCodes `bookmaker` identifier (e.g. "sportybet", "bet9ja") */
  key: string;
  /** User-facing dropdown label */
  label: string;
  /** Canonical bookmaker display name stored on logged bets */
  name: string;
}

export const BOOKING_CODE_BOOKMAKERS: readonly BookingCodeBookmaker[] = [
  { key: "sportybet", label: "SportyBet (NG)", name: "SportyBet" },
  { key: "bet9ja", label: "Bet9ja", name: "Bet9ja" },
  { key: "football.com", label: "Football.com", name: "Football.com" },
  { key: "betking", label: "BetKing", name: "BetKing" },
  { key: "onexbet", label: "1xBet", name: "1xBet" },
  { key: "msport", label: "MSport", name: "MSport" },
  { key: "betway", label: "Betway", name: "Betway" },
  { key: "22bet", label: "22Bet", name: "22Bet" },
  { key: "sportybet_gh", label: "SportyBet (GH)", name: "SportyBet" },
  { key: "sportybet_ke", label: "SportyBet (KE)", name: "SportyBet" },
  { key: "sportybet_za", label: "SportyBet (ZA)", name: "SportyBet" },
  { key: "sportybet_tz", label: "SportyBet (TZ)", name: "SportyBet" },
] as const;

const BOOKMAKER_KEY_ALIASES: Record<string, string> = {
  "sportybet:ng": "sportybet",
  sportybet_ng: "sportybet",
  "sportybet:gh": "sportybet_gh",
  "sportybet:ke": "sportybet_ke",
  "sportybet:za": "sportybet_za",
  "sportybet:tz": "sportybet_tz",
  "betking:ng": "betking",
  "1xbet": "onexbet",
  "1xbet:ng": "onexbet",
  "1xbet:xx": "onexbet",
  "betway:ng": "betway",
};

const VALID_BOOKMAKER_KEYS = new Set(BOOKING_CODE_BOOKMAKERS.map((b) => b.key));

/** Resolve a client-supplied bookmaker key (or alias) to a valid ManageBetCodes key. */
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
