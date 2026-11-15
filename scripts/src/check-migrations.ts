/**
 * Verifies Supabase migration files in artifacts/punterstat/supabase/migrations:
 *   1. Every .sql file must start with a numeric prefix (e.g. 001_name.sql).
 *   2. No two files may share the same numeric prefix.
 *   3. Numbers must be contiguous from 1..N with no gaps beyond KNOWN_GAPS.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(
  __dirname,
  "../../artifacts/punterstat/supabase/migrations",
);

/**
 * Historical gaps that already existed prior to this check.
 * Currently migrations 001..055 are contiguous with zero gaps.
 */
const KNOWN_GAPS = new Set<number>([]);

function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Error: Migrations directory not found at ${migrationsDir}`);
    process.exit(1);
  }

  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (sqlFiles.length === 0) {
    console.error("Error: No .sql migration files found.");
    process.exit(1);
  }

  const byNumber = new Map<number, string[]>();
  const invalidFiles: string[] = [];

  for (const file of sqlFiles) {
    const match = /^(\d+)_.+\.sql$/.exec(file);
    if (!match) {
      invalidFiles.push(file);
      continue;
    }
    const num = Number.parseInt(match[1], 10);
    const list = byNumber.get(num) ?? [];
    list.push(file);
    byNumber.set(num, list);
  }

  let hasErrors = false;

  if (invalidFiles.length > 0) {
    hasErrors = true;
    console.error(
      "Error: Migration files without a valid '<number>_<name>.sql' prefix:",
    );
    for (const f of invalidFiles) {
      console.error(`  - ${f}`);
    }
  }

  const duplicates = [...byNumber.entries()].filter(
    ([, files]) => files.length > 1,
  );
  if (duplicates.length > 0) {
    hasErrors = true;
    console.error("Error: Duplicate numeric migration prefixes detected:");
    for (const [num, files] of duplicates) {
      console.error(
        `  - Prefix ${String(num).padStart(3, "0")}: ${files.join(", ")}`,
      );
    }
  }

  const sortedNumbers = [...byNumber.keys()].sort((a, b) => a - b);
  const minNum = sortedNumbers[0] ?? 1;
  const maxNum = sortedNumbers[sortedNumbers.length - 1] ?? 0;

  if (minNum !== 1) {
    hasErrors = true;
    console.error(
      `Error: Expected migrations to start at 001, but lowest is ${String(minNum).padStart(3, "0")}.`,
    );
  }

  const unexpectedGaps: number[] = [];
  for (let n = 1; n <= maxNum; n++) {
    if (!byNumber.has(n) && !KNOWN_GAPS.has(n)) {
      unexpectedGaps.push(n);
    }
  }

  if (unexpectedGaps.length > 0) {
    hasErrors = true;
    console.error(
      `Error: Unexpected gap(s) in migration numbering: ${unexpectedGaps
        .map((n) => String(n).padStart(3, "0"))
        .join(", ")}`,
    );
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(
    `✓ Verified ${sqlFiles.length} migrations (001..${String(maxNum).padStart(3, "0")}): all prefixes unique and contiguous.`,
  );
}

main();
