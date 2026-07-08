/**
 * Shared CSV parsing utilities for football-data.co.uk format.
 *
 * Extracted from the cron sync route so the same logic is reusable by:
 *   - app/api/cron/sync-season/route.ts  (weekly automated sync)
 *   - lib/r2/ingest.ts                   (ingest from R2 archive)
 *   - scripts/seed-matches.mts           (one-shot seeding)
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Bookmaker column mapping ──────────────────────────────────────────────────

export const BOOKMAKERS = [
  { key: "B365", cols: ["B365H", "B365D", "B365A"] },
  { key: "PS",   cols: ["PSH",   "PSD",   "PSA"]   },
  { key: "WH",   cols: ["WHH",   "WHD",   "WHA"]   },
  { key: "VC",   cols: ["VCH",   "VCD",   "VCA"]   },
  { key: "GBK",  cols: ["GBH",   "GBD",   "GBA"]   },
  { key: "BW",   cols: ["BWH",   "BWD",   "BWA"]   },
  { key: "IW",   cols: ["IWH",   "IWD",   "IWA"]   },
  { key: "SB",   cols: ["SBH",   "SBD",   "SBA"]   },
] as const;

// ── Low-level utilities ───────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Parse a football-data.co.uk date string ("DD/MM/YY" or "DD/MM/YYYY") to
 * ISO "YYYY-MM-DD". Returns null if unparseable.
 */
export function parseDate(raw: string): string | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  let year = parseInt(y, 10);
  if (isNaN(year)) return null;
  if (y.length === 2) year = year >= 93 ? 1900 + year : 2000 + year;
  const month = parseInt(m, 10);
  const day   = parseInt(d, 10);
  if (isNaN(month) || isNaN(day)) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function num(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseFloat(v.trim());
  return isNaN(n) ? null : n;
}

export function int(v: string | undefined): number | null {
  const n = num(v);
  return n !== null ? Math.round(n) : null;
}

/** Build the deterministic external_id key for a match row. */
export function buildExternalId(
  leagueCode: string,
  matchDate: string,
  homeTeam: string,
  awayTeam: string
): string {
  return `${leagueCode}_${matchDate}_${slugify(homeTeam)}_${slugify(awayTeam)}`;
}

// ── CSV → rows ────────────────────────────────────────────────────────────────

/**
 * RFC 4180-compliant CSV line tokeniser.
 * Handles quoted fields, escaped double-quotes (""), and bare commas.
 * Returns one string per field, stripping enclosing quotes but preserving
 * inner whitespace; each value is trimmed of leading/trailing whitespace
 * outside quotes.
 */
function tokeniseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Two consecutive quotes inside a quoted field → literal quote char
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse the raw CSV text from football-data.co.uk into an array of row objects.
 * Uses a proper RFC 4180-compliant tokeniser — handles quoted fields with
 * embedded commas and escaped double-quotes without shifting columns.
 * Filters out rows with no HomeTeam/AwayTeam (blank trailing lines, etc.).
 */
export function parseFDCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = tokeniseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = tokeniseCsvLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (vals[i] ?? "").replace(/^"|"$/g, "");
      });
      return obj;
    })
    .filter((row) => row["HomeTeam"] && row["AwayTeam"]);
}

// ── Row → Supabase record ─────────────────────────────────────────────────────

export interface ParsedMatch {
  source: string;
  external_id: string;
  league_code: string;
  league_name: string;
  season: string;
  match_date: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  result: string | null;
  ht_home_goals: number | null;
  ht_away_goals: number | null;
  home_shots: number | null;
  away_shots: number | null;
  home_shots_on_target: number | null;
  away_shots_on_target: number | null;
  home_corners: number | null;
  away_corners: number | null;
  home_fouls: number | null;
  away_fouls: number | null;
  home_yellow_cards: number | null;
  away_yellow_cards: number | null;
  home_red_cards: number | null;
  away_red_cards: number | null;
  avg_home_odds: number | null;
  avg_draw_odds: number | null;
  avg_away_odds: number | null;
  max_home_odds: number | null;
  max_draw_odds: number | null;
  max_away_odds: number | null;
  over25_odds: number | null;
  under25_odds: number | null;
  max_over25_odds: number | null;
  max_under25_odds: number | null;
  handi_size: number | null;
  handi_home_odds: number | null;
  handi_away_odds: number | null;
  prob_lth: number | null;
  prob_lta: number | null;
  prob_vhd: number | null;
  prob_vad: number | null;
  prob_htb: number | null;
  prob_phb: number | null;
}

/**
 * Convert one CSV row object into a ParsedMatch ready for Supabase upsert.
 * Returns null if the row cannot be mapped (missing date, teams, etc.).
 */
