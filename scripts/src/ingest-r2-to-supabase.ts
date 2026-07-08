/**
 * ingest-r2-to-supabase.ts
 *
 * Reads FDCO CSVs archived in Cloudflare R2 and upserts them into Supabase
 * (historical_matches + match_odds tables).
 *
 * Prerequisites:
 *   1. Run all migrations in Supabase SQL editor first (scripts/all_migrations.sql)
 *   2. R2 bucket must be populated (pnpm --filter @workspace/scripts run seed-r2)
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run ingest-r2
 *
 *   # Ingest a single league only:
 *   LEAGUE=E0 pnpm --filter @workspace/scripts run ingest-r2
 *
 * Required secrets:
 *   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────

const BUCKET      = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const ACCOUNT_ID  = process.env.CLOUDFLARE_ACCOUNT_ID!;
const ACCESS_KEY  = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const SECRET_KEY  = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ONLY_LEAGUE  = process.env.LEAGUE ?? null; // optional filter

for (const [k, v] of Object.entries({ BUCKET, ACCOUNT_ID, ACCESS_KEY, SECRET_KEY, SUPABASE_URL, SUPABASE_KEY })) {
  if (!v) { console.error(`❌ Missing env var: ${k}`); process.exit(1); }
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── League map ────────────────────────────────────────────────────────────────

const LEAGUE_NAMES: Record<string, string> = {
  E0: "Premier League", E1: "Championship", E2: "League One",
  E3: "League Two", EC: "National League",
  SP1: "La Liga", SP2: "La Liga 2",
  D1: "Bundesliga", D2: "Bundesliga 2",
  I1: "Serie A", I2: "Serie B",
  F1: "Ligue 1", F2: "Ligue 2",
  N1: "Eredivisie", P1: "Primeira Liga", SC0: "Scottish Premiership",
};

// ── CSV parsing (self-contained copy of lib/r2/csv-parser.ts logic) ───────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseDate(raw: string): string | null {
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

function num(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseFloat(v.trim());
  return isNaN(n) ? null : n;
}
function int(v: string | undefined): number | null {
  const n = num(v);
  return n !== null ? Math.round(n) : null;
}

function tokeniseLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { fields.push(current.trim()); current = ""; }
      else current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];
  const headers = tokeniseLine(lines[0]).map(h => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = tokeniseLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, ""); });
      return obj;
    })
    .filter(r => r["HomeTeam"] && r["AwayTeam"]);
}

function seasonCodeToLabel(code: string): string {
  // "9394" → "1993/94", "2425" → "2024/25"
  const yy1 = parseInt(code.slice(0, 2), 10);
  const yy2 = code.slice(2);
  const year1 = yy1 >= 93 ? 1900 + yy1 : 2000 + yy1;
  return `${year1}/${yy2}`;
}

const BOOKMAKERS = [
  { key: "B365", cols: ["B365H", "B365D", "B365A"] as const },
  { key: "PS",   cols: ["PSH",   "PSD",   "PSA"]   as const },
  { key: "WH",   cols: ["WHH",   "WHD",   "WHA"]   as const },
  { key: "VC",   cols: ["VCH",   "VCD",   "VCA"]   as const },
  { key: "BW",   cols: ["BWH",   "BWD",   "BWA"]   as const },
  { key: "IW",   cols: ["IWH",   "IWD",   "IWA"]   as const },
];

interface ParsedMatch {
  source: string; external_id: string; league_code: string; league_name: string;
  season: string; match_date: string; match_time: string | null;
  home_team: string; away_team: string;
  home_goals: number | null; away_goals: number | null; result: string | null;
  ht_home_goals: number | null; ht_away_goals: number | null;
  home_shots: number | null; away_shots: number | null;
  home_shots_on_target: number | null; away_shots_on_target: number | null;
  home_corners: number | null; away_corners: number | null;
  home_fouls: number | null; away_fouls: number | null;
  home_yellow_cards: number | null; away_yellow_cards: number | null;
  home_red_cards: number | null; away_red_cards: number | null;
  avg_home_odds: number | null; avg_draw_odds: number | null; avg_away_odds: number | null;
  max_home_odds: number | null; max_draw_odds: number | null; max_away_odds: number | null;
  over25_odds: number | null; under25_odds: number | null;
  max_over25_odds: number | null; max_under25_odds: number | null;
  handi_size: number | null; handi_home_odds: number | null; handi_away_odds: number | null;
}

function rowToMatch(row: Record<string, string>, leagueCode: string, leagueName: string, season: string): ParsedMatch | null {
  const matchDate = parseDate(row["Date"] ?? "");
  const homeTeam  = row["HomeTeam"]?.trim();
  const awayTeam  = row["AwayTeam"]?.trim();
  if (!matchDate || !homeTeam || !awayTeam) return null;
  const externalId = `${leagueCode}_${matchDate}_${slugify(homeTeam)}_${slugify(awayTeam)}`;
  const result = row["FTR"]?.trim() || row["Res"]?.trim() || null;
  return {
    source: "football-data-co-uk", external_id: externalId,
    league_code: leagueCode, league_name: leagueName, season,
    match_date: matchDate, match_time: row["Time"]?.trim() || null,
    home_team: homeTeam, away_team: awayTeam,
    home_goals: int(row["FTHG"] ?? row["HG"]), away_goals: int(row["FTAG"] ?? row["AG"]),
    result: result && ["H","D","A"].includes(result) ? result : null,
    ht_home_goals: int(row["HTHG"]), ht_away_goals: int(row["HTAG"]),
    home_shots: int(row["HS"]), away_shots: int(row["AS"]),
    home_shots_on_target: int(row["HST"]), away_shots_on_target: int(row["AST"]),
    home_corners: int(row["HC"]), away_corners: int(row["AC"]),
    home_fouls: int(row["HF"]), away_fouls: int(row["AF"]),
    home_yellow_cards: int(row["HY"]), away_yellow_cards: int(row["AY"]),
    home_red_cards: int(row["HR"]), away_red_cards: int(row["AR"]),
    avg_home_odds: num(row["AvgH"] ?? row["BbAvH"]), avg_draw_odds: num(row["AvgD"] ?? row["BbAvD"]), avg_away_odds: num(row["AvgA"] ?? row["BbAvA"]),
    max_home_odds: num(row["MaxH"] ?? row["BbMxH"]), max_draw_odds: num(row["MaxD"] ?? row["BbMxD"]), max_away_odds: num(row["MaxA"] ?? row["BbMxA"]),
    over25_odds: num(row["AvgO2.5"] ?? row["BbAv>2.5"]), under25_odds: num(row["AvgU2.5"] ?? row["BbAv<2.5"]),
    max_over25_odds: num(row["MaxO2.5"] ?? row["BbMx>2.5"]), max_under25_odds: num(row["MaxU2.5"] ?? row["BbMx<2.5"]),
    handi_size: num(row["AHh"] ?? row["BbAHh"]), handi_home_odds: num(row["AvgAHH"] ?? row["BbAvAHH"]), handi_away_odds: num(row["AvgAHA"] ?? row["BbAvAHA"]),
  };
}

// ── R2 helpers ────────────────────────────────────────────────────────────────

async function listR2Keys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }));
    for (const obj of res.Contents ?? []) if (obj.Key) keys.push(obj.Key);
    token = res.NextContinuationToken;
  } while (token);
  return keys;
}

async function getR2Object(key: string): Promise<string> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks: Buffer[] = [];
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

// ── Supabase upsert ───────────────────────────────────────────────────────────

const BATCH = 150;

async function upsertSeason(
  sb: SupabaseClient,
  rows: Record<string, string>[],
  leagueCode: string,
  leagueName: string,
  season: string
): Promise<{ matches: number; odds: number }> {
  const matches: ParsedMatch[] = [];
  const oddsMap = new Map<string, { bookmaker: string; home_odds: number | null; draw_odds: number | null; away_odds: number | null }[]>();

  for (const row of rows) {
    const m = rowToMatch(row, leagueCode, leagueName, season);
    if (!m) continue;
    matches.push(m);
    const bookOdds = BOOKMAKERS.flatMap(bm => {
      const h = num(row[bm.cols[0]]); const d = num(row[bm.cols[1]]); const a = num(row[bm.cols[2]]);
      if (h === null && d === null && a === null) return [];
      return [{ bookmaker: bm.key, home_odds: h, draw_odds: d, away_odds: a }];
    });
    if (bookOdds.length) oddsMap.set(m.external_id, bookOdds);
  }

  let matchCount = 0;
  let oddsCount  = 0;

  for (let i = 0; i < matches.length; i += BATCH) {
    const batch = matches.slice(i, i + BATCH);
    const { data: upserted, error } = await sb
      .from("historical_matches")
      .upsert(batch, { onConflict: "external_id", ignoreDuplicates: false })
      .select("id, external_id");

    if (error) throw new Error(`Match upsert error: ${error.message}`);
    matchCount += batch.length;

    const idMap = new Map((upserted ?? []).map(r => [r.external_id as string, r.id as string]));
    const oddsRows = batch.flatMap(m => {
      const matchId = idMap.get(m.external_id);
      if (!matchId) return [];
      return (oddsMap.get(m.external_id) ?? []).map(o => ({ match_id: matchId, ...o }));
    });

    if (oddsRows.length > 0) {
      const { error: oddsErr } = await sb
        .from("match_odds")
        .upsert(oddsRows, { onConflict: "match_id, bookmaker", ignoreDuplicates: false });
      if (oddsErr) throw new Error(`Odds upsert error: ${oddsErr.message}`);
      oddsCount += oddsRows.length;
    }
  }

  return { matches: matchCount, odds: oddsCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 R2 → Supabase Ingest");
  console.log(`   Supabase : ${SUPABASE_URL}`);
  console.log(`   Bucket   : ${BUCKET}`);
  if (ONLY_LEAGUE) console.log(`   Filter   : ${ONLY_LEAGUE} only`);
  console.log();

  // Verify historical_matches table exists
  const { error: checkErr } = await supabase.from("historical_matches").select("id").limit(1);
  if (checkErr) {
    console.error("❌ Cannot read historical_matches table.");
    console.error("   Run scripts/all_migrations.sql in Supabase SQL Editor first.");
    console.error("   Error:", checkErr.message);
    process.exit(1);
  }

  // List all FDCO CSVs in R2 (skip datahub/ prefix — no odds there)
  console.log("🔍 Listing R2 objects under football/ (excluding datahub)...");
  const allKeys = await listR2Keys("football/");
  const fdcoKeys = allKeys.filter(k => !k.includes("/datahub/") && k.endsWith(".csv"));
  console.log(`   Found ${fdcoKeys.length} FDCO CSVs\n`);

  // Group by league
  const byLeague = new Map<string, string[]>();
  for (const key of fdcoKeys) {
    // key format: football/{leagueCode}/{seasonCode}.csv
    const parts = key.split("/");
    if (parts.length !== 3) continue;
    const leagueCode = parts[1];
    if (ONLY_LEAGUE && leagueCode !== ONLY_LEAGUE) continue;
    if (!byLeague.has(leagueCode)) byLeague.set(leagueCode, []);
    byLeague.get(leagueCode)!.push(key);
  }

  const stats = { totalMatches: 0, totalOdds: 0, errors: 0, seasons: 0 };

  for (const [leagueCode, keys] of byLeague) {
    const leagueName = LEAGUE_NAMES[leagueCode] ?? leagueCode;
    process.stdout.write(`\n📋 ${leagueName} (${leagueCode}) — ${keys.length} seasons\n`);

    for (const key of keys.sort()) {
      // Extract season code from key: football/E0/9394.csv → 9394
      const seasonCode = key.split("/")[2].replace(".csv", "");
      const season = seasonCodeToLabel(seasonCode);

      try {
        const csv  = await getR2Object(key);
        const rows = parseCsv(csv);
        if (rows.length === 0) {
          process.stdout.write(`   ⚠️  ${season} — empty CSV, skipped\n`);
          continue;
        }

        const result = await upsertSeason(supabase, rows, leagueCode, leagueName, season);
        process.stdout.write(`   ✅ ${season} — ${result.matches} matches, ${result.odds} odds rows\n`);
        stats.totalMatches += result.matches;
        stats.totalOdds    += result.odds;
        stats.seasons++;
      } catch (err) {
        process.stdout.write(`   ❌ ${season} — ${(err as Error).message}\n`);
        stats.errors++;
      }
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ Seasons ingested : ${stats.seasons}`);
  console.log(`   Total matches    : ${stats.totalMatches.toLocaleString()}`);
  console.log(`   Total odds rows  : ${stats.totalOdds.toLocaleString()}`);
  console.log(`❌ Errors           : ${stats.errors}`);
  console.log("─────────────────────────────────────────");
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
