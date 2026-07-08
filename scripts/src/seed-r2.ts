/**
 * seed-r2.ts
 *
 * Downloads football CSV data from two sources and archives everything to
 * Cloudflare R2 under the standard key layout:
 *
 *   football/{leagueCode}/{seasonCode}.csv
 *   football/datahub/E0/{seasonCode}.csv   ← clean DataHub mirror (no odds, consistent schema)
 *   international/                          ← placeholder for Kaggle data
 *   manifest.json
 *
 * Sources:
 *  1. DataHub.io  — EPL only, 1993/94→2025/26 (33 seasons), clean schema, no auth
 *  2. FDCO        — 16 leagues, 1993/94→2025/26, includes bookmaker odds, no auth
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-r2
 *
 * Required env vars (set as Replit Secrets):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_R2_ACCESS_KEY_ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY
 *   CLOUDFLARE_R2_BUCKET_NAME
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// ── Config ────────────────────────────────────────────────────────────────────

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;

if (!BUCKET || !ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  console.error("❌ Missing R2 credentials. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// ── League definitions ────────────────────────────────────────────────────────

const LEAGUES: Array<{ code: string; name: string; fromYear: number }> = [
  { code: "E0",  name: "Premier League",       fromYear: 1993 },
  { code: "E1",  name: "Championship",          fromYear: 1993 },
  { code: "E2",  name: "League One",            fromYear: 1993 },
  { code: "E3",  name: "League Two",            fromYear: 1993 },
  { code: "EC",  name: "National League",       fromYear: 2005 },
  { code: "SP1", name: "La Liga",               fromYear: 1993 },
  { code: "SP2", name: "La Liga 2",             fromYear: 1995 },
  { code: "D1",  name: "Bundesliga",            fromYear: 1993 },
  { code: "D2",  name: "Bundesliga 2",          fromYear: 1993 },
  { code: "I1",  name: "Serie A",               fromYear: 1993 },
  { code: "I2",  name: "Serie B",               fromYear: 1994 },
  { code: "F1",  name: "Ligue 1",               fromYear: 1993 },
  { code: "F2",  name: "Ligue 2",               fromYear: 1993 },
  { code: "N1",  name: "Eredivisie",            fromYear: 1993 },
  { code: "P1",  name: "Primeira Liga",         fromYear: 1994 },
  { code: "SC0", name: "Scottish Premiership",  fromYear: 1994 },
];

// DataHub EPL season codes (their naming convention: season-XXYY.csv)
const DATAHUB_EPL_SEASONS = [
  "9394","9495","9596","9697","9798","9899","9900",
  "0001","0102","0203","0304","0405","0506","0607",
  "0708","0809","0910","1011","1112","1213","1314",
  "1415","1516","1617","1718","1819","1920","2021",
  "2122","2223","2324","2425","2526",
];

const CURRENT_YEAR = 2025; // 2025/26 is the current season

// ── Helpers ───────────────────────────────────────────────────────────────────

function yearToSeasonCode(startYear: number): string {
  const yy1 = String(startYear).slice(2).padStart(2, "0");
  const yy2 = String(startYear + 1).slice(2).padStart(2, "0");
  return `${yy1}${yy2}`;
}

function allSeasonCodes(fromYear: number): string[] {
  const codes: string[] = [];
  for (let y = fromYear; y <= CURRENT_YEAR; y++) {
    codes.push(yearToSeasonCode(y));
  }
  return codes;
}

async function fetchWithRetry(url: string, retries = 3): Promise<{ body: Buffer; ok: boolean; status: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "PunterStat/1.0 data-seeder" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) return { body: Buffer.alloc(0), ok: false, status: res.status };
      const buf = Buffer.from(await res.arrayBuffer());
      return { body: buf, ok: true, status: res.status };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return { body: Buffer.alloc(0), ok: false, status: 0 };
}

async function uploadToR2(key: string, body: Buffer): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: "text/csv",
  }));
}

async function listR2Keys(prefix: string): Promise<Set<string>> {
  const keys = new Set<string>();
  let continuationToken: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.add(obj.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return keys;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const stats = {
  uploaded: 0,
  skipped: 0,
  missing: 0,
  errors: 0,
};

// ── DataHub EPL seeder ────────────────────────────────────────────────────────

async function seedDataHubEPL(existingKeys: Set<string>): Promise<void> {
  console.log("\n📦 DataHub EPL — 33 seasons");
  const BASE = "https://datahub.io/football/english-premier-league/_r/-";

  for (const code of DATAHUB_EPL_SEASONS) {
    const r2Key = `football/datahub/E0/${code}.csv`;
    if (existingKeys.has(r2Key)) {
      process.stdout.write(`  ⏭  ${code} (already in R2)\n`);
      stats.skipped++;
      continue;
    }

    const url = `${BASE}/season-${code}.csv`;
    try {
      const { body, ok, status } = await fetchWithRetry(url);
      if (!ok || body.length < 100) {
        console.log(`  ⚠️  ${code} — HTTP ${status} or empty`);
        stats.missing++;
        continue;
      }
      await uploadToR2(r2Key, body);
      const rows = body.toString("utf8").split("\n").length - 2;
      console.log(`  ✅ ${code} → ${r2Key} (${rows} rows, ${(body.length / 1024).toFixed(1)} KB)`);
      stats.uploaded++;
    } catch (err) {
      console.error(`  ❌ ${code} — ${(err as Error).message}`);
      stats.errors++;
    }
  }
}

// ── FDCO seeder (all 16 leagues with odds) ────────────────────────────────────

async function seedFDCO(existingKeys: Set<string>): Promise<void> {
  console.log("\n📦 FDCO — 16 leagues with bookmaker odds");
  const BASE = "https://www.football-data.co.uk/mmz4281";

  for (const league of LEAGUES) {
    const seasons = allSeasonCodes(league.fromYear);
    let leagueUploaded = 0;
    let leagueSkipped = 0;

    process.stdout.write(`\n  ${league.name} (${league.code}) — ${seasons.length} seasons: `);

    for (const seasonCode of seasons) {
      const r2Key = `football/${league.code}/${seasonCode}.csv`;
      if (existingKeys.has(r2Key)) {
        leagueSkipped++;
        stats.skipped++;
        continue;
      }

      const url = `${BASE}/${seasonCode}/${league.code}.csv`;
      try {
        const { body, ok, status } = await fetchWithRetry(url);
        if (!ok || body.length < 50) {
          // Season not yet available or league didn't exist that year — normal
          stats.missing++;
          continue;
        }
        await uploadToR2(r2Key, body);
        leagueUploaded++;
        stats.uploaded++;
        process.stdout.write(".");
      } catch (err) {
        process.stdout.write("x");
        stats.errors++;
      }

      // Polite delay — FDCO is a free public resource
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(` — uploaded ${leagueUploaded}, skipped ${leagueSkipped}`);
  }
}

// ── Manifest writer ───────────────────────────────────────────────────────────

async function writeManifest(): Promise<void> {
  const manifest = {
    generated_at: new Date().toISOString(),
    sources: {
      datahub_epl: {
        leagues: ["E0"],
        seasons: DATAHUB_EPL_SEASONS,
        r2_prefix: "football/datahub/E0/",
        description: "Clean EPL CSVs from DataHub (no odds — consistent schema all seasons)",
      },
      fdco: {
        leagues: LEAGUES.map(l => l.code),
        r2_prefix: "football/",
        description: "Full FDCO CSVs with bookmaker odds (up to 20 bookmakers per match)",
      },
    },
    stats,
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: "manifest.json",
    Body: Buffer.from(JSON.stringify(manifest, null, 2)),
    ContentType: "application/json",
  }));

  console.log("\n📄 manifest.json written to R2");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`🚀 PunterStat R2 Seeder`);
  console.log(`   Bucket : ${BUCKET}`);
  console.log(`   Account: ${ACCOUNT_ID.slice(0, 8)}...`);
  console.log(`   Time   : ${new Date().toISOString()}`);

  // Check what's already in R2 so we can skip existing files
  console.log("\n🔍 Scanning existing R2 objects...");
  const existingKeys = await listR2Keys("football/");
  console.log(`   Found ${existingKeys.size} existing objects`);

  await seedDataHubEPL(existingKeys);
  await seedFDCO(existingKeys);
  await writeManifest();

  console.log("\n─────────────────────────────────────");
  console.log(`✅ Uploaded : ${stats.uploaded}`);
  console.log(`⏭  Skipped  : ${stats.skipped}`);
  console.log(`⚠️  Missing  : ${stats.missing}`);
  console.log(`❌ Errors   : ${stats.errors}`);
  console.log("─────────────────────────────────────");
  console.log("Done.");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
