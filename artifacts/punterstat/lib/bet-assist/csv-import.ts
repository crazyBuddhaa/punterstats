/**
 * Pure CSV parser and column mapper for Bet Tracker history uploads.
 * Supports PunterStat's own Export CSV format plus arbitrary bookmaker exports
 * (with or without an explicit Odds column, currency-suffixed headers like
 * "Stake (NGN)" / "Return (USD)", combined selection strings, and truncated
 * multi-leg summaries).
 */

import { type BetStatus } from "./journal";

export interface ParsedImportBet {
  placedAt?: string;
  sport: string;
  eventName: string;
  market: string;
  selection: string;
  bookmaker: string | null;
  odds: number;
  stake: number;
  status: BetStatus;
  cashoutAmount: number | null;
  closingOdds: number | null;
  legCount: number;
  notes: string | null;
}

export interface CsvSkippedRow {
  line: number;
  reason: string;
}

export interface CsvImportParseResult {
  rows: ParsedImportBet[];
  skipped: CsvSkippedRow[];
  totalDataRows: number;
}

export const SAMPLE_BETS_CSV = [
  "date,bookmaker,event,market,selection,odds,stake,status,legs,notes",
  "2026-11-15,SportyBet,Arsenal vs Chelsea,1X2,Arsenal Win,1.95,5000,won,1,Home edge",
  "2026-11-16,Bet9ja,Real Madrid vs Sevilla,Over/Under,Over 2.5,1.72,3000,won,1,",
  "2026-11-17,Football.com,Weekend 3-Fold,Accumulator,3 selections,4.85,2000,lost,3,One leg missed",
].join("\n");

const HEADER_ALIASES: Record<string, string[]> = {
  placedAt: ["date", "placed at", "time", "datetime", "created at", "bet date", "timestamp"],
  sport: ["sport", "category"],
  eventName: [
    "event",
    "event name",
    "match",
    "matches",
    "fixture",
    "fixtures",
    "game",
    "teams",
    "description",
    "visible selections",
    "events",
  ],
  market: ["market", "market type", "bet type", "type"],
  selection: ["selection", "pick", "outcome", "tip", "bet", "selections", "visible selections"],
  bookmaker: ["bookmaker", "bookie", "site", "platform", "sportsbook"],
  odds: ["odds", "price", "decimal odds", "total odds", "combined odds"],
  stake: ["stake", "amount", "wager", "bet amount", "staked", "total stake"],
  status: ["status", "result", "state", "settled", "outcome status"],
  cashoutAmount: [
    "cashout",
    "cashout amount",
    "cash out",
    "return",
    "total return",
    "payout",
    "payout amount",
    "winnings",
  ],
  closingOdds: ["closing odds", "close odds", "clv odds"],
  legCount: [
    "legs",
    "leg count",
    "visible selection count",
    "selection count",
    "number of legs",
    "num legs",
    "picks",
    "selections",
    "events",
  ],
  notes: [
    "notes",
    "note",
    "comment",
    "comments",
    "ticket reference",
    "ticket ref",
    "ticket id",
    "reference",
    "order id",
    "bet id",
    "booking code",
    "betcode",
    "code",
  ],
};

