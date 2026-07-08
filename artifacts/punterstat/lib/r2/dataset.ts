/**
 * Cloudflare R2 — low-level dataset operations.
 *
 * All paths follow this structure inside the bucket:
 *
 *   manifest.json                        ← top-level index, always up to date
 *   football/{leagueCode}/{seasonCode}.csv   ← raw CSV archives
 *   sync-log/{ISO-timestamp}.json        ← per-run logs
 *
 * Example:
 *   football/E0/2425.csv   ← Premier League 2024/25
 *   football/SP1/0001.csv  ← La Liga 2000/01
 */

import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getR2Client, getR2Bucket } from "./client";
import type { R2Manifest } from "./types";

// ── Key helpers ───────────────────────────────────────────────────────────────

export const MANIFEST_KEY = "manifest.json";

export function footballCsvKey(leagueCode: string, seasonCode: string): string {
  return `football/${leagueCode}/${seasonCode}.csv`;
}

export function syncLogKey(isoTimestamp: string): string {
  // Replace colons so the key is safe on all filesystems
  return `sync-log/${isoTimestamp.replace(/:/g, "-")}.json`;
}

// ── Core R2 operations ────────────────────────────────────────────────────────

/**
 * Upload any text or JSON payload to R2.
 * Returns the ETag on success.
 */
export async function putObject(
  key: string,
  body: string,
  contentType = "application/octet-stream"
): Promise<string> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: Buffer.byteLength(body, "utf8"),
  });

  const res = await client.send(cmd);
  return res.ETag ?? "";
}

/**
 * Download an object from R2 and return its content as a string.
 * Returns null if the key does not exist (404).
 */
export async function getObject(key: string): Promise<string | null> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const res = await client.send(cmd);

    if (!res.Body) return null;

    // Collect stream chunks
    const chunks: Uint8Array[] = [];
    for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (err: unknown) {
    const code = (err as { name?: string; Code?: string }).name
      ?? (err as { Code?: string }).Code;
    if (code === "NoSuchKey" || code === "NotFound") return null;
    throw err;
  }
}

/**
 * Check whether a key exists in R2 without downloading the body.
 */
export async function objectExists(key: string): Promise<boolean> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * List all object keys under a given prefix (recursive).
 */
export async function listObjects(prefix: string): Promise<string[]> {
  const client = getR2Client();
  const bucket = getR2Bucket();
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const res = await client.send(cmd);

    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

/**
 * Delete an object from R2. No-ops if the key does not exist.
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2Bucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// ── Manifest helpers ──────────────────────────────────────────────────────────

const EMPTY_MANIFEST: R2Manifest = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  leagues: {},
};

/**
 * Read and parse manifest.json from R2.
 * Returns an empty manifest if the file does not exist yet.
 */
export async function getManifest(): Promise<R2Manifest> {
  const raw = await getObject(MANIFEST_KEY);
  if (!raw) return { ...EMPTY_MANIFEST };
  try {
    return JSON.parse(raw) as R2Manifest;
  } catch {
    return { ...EMPTY_MANIFEST };
  }
}

/**
 * Read manifest.json and return both the parsed content and the current ETag.
 * The ETag is used for optimistic locking via putManifestConditional().
 * Returns etag=null when the manifest doesn't exist yet.
 */
export async function getManifestWithETag(): Promise<{
  manifest: R2Manifest;
  etag: string | null;
}> {
  const client = getR2Client();
  const bucket = getR2Bucket();

  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: MANIFEST_KEY });
    const res = await client.send(cmd);

    if (!res.Body) return { manifest: { ...EMPTY_MANIFEST }, etag: null };

    const chunks: Uint8Array[] = [];
    for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const text = Buffer.concat(chunks).toString("utf8");

    try {
      return {
        manifest: JSON.parse(text) as R2Manifest,
        etag: res.ETag ?? null,
      };
    } catch {
      return { manifest: { ...EMPTY_MANIFEST }, etag: null };
    }
  } catch (err: unknown) {
    const code =
      (err as { name?: string }).name ?? (err as { Code?: string }).Code;
    if (code === "NoSuchKey" || code === "NotFound") {
      return { manifest: { ...EMPTY_MANIFEST }, etag: null };
    }
    throw err;
  }
}

/**
 * Write (overwrite) manifest.json in R2.
 */
export async function putManifest(manifest: R2Manifest): Promise<void> {
  await putObject(MANIFEST_KEY, JSON.stringify(manifest, null, 2), "application/json");
}

/**
 * Conditionally write manifest.json only when the stored ETag matches
 * the one we read (optimistic locking — prevents concurrent sync corruption).
 *
 * Returns true  → write succeeded.
 * Returns false → ETag mismatch (another writer raced us); caller should retry.
 * Throws        → unexpected storage error.
 *
 * When etag is null (manifest didn't exist at read time) the If-Match header
 * is omitted and the write proceeds unconditionally — first-write semantics.
 */
export async function putManifestConditional(
  manifest: R2Manifest,
  etag: string | null,
): Promise<boolean> {
  const client = getR2Client();
  const bucket = getR2Bucket();
  const body = JSON.stringify(manifest, null, 2);

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: MANIFEST_KEY,
    Body: body,
    ContentType: "application/json",
    ContentLength: Buffer.byteLength(body, "utf8"),
  });

  // Inject a conditional write header so Cloudflare R2 rejects the write (412)
  // when another process touched the manifest between our read and this write.
  //
  // • etag present → If-Match: "<etag>"  — only overwrite this exact version.
  // • etag null    → If-None-Match: *    — only write if the key doesn't exist yet
  //                  (first-write semantics; prevents two concurrent bootstraps
  //                   from both "winning" a race on an empty bucket).
  cmd.middlewareStack.add(
    (next) => async (args) => {
      const req = args.request as { headers: Record<string, string> };
      if (etag) {
        req.headers["If-Match"] = etag;
      } else {
        req.headers["If-None-Match"] = "*";
      }
      return next(args);
    },
    { step: "build", name: "addConditionalWriteHeader" },
  );

  try {
    await client.send(cmd);
    return true;
  } catch (err: unknown) {
    const name = (err as { name?: string }).name;
    const status = (
      err as { $metadata?: { httpStatusCode?: number } }
    ).$metadata?.httpStatusCode;

    // 412 = concurrent modification; signal caller to re-read and retry.
    if (name === "PreconditionFailed" || status === 412) return false;
    throw err;
  }
}

// ── Football CSV helpers ──────────────────────────────────────────────────────

/**
 * Archive a raw CSV string for a league/season.
 * Returns the R2 object key.
 */
export async function putFootballCsv(
  leagueCode: string,
  seasonCode: string,
  csv: string
): Promise<string> {
  const key = footballCsvKey(leagueCode, seasonCode);
  await putObject(key, csv, "text/csv");
  return key;
}

/**
 * Retrieve an archived CSV for a league/season.
 * Returns null if not yet archived.
 */
export async function getFootballCsv(
  leagueCode: string,
  seasonCode: string
): Promise<string | null> {
  return getObject(footballCsvKey(leagueCode, seasonCode));
}

/**
 * List all season codes archived for a given league.
 * Returns codes in ascending order, e.g. ["9394", "9495", ..., "2425"].
 */
export async function listArchivedSeasons(leagueCode: string): Promise<string[]> {
  const prefix = `football/${leagueCode}/`;
  const keys = await listObjects(prefix);
  return keys
    .filter((k) => k.endsWith(".csv"))
    .map((k) => k.replace(prefix, "").replace(".csv", ""))
    .sort();
}