export function rowToMatch(
  row: Record<string, string>,
  leagueCode: string,
  leagueName: string,
  seasonLabel: string
): ParsedMatch | null {
  const matchDate = parseDate(row["Date"] ?? "");
  const homeTeam  = row["HomeTeam"]?.trim();
  const awayTeam  = row["AwayTeam"]?.trim();

  if (!matchDate || !homeTeam || !awayTeam) return null;

  const externalId = buildExternalId(leagueCode, matchDate, homeTeam, awayTeam);
  const result = row["FTR"]?.trim() || row["Res"]?.trim() || null;

  return {
    source: "football-data-co-uk",
    external_id: externalId,
    league_code: leagueCode,
    league_name: leagueName,
    season: seasonLabel,
    match_date: matchDate,
    match_time: row["Time"]?.trim() || null,
    home_team: homeTeam,
    away_team: awayTeam,

    // Full-time goals
    home_goals: int(row["FTHG"] ?? row["HG"]),
    away_goals: int(row["FTAG"] ?? row["AG"]),
    result: result && ["H", "D", "A"].includes(result) ? result : null,

    // Half-time goals
    ht_home_goals: int(row["HTHG"]),
    ht_away_goals: int(row["HTAG"]),

    // Match stats
    home_shots:            int(row["HS"]),
    away_shots:            int(row["AS"]),
    home_shots_on_target:  int(row["HST"]),
    away_shots_on_target:  int(row["AST"]),
    home_corners:          int(row["HC"]),
    away_corners:          int(row["AC"]),
    home_fouls:            int(row["HF"]),
    away_fouls:            int(row["AF"]),
    home_yellow_cards:     int(row["HY"]),
    away_yellow_cards:     int(row["AY"]),
    home_red_cards:        int(row["HR"]),
    away_red_cards:        int(row["AR"]),

    // Market averages and bests
    avg_home_odds:  num(row["AvgH"]  ?? row["BbAvH"]),
    avg_draw_odds:  num(row["AvgD"]  ?? row["BbAvD"]),
    avg_away_odds:  num(row["AvgA"]  ?? row["BbAvA"]),
    max_home_odds:  num(row["MaxH"]  ?? row["BbMxH"]),
    max_draw_odds:  num(row["MaxD"]  ?? row["BbMxD"]),
    max_away_odds:  num(row["MaxA"]  ?? row["BbMxA"]),

    // Over/Under 2.5
    over25_odds:     num(row["AvgO2.5"] ?? row["BbAv>2.5"]),
    under25_odds:    num(row["AvgU2.5"] ?? row["BbAv<2.5"]),
    max_over25_odds:  num(row["MaxO2.5"] ?? row["BbMx>2.5"]),
    max_under25_odds: num(row["MaxU2.5"] ?? row["BbMx<2.5"]),

    // Asian handicap
    handi_size:      num(row["AHh"]  ?? row["BbAHh"]),
    handi_home_odds: num(row["AvgAHH"] ?? row["BbAvAHH"]),
    handi_away_odds: num(row["AvgAHA"] ?? row["BbAvAHA"]),

    // Calibrated model probabilities
    prob_lth: num(row["C_LTH"] ?? row["PSCH"]),
    prob_lta: num(row["C_LTA"] ?? row["PSCA"]),
    prob_vhd: num(row["C_VHD"]),
    prob_vad: num(row["C_VAD"]),
    prob_htb: num(row["C_HTB"]),
    prob_phb: num(row["C_PHB"]),
  };
}

// ── Odds rows ─────────────────────────────────────────────────────────────────

export interface ParsedOddsRow {
  match_external_id: string;
  bookmaker: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
}

/**
 * Extract individual bookmaker odds from one CSV row.
 * Returns one entry per bookmaker that has at least one non-null price.
 */
export function rowToOdds(
  row: Record<string, string>,
  externalId: string
): ParsedOddsRow[] {
  return BOOKMAKERS.flatMap((bm) => {
    const h = num(row[bm.cols[0]]);
    const d = num(row[bm.cols[1]]);
    const a = num(row[bm.cols[2]]);
    if (h === null && d === null && a === null) return [];
    return [{
      match_external_id: externalId,
      bookmaker: bm.key,
      home_odds: h,
      draw_odds: d,
      away_odds: a,
    }];
  });
}

// ── Batch upsert ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 100;

export interface UpsertStats {
  matchesUpserted: number;
  oddsUpserted: number;
}

/**
 * Upsert all matches and odds from a parsed CSV into Supabase.
 * Uses batches of BATCH_SIZE to stay within Supabase payload limits.
 *
 * @param rows         The raw CSV row objects from parseFDCsv()
 * @param leagueCode   e.g. "E0"
 * @param leagueName   e.g. "Premier League"
 * @param seasonLabel  e.g. "2024/25"
 * @param supabase     An admin-client Supabase instance (service role)
 */
export async function upsertMatchesAndOdds(
  rows: Record<string, string>[],
  leagueCode: string,
  leagueName: string,
  seasonLabel: string,
  supabase: SupabaseClient
): Promise<UpsertStats> {
  const matches: ParsedMatch[] = [];
  const oddsMap = new Map<string, ParsedOddsRow[]>();

  for (const row of rows) {
    const match = rowToMatch(row, leagueCode, leagueName, seasonLabel);
    if (!match) continue;
    matches.push(match);
    const odds = rowToOdds(row, match.external_id);
    if (odds.length) oddsMap.set(match.external_id, odds);
  }

  let matchesUpserted = 0;
  let oddsUpserted = 0;

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);

    const { data: upserted, error: matchErr } = await supabase
      .from("historical_matches")
      .upsert(batch, { onConflict: "external_id", ignoreDuplicates: false })
      .select("id, external_id");

    if (matchErr) throw new Error(`Match upsert failed: ${matchErr.message}`);

    matchesUpserted += batch.length;

    // Build odds rows now that we have the real UUIDs
    const idMap = new Map(
      (upserted ?? []).map((r) => [r.external_id as string, r.id as string])
    );

    const oddsRows = batch.flatMap((m) => {
      const matchId = idMap.get(m.external_id);
      if (!matchId) return [];
      return (oddsMap.get(m.external_id) ?? []).map((o) => ({
        match_id: matchId,
        bookmaker: o.bookmaker,
        home_odds: o.home_odds,
        draw_odds: o.draw_odds,
        away_odds: o.away_odds,
      }));
    });

    if (oddsRows.length > 0) {
      const { error: oddsErr } = await supabase
        .from("match_odds")
        .upsert(oddsRows, { onConflict: "match_id, bookmaker", ignoreDuplicates: false });
      if (oddsErr) throw new Error(`Odds upsert failed: ${oddsErr.message}`);
      oddsUpserted += oddsRows.length;
    }
  }

  return { matchesUpserted, oddsUpserted };
}