/** RFC-4180 CSV tokeniser supporting quoted fields, escaped quotes, and CRLF/LF. */
export function parseCsvMatrix(raw: string): string[][] {
  const cleaned = raw.replace(/^\uFEFF/, ""); // strip UTF-8 BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field.trim());
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && cleaned[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  row.push(field.trim());
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

function parseMoneyOrNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[₦$£€,\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function normalizeBetStatus(raw: string | undefined): BetStatus {
  const v = (raw ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (v === "won" || v === "win" || v === "w" || v === "green") return "won";
  if (v === "lost" || v === "loss" || v === "lose" || v === "l" || v === "red") return "lost";
  if (v === "void" || v === "push" || v === "refund" || v === "refunded" || v === "cancelled" || v === "canceled") {
    return "void";
  }
  if (v === "half_won" || v === "halfwon") return "half_won";
  if (v === "half_lost" || v === "halflost") return "half_lost";
  if (v === "cashed_out" || v === "cashout" || v === "cash_out" || v === "cashedout") return "cashed_out";
  return "pending";
}

/**
 * Normalize CSV header names by stripping parenthetical units like "(NGN)" or "(USD)",
 * replacing underscores/hyphens with spaces, and collapsing whitespace.
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findColumnIndex(headers: string[], aliases: string[], excludeIndices?: Set<number>): number {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.findIndex((h, i) => h === alias && !excludeIndices?.has(i));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Infer true leg count when a selection summary includes truncated items like
 * "Match A | Match B | Match C | ...(and 12 other matches)".
 */
function inferLegCountFromText(text: string): number {
  if (!text) return 1;
  const parts = text
    .split(/\s*\|\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  let visibleCount = 0;
  let hiddenCount = 0;

  for (const part of parts) {
    const extraMatch = part.match(/(?:and|\+)\s*(\d+)\s*(?:other|more)/i);
    if (extraMatch) {
      hiddenCount += Number(extraMatch[1]) || 0;
    } else if (!/^\.{2,}$/.test(part)) {
      visibleCount += 1;
    }
  }

  const total = visibleCount + hiddenCount;
  return total >= 1 ? total : 1;
}

function normalizeMarketLabel(rawMarket: string, legCount: number): string {
  const cleaned = rawMarket.trim();
  const lower = cleaned.toLowerCase();
  if (
    lower === "multiple" ||
    lower === "multiples" ||
    lower === "combo" ||
    lower === "parlay" ||
    lower === "acca" ||
    lower === "accumulator" ||
    lower === "system"
  ) {
    return legCount > 1 ? "Accumulator" : "Single";
  }
  if (lower === "singles" || lower === "single") {
    return "Single";
  }
  if (!cleaned) {
    return legCount > 1 ? "Accumulator" : "1X2";
  }
  return cleaned.slice(0, 80);
}

function sanitizeText(raw: string, maxLen: number): string {
  const cleaned = raw.replace(/\uFFFD+/g, "'").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 3)}...`;
}

/**
 * Parse a CSV string of historical bets into validated `ParsedImportBet` rows.
 */
export function parseBetsCsv(
  rawCsv: string,
  options?: { defaultBookmaker?: string; overrideBookmaker?: boolean; maxRows?: number }
): CsvImportParseResult {
  const matrix = parseCsvMatrix(rawCsv);
  if (matrix.length < 2) {
    return {
      rows: [],
      skipped: [{ line: 1, reason: "CSV must include a header row and at least one bet row." }],
      totalDataRows: 0,
    };
  }

  const headers = matrix[0];
  const eventIdx = findColumnIndex(headers, HEADER_ALIASES.eventName);
  const legExcluded = new Set<number>();
  if (eventIdx !== -1) legExcluded.add(eventIdx);

  const col = {
    placedAt: findColumnIndex(headers, HEADER_ALIASES.placedAt),
    sport: findColumnIndex(headers, HEADER_ALIASES.sport),
    eventName: eventIdx,
    market: findColumnIndex(headers, HEADER_ALIASES.market),
    selection: findColumnIndex(headers, HEADER_ALIASES.selection),
    bookmaker: findColumnIndex(headers, HEADER_ALIASES.bookmaker),
    odds: findColumnIndex(headers, HEADER_ALIASES.odds),
    stake: findColumnIndex(headers, HEADER_ALIASES.stake),
    status: findColumnIndex(headers, HEADER_ALIASES.status),
    cashoutAmount: findColumnIndex(headers, HEADER_ALIASES.cashoutAmount),
    closingOdds: findColumnIndex(headers, HEADER_ALIASES.closingOdds),
    legCount: findColumnIndex(headers, HEADER_ALIASES.legCount, legExcluded),
    notes: findColumnIndex(headers, HEADER_ALIASES.notes),
  };

  const hasOddsOrReturn = col.odds !== -1 || col.cashoutAmount !== -1;

  if (!hasOddsOrReturn || col.stake === -1 || (col.eventName === -1 && col.selection === -1)) {
    return {
      rows: [],
      skipped: [
        {
          line: 1,
          reason:
            "Missing required columns. Include at least: event (or selection), stake, and odds (or return/payout).",
        },
      ],
      totalDataRows: matrix.length - 1,
    };
  }

  const maxRows = options?.maxRows ?? 500;
  const defaultBookie = options?.defaultBookmaker?.trim() || null;
  const overrideBookie = Boolean(options?.overrideBookmaker && defaultBookie);
  const dataRows = matrix.slice(1, 1 + maxRows);
  const rows: ParsedImportBet[] = [];
  const skipped: CsvSkippedRow[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const lineNum = i + 2;
    const cells = dataRows[i];
    const get = (idx: number) => (idx >= 0 ? (cells[idx] ?? "").trim() : "");

    const rawEvent = get(col.eventName);
    const rawSelection = col.selection !== col.eventName ? get(col.selection) : "";
    const eventName = sanitizeText(rawEvent || rawSelection, 195);

    if (!eventName) {
      skipped.push({ line: lineNum, reason: "Missing event / selection" });
      continue;
    }

    const stake = parseMoneyOrNumber(get(col.stake));
    if (stake === null || stake <= 0 || stake >= 100_000_000) {
      skipped.push({ line: lineNum, reason: `Invalid stake ("${get(col.stake)}")` });
      continue;
    }

    const rawLegs = parseMoneyOrNumber(get(col.legCount));
    const inferredLegs = inferLegCountFromText(rawEvent || rawSelection);
    const rawMarket = get(col.market);
    const baseLegs = Math.max(
      rawLegs !== null && rawLegs >= 1 ? Math.round(rawLegs) : 1,
      inferredLegs,
    );
    const legCount = Math.min(
      50,
      baseLegs > 1
        ? baseLegs
        : rawMarket.toLowerCase().includes("accum") || rawMarket.toLowerCase() === "multiple"
          ? 2
          : 1,
    );

    const market = normalizeMarketLabel(rawMarket, legCount);
    const selection = sanitizeText(
      rawSelection || (legCount > 1 ? `${market} (${legCount} legs)` : rawEvent),
      195,
    );

    let status = normalizeBetStatus(get(col.status));
    const rawReturn = parseMoneyOrNumber(get(col.cashoutAmount));
    let odds = parseMoneyOrNumber(get(col.odds));
    let cashoutAmount: number | null =
      status === "cashed_out" ? Math.max(0, rawReturn ?? 0) : null;

    if (odds === null || odds <= 1 || odds >= 10000) {
      if (col.odds !== -1 && get(col.odds) !== "") {
        skipped.push({ line: lineNum, reason: `Invalid odds ("${get(col.odds)}")` });
        continue;
      }
      // CSV has no explicit Odds column — derive realized odds from Return / Stake
      if (status === "won" && rawReturn !== null && rawReturn > stake) {
        const derived = Math.round((rawReturn / stake) * 100) / 100;
        odds = Math.min(9999, Math.max(1.01, derived));
      } else if (
        (status === "won" || status === "cashed_out") &&
        rawReturn !== null &&
        rawReturn > 0 &&
        rawReturn <= stake
      ) {
        // Partial return / Flexi-cut / Cash-out where return <= stake: record exact return
        status = "cashed_out";
        cashoutAmount = rawReturn;
        odds = 1.5;
      } else {
        // Lost / Void / Pending without an odds column: profit is exact (-stake or 0)
        // regardless of odds; use a neutral leg-scaled placeholder so row is preserved.
        odds =
          legCount === 1
            ? 1.8
            : Math.min(25, Math.round(Math.pow(1.45, Math.min(legCount, 10)) * 100) / 100);
      }
    }

    const rawClosing = parseMoneyOrNumber(get(col.closingOdds));
    const closingOdds = rawClosing !== null && rawClosing > 1 ? rawClosing : null;

    const rawDate = get(col.placedAt);
    const placedAt =
      rawDate && !Number.isNaN(Date.parse(rawDate))
        ? new Date(rawDate).toISOString()
        : undefined;

    const bookmaker =
      ((overrideBookie ? defaultBookie : get(col.bookmaker) || defaultBookie) || "").slice(0, 80) ||
      null;
    const sport = (get(col.sport) || "football").slice(0, 40).toLowerCase();
    const notes = sanitizeText(get(col.notes), 1000) || null;

    rows.push({
      placedAt,
      sport,
      eventName,
      market,
      selection,
      bookmaker,
      odds,
      stake,
      status,
      cashoutAmount,
      closingOdds,
      legCount,
      notes,
    });
  }

  return {
    rows,
    skipped,
    totalDataRows: matrix.length - 1,
  };
}
