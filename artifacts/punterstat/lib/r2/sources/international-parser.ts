/**
 * Parser for the Kaggle international football results dataset.
 * Source: kaggle.com/martj42/international-football-results-from-1872-to-2017
 *
 * Three files:
 *   results.csv     — one row per match (date, teams, scores, tournament, venue)
 *   goalscorers.csv — one row per goal (scorer, minute, own_goal, penalty)
 *   shootouts.csv   — one row per penalty shootout result
 *
 * Rows are inserted into:
 *   public.international_matches
 *   public.international_goalscorers
 *   public.international_shootouts
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Shared utilities ──────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function boolField(v: string | undefined): boolean {
  return (v ?? "").trim().toUpperCase() === "TRUE";
}

function intField(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseInt(v.trim(), 10);
  return isNaN(n) ? null : n;
}

/** Parse "90+2" and plain "67" minute strings → integer, null if unparseable */
function parseMinute(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  const clean = v.trim().split("+")[0];
  const n = parseInt(clean, 10);
  return isNaN(n) ? null : n;
}

function parseCsvLines(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = line.split(",");
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (vals[i] ?? "").trim().replace(/^"|"$/g, "");
      });
      return obj;
    });
}

// ── Match records ─────────────────────────────────────────────────────────────

interface ParsedIntlMatch {
  source: string;
  external_id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  result: string | null;
  tournament: string | null;
  city: string | null;
  country: string | null;
  neutral: boolean;
}

export function parseResultsCsv(raw: string): ParsedIntlMatch[] {
  const rows = parseCsvLines(raw);
  const out: ParsedIntlMatch[] = [];

  for (const row of rows) {
    const date     = row["date"]?.trim();
    const homeTeam = row["home_team"]?.trim();
    const awayTeam = row["away_team"]?.trim();
    if (!date || !homeTeam || !awayTeam) continue;

    const homeScore = intField(row["home_score"]);
    const awayScore = intField(row["away_score"]);

    let result: string | null = null;
    if (homeScore !== null && awayScore !== null) {
      result = homeScore > awayScore ? "H" : homeScore < awayScore ? "A" : "D";
    }

    out.push({
      source: "kaggle-martj42",
      external_id: `${date}_${slugify(homeTeam)}_${slugify(awayTeam)}`,
      match_date: date,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: homeScore,
      away_score: awayScore,
      result,
      tournament: row["tournament"]?.trim() || null,
      city:       row["city"]?.trim()       || null,
      country:    row["country"]?.trim()    || null,
      neutral:    boolField(row["neutral"]),
    });
  }

  return out;
}

// ── Goalscorer records ────────────────────────────────────────────────────────

interface ParsedGoalscorer {
  match_date: string;
  home_team: string;
  away_team: string;
  team: string;
  scorer: string;
  minute: number | null;
  own_goal: boolean;
  penalty: boolean;
}

export function parseGoalscorersCsv(raw: string): ParsedGoalscorer[] {
  const rows = parseCsvLines(raw);
  const out: ParsedGoalscorer[] = [];

  for (const row of rows) {
    const date     = row["date"]?.trim();
    const homeTeam = row["home_team"]?.trim();
    const awayTeam = row["away_team"]?.trim();
    const team     = row["team"]?.trim();
    const scorer   = row["scorer"]?.trim();
    if (!date || !homeTeam || !awayTeam || !team || !scorer) continue;

    out.push({
      match_date: date,
      home_team:  homeTeam,
      away_team:  awayTeam,
      team,
      scorer,
      minute:   parseMinute(row["minute"]),
      own_goal: boolField(row["own_goal"]),
      penalty:  boolField(row["penalty"]),
    });
  }

  return out;
}

// ── Shootout records ──────────────────────────────────────────────────────────

interface ParsedShootout {
  match_date: string;
  home_team: string;
  away_team: string;
  winner: string;
  first_shooter: string | null;
}

export function parseShootoutsCsv(raw: string): ParsedShootout[] {
  const rows = parseCsvLines(raw);
  const out: ParsedShootout[] = [];

  for (const row of rows) {
    const date     = row["date"]?.trim();
    const homeTeam = row["home_team"]?.trim();
    const awayTeam = row["away_team"]?.trim();
    const winner   = row["winner"]?.trim();
    if (!date || !homeTeam || !awayTeam || !winner) continue;

    out.push({
      match_date:    date,
      home_team:     homeTeam,
      away_team:     awayTeam,
      winner,
      first_shooter: row["first_shooter"]?.trim() || null,
    });
  }

  return out;
}

// ── Supabase upsert ───────────────────────────────────────────────────────────

const BATCH = 200;

export interface IntlIngestStats {
  matchesUpserted: number;
  goalscorersUpserted: number;
  shootoutsUpserted: number;
}

export async function upsertInternationalData(
  resultsCsv: string,
  goalscorersCsv: string,
  shootoutsCsv: string,
  supabase: SupabaseClient
): Promise<IntlIngestStats> {
  // ── Matches ────────────────────────────────────────────────────────────────
  const matches = parseResultsCsv(resultsCsv);
  let matchesUpserted = 0;

  // Build lookup: external_id → Supabase UUID (needed to link goalscorers)
  const extIdToUuid = new Map<string, string>();

  for (let i = 0; i < matches.length; i += BATCH) {
    const batch = matches.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from("international_matches")
      .upsert(batch, { onConflict: "external_id", ignoreDuplicates: false })
      .select("id, external_id");

    if (error) throw new Error(`international_matches upsert: ${error.message}`);
    for (const row of data ?? []) {
      extIdToUuid.set(row.external_id as string, row.id as string);
    }
    matchesUpserted += batch.length;
  }

  // ── Goalscorers ────────────────────────────────────────────────────────────
  let goalscorersUpserted = 0;
  if (goalscorersCsv) {
    const goals = parseGoalscorersCsv(goalscorersCsv);
    const withIds = goals.map((g) => ({
      ...g,
      match_id: extIdToUuid.get(
        `${g.match_date}_${slugify(g.home_team)}_${slugify(g.away_team)}`
      ) ?? null,
    }));

    for (let i = 0; i < withIds.length; i += BATCH) {
      const { error } = await supabase
        .from("international_goalscorers")
        .upsert(withIds.slice(i, i + BATCH), {
          onConflict: "match_id, scorer, minute, own_goal, penalty",
          ignoreDuplicates: true,
        });
      if (error) throw new Error(`international_goalscorers upsert: ${error.message}`);
      goalscorersUpserted += Math.min(BATCH, withIds.length - i);
    }
  }

  // ── Shootouts ──────────────────────────────────────────────────────────────
  let shootoutsUpserted = 0;
  if (shootoutsCsv) {
    const shootouts = parseShootoutsCsv(shootoutsCsv);
    for (let i = 0; i < shootouts.length; i += BATCH) {
      const { error } = await supabase
        .from("international_shootouts")
        .upsert(shootouts.slice(i, i + BATCH), {
          onConflict: "match_date, home_team, away_team",
          ignoreDuplicates: false,
        });
      if (error) throw new Error(`international_shootouts upsert: ${error.message}`);
      shootoutsUpserted += Math.min(BATCH, shootouts.length - i);
    }
  }

  return { matchesUpserted, goalscorersUpserted, shootoutsUpserted };
}
