/**
 * Kaggle API — authenticated dataset file download.
 *
 * Uses Kaggle's v1 REST API with HTTP Basic Auth.
 * Each file download returns a ZIP archive containing the requested file;
 * this module unzips it in memory and returns the raw CSV string.
 *
 * Required env vars:
 *   KAGGLE_USERNAME  — your Kaggle account username
 *   KAGGLE_KEY       — API key from kaggle.com → Settings → API → Create New Token
 */

import { unzipSync } from "fflate";

const KAGGLE_API = "https://www.kaggle.com/api/v1";

function kaggleBasicAuth(): string {
  const username = process.env.KAGGLE_USERNAME;
  const key      = process.env.KAGGLE_KEY;
  if (!username || !key) {
    throw new Error(
      "Kaggle credentials not configured. " +
      "Set KAGGLE_USERNAME and KAGGLE_KEY environment variables."
    );
  }
  return "Basic " + Buffer.from(`${username}:${key}`).toString("base64");
}

export function isKaggleConfigured(): boolean {
  return !!(process.env.KAGGLE_USERNAME && process.env.KAGGLE_KEY);
}

/**
 * Download one file from a Kaggle dataset.
 *
 * Kaggle returns a ZIP archive even for single-file requests.
 * This function unzips in memory and returns the file as a UTF-8 string.
 *
 * @param owner    Dataset owner slug, e.g. "martj42"
 * @param dataset  Dataset slug, e.g. "international-football-results-from-1872-to-2017"
 * @param filename Target file within the dataset, e.g. "results.csv"
 */
export async function downloadKaggleFile(
  owner: string,
  dataset: string,
  filename: string
): Promise<string> {
  const url = `${KAGGLE_API}/datasets/download/${owner}/${dataset}/${filename}`;

  const res = await fetch(url, {
    headers: {
      Authorization: kaggleBasicAuth(),
      "User-Agent": "PunterStat-DataSync/1.0",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("Kaggle authentication failed. Check KAGGLE_USERNAME and KAGGLE_KEY.");
  }
  if (res.status === 403) {
    throw new Error(
      "Kaggle access denied. You may need to accept the dataset terms on kaggle.com first."
    );
  }
  if (res.status === 404) {
    throw new Error(`Kaggle file not found: ${owner}/${dataset}/${filename}`);
  }
  if (!res.ok) {
    throw new Error(`Kaggle API error ${res.status}: ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer      = new Uint8Array(arrayBuffer);

  // Unzip — Kaggle wraps the file in a ZIP; fall back to raw text if not zipped
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(buffer);
  } catch {
    return Buffer.from(arrayBuffer).toString("utf8");
  }

  const entries = Object.entries(unzipped);
  if (entries.length === 0) {
    throw new Error(`Kaggle ZIP response was empty for ${filename}`);
  }

  // Find the target file — ZIP may include a folder prefix
  const match =
    entries.find(([name]) => name === filename || name.endsWith(`/${filename}`)) ??
    entries[0];

  return Buffer.from(match[1]).toString("utf8");
}

/**
 * Download all three files of the international football results dataset.
 *
 * Throws if the primary file (results.csv) fails — it is the minimum required
 * for a useful ingest. Logs warnings for goalscorers/shootouts failures and
 * returns empty strings for those files so partial ingests can proceed.
 *
 * Previously used Promise.allSettled and silently returned "" for any failure,
 * which caused garbage or empty rows to be ingested with no indication of the
 * underlying error.
 */
export async function downloadInternationalDataset(): Promise<{
  results: string;
  goalscorers: string;
  shootouts: string;
}> {
  const owner   = "martj42";
  const dataset = "international-football-results-from-1872-to-2017";

  const [results, goalscorers, shootouts] = await Promise.allSettled([
    downloadKaggleFile(owner, dataset, "results.csv"),
    downloadKaggleFile(owner, dataset, "goalscorers.csv"),
    downloadKaggleFile(owner, dataset, "shootouts.csv"),
  ]);

  // results.csv is mandatory — throw so callers know the download failed
  // rather than ingesting an empty dataset and silently wiping match records.
  if (results.status === "rejected") {
    throw new Error(
      `[kaggle] results.csv download failed — aborting international ingest: ${
        results.reason instanceof Error ? results.reason.message : String(results.reason)
      }`
    );
  }

  // Secondary files are optional — warn but allow partial ingest.
  if (goalscorers.status === "rejected") {
    console.warn(
      "[kaggle] goalscorers.csv download failed — goalscorer rows will be skipped:",
      goalscorers.reason instanceof Error ? goalscorers.reason.message : goalscorers.reason
    );
  }
  if (shootouts.status === "rejected") {
    console.warn(
      "[kaggle] shootouts.csv download failed — shootout rows will be skipped:",
      shootouts.reason instanceof Error ? shootouts.reason.message : shootouts.reason
    );
  }

  return {
    results:     results.value,
    goalscorers: goalscorers.status === "fulfilled" ? goalscorers.value : "",
    shootouts:   shootouts.status   === "fulfilled" ? shootouts.value   : "",
  };
}
