#!/usr/bin/env node
/**
 * Bulk-seed historical match data from a CSV file into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/seed-matches.mts /path/to/Matches.csv
 *
 * Column mapping (CSV → DB):
 *   Division       → league_code
 *   MatchDate      → match_date
 *   MatchTime      → match_time
 *   HomeTeam       → home_team
 *   AwayTeam       → away_team
 *   HomeElo/AwayElo → home_elo / away_elo
 *   FTHome/FTAway  → home_goals / away_goals
 *   FTResult       → result
 *   HTHome/HTAway  → ht_home_goals / ht_away_goals
 *   etc.
 */

import * as fs from "node:fs";
import * as readline from "node:readline";
import { createClient } from "@supabase/supabase-js";

// ── League name map ────────────────────────────────────────────────────────
const LEAGUE_NAME: Record<string, string> = {
  E0: "Premier League",        E1: "Championship",
  E2: "League One",            E3: "League Two",
  EC: "National League",       SP1: "La Liga",
  SP2: "Segunda División",     D1: "Bundesliga",
  D2: "2. Bundesliga",         I1: "Serie A",
  I2: "Serie B",               F1: "Ligue 1",
  F2: "Ligue 2",               N1: "Eredivisie",
  B1: "First Division A",      P1: "Primeira Liga",
  T1: "Süper Lig",             SC0: "Scottish Premiership",
  SC1: "Scottish Championship",G1: "Super League",
};

function leagueName(code: string): string {
  return LEAGUE_NAME[code] ?? code;
}

function deriveSeason(matchDate: string): string {
  const d = new Date(matchDate);
  if (isNaN(d.getTime())) return "unknown";
  const year  = d.getFullYear();
  const month = d.getMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  const endYY = String(startYear + 1).slice(2).padStart(2, "0");
  return `${startYear}/${endYY}`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function num(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function int(v: string | undefined): number | null {
  const n = num(v);
  return n !== null ? Math.round(n) : null;
}

// ── CLI arg handling ───────────────────────────────────────────────────────
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: npx tsx scripts/seed-matches.mts <path-to-csv>");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Streaming CSV parse ────────────────────────────────────────────────────
const BATCH_SIZE = 200;

async function run() {
  const stream = fs.createReadStream(csvPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers: string[] = [];
  let batch: Record<string, string>[] = [];
  let total = 0;
  let skipped = 0;

  async function flush() {
    if (batch.length === 0) return;

    const rows = batch
      .map((row) => {
        const div       = row["Division"]?.trim();
        const matchDate = row["MatchDate"]?.trim();
        const homeTeam  = row["HomeTeam"]?.trim();
        const awayTeam  = row["AwayTeam"]?.trim();
        const ftResult  = row["FTResult"]?.trim();

        if (!div || !matchDate || !homeTeam || !awayTeam || !ftResult) return null;

        const season     = deriveSeason(matchDate);
        const externalId = `${div}_${matchDate}_${slugify(homeTeam)}_${slugify(awayTeam)}`;

        return {
          source:       "uploaded-csv",
          external_id:  externalId,
          league_code:  div,
          league_name:  leagueName(div),
          season,
          match_date:   matchDate,
          match_time:   row["MatchTime"]?.trim() || null,
          home_team:    homeTeam,
          away_team:    awayTeam,

          home_goals:   int(row["FTHome"]),
          away_goals:   int(row["FTAway"]),
          result:       ftResult || null,
          ht_home_goals: int(row["HTHome"]),
          ht_away_goals: int(row["HTAway"]),

          home_shots:               int(row["HomeShots"]),
          away_shots:               int(row["AwayShots"]),
          home_shots_on_target:     int(row["HomeTarget"]),
          away_shots_on_target:     int(row["AwayTarget"]),
          home_fouls:               int(row["HomeFouls"]),
          away_fouls:               int(row["AwayFouls"]),
          home_corners:             int(row["HomeCorners"]),
          away_corners:             int(row["AwayCorners"]),
          home_yellow_cards:        int(row["HomeYellow"]),
          away_yellow_cards:        int(row["AwayYellow"]),
          home_red_cards:           int(row["HomeRed"]),
          away_red_cards:           int(row["AwayRed"]),

          home_elo:   num(row["HomeElo"]),
          away_elo:   num(row["AwayElo"]),
          form3_home: num(row["Form3Home"]),
          form5_home: num(row["Form5Home"]),
          form3_away: num(row["Form3Away"]),
          form5_away: num(row["Form5Away"]),

          avg_home_odds: num(row["OddHome"]),
          avg_draw_odds: num(row["OddDraw"]),
          avg_away_odds: num(row["OddAway"]),
          max_home_odds: num(row["MaxHome"]),
          max_draw_odds: num(row["MaxDraw"]),
          max_away_odds: num(row["MaxAway"]),

          over25_odds:      num(row["Over25"]),
          under25_odds:     num(row["Under25"]),
          max_over25_odds:  num(row["MaxOver25"]),
          max_under25_odds: num(row["MaxUnder25"]),

          handi_size:       num(row["HandiSize"]),
          handi_home_odds:  num(row["HandiHome"]),
          handi_away_odds:  num(row["HandiAway"]),

          prob_lth: num(row["C_LTH"]),
          prob_lta: num(row["C_LTA"]),
          prob_vhd: num(row["C_VHD"]),
          prob_vad: num(row["C_VAD"]),
          prob_htb: num(row["C_HTB"]),
          prob_phb: num(row["C_PHB"]),
        };
      })
      .filter((r) => r !== null);

    skipped += batch.length - rows.length;

    if (rows.length === 0) {
      batch = [];
      return;
    }

    const { error } = await supabase
      .from("historical_matches")
      .upsert(rows, { onConflict: "external_id", ignoreDuplicates: false });

    if (error) {
      console.error(`  Upsert error: ${error.message}`);
    } else {
      total += rows.length;
      process.stdout.write(`\r  Inserted ${total.toLocaleString()} rows (skipped ${skipped})...`);
    }

    batch = [];
  }

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (headers.length === 0) {
      headers = line.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      continue;
    }

    const vals = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim(); });
    batch.push(row);

    if (batch.length >= BATCH_SIZE) await flush();
  }

  await flush();

  console.log(`\n\nDone. Inserted ${total.toLocaleString()} rows, skipped ${skipped} incomplete rows.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
