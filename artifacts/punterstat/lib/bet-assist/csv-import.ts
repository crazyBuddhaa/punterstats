/**
 * Pure CSV parser and column mapper for Bet Tracker history uploads.
 * Supports PunterStat's own Export CSV format plus common exports/spreadsheets
 * from SportyBet, Bet9ja, Football.com, BetKing, 1xBet, etc.
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
  placedAt: ["date", "placed_at", "placed at", "time", "datetime", "created_at", "bet_date"],
  sport: ["sport", "category"],
  eventName: ["event", "event_name", "event name", "match", "fixture", "game", "teams", "description"],
  market: ["market", "market_type", "market type", "bet_type", "bet type", "type"],
  selection: ["selection", "pick", "outcome", "tip", "bet"],
  bookmaker: ["bookmaker", "bookie", "site", "platform", "sportsbook"],
  odds: ["odds", "price", "decimal_odds", "decimal odds", "total_odds", "total odds"],
  stake: ["stake", "amount", "wager", "bet_amount", "bet amount", "staked"],
  status: ["status", "result", "state", "settled", "outcome_status"],
  cashoutAmount: ["cashout", "cashout_amount", "cashout amount", "cash_out", "return", "payout"],
  closingOdds: ["closing_odds", "closing odds", "close_odds", "clv_odds"],
  legCount: ["legs", "leg_count", "leg count", "selections", "events"],
  notes: ["notes", "note", "comment", "comments", "booking_code", "betcode", "code"],
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

function findColumnIndex(headers: string[], aliases: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
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
  const col = {
    placedAt: findColumnIndex(headers, HEADER_ALIASES.placedAt),
    sport: findColumnIndex(headers, HEADER_ALIASES.sport),
    eventName: findColumnIndex(headers, HEADER_ALIASES.eventName),
    market: findColumnIndex(headers, HEADER_ALIASES.market),
    selection: findColumnIndex(headers, HEADER_ALIASES.selection),
    bookmaker: findColumnIndex(headers, HEADER_ALIASES.bookmaker),
    odds: findColumnIndex(headers, HEADER_ALIASES.odds),
    stake: findColumnIndex(headers, HEADER_ALIASES.stake),
    status: findColumnIndex(headers, HEADER_ALIASES.status),
    cashoutAmount: findColumnIndex(headers, HEADER_ALIASES.cashoutAmount),
    closingOdds: findColumnIndex(headers, HEADER_ALIASES.closingOdds),
    legCount: findColumnIndex(headers, HEADER_ALIASES.legCount),
    notes: findColumnIndex(headers, HEADER_ALIASES.notes),
  };

  if (col.odds === -1 || col.stake === -1 || (col.eventName === -1 && col.selection === -1)) {
    return {
      rows: [],
      skipped: [
        {
          line: 1,
          reason:
            "Missing required columns. Include at least: event (or selection), odds, and stake.",
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
    const rawSelection = get(col.selection);
    const eventName = (rawEvent || rawSelection).slice(0, 200);
    const selection = (rawSelection || rawEvent).slice(0, 200);

    if (!eventName || !selection) {
      skipped.push({ line: lineNum, reason: "Missing event / selection" });
      continue;
    }

    const odds = parseMoneyOrNumber(get(col.odds));
    if (odds === null || odds <= 1 || odds >= 10000) {
      skipped.push({ line: lineNum, reason: `Invalid odds ("${get(col.odds)}")` });
      continue;
    }

    const stake = parseMoneyOrNumber(get(col.stake));
    if (stake === null || stake <= 0 || stake >= 100_000_000) {
      skipped.push({ line: lineNum, reason: `Invalid stake ("${get(col.stake)}")` });
      continue;
    }

    const status = normalizeBetStatus(get(col.status));
    const rawCashout = parseMoneyOrNumber(get(col.cashoutAmount));
    const cashoutAmount =
      status === "cashed_out" ? Math.max(0, rawCashout ?? 0) : null;

    const rawClosing = parseMoneyOrNumber(get(col.closingOdds));
    const closingOdds = rawClosing !== null && rawClosing > 1 ? rawClosing : null;

    const market = (get(col.market) || "1X2").slice(0, 80);
    const rawLegs = parseMoneyOrNumber(get(col.legCount));
    const legCount =
      rawLegs !== null && rawLegs >= 1
        ? Math.min(50, Math.round(rawLegs))
        : market.toLowerCase().includes("accum")
          ? 2
          : 1;

    const rawDate = get(col.placedAt);
    const placedAt =
      rawDate && !Number.isNaN(Date.parse(rawDate))
        ? new Date(rawDate).toISOString()
        : undefined;

    const bookmaker = (
      (overrideBookie ? defaultBookie : get(col.bookmaker) || defaultBookie) || ""
    ).slice(0, 80) || null;
    const sport = (get(col.sport) || "football").slice(0, 40).toLowerCase();
    const notes = get(col.notes).slice(0, 1000) || null;

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
