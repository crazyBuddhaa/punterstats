/**
 * Cloudflare R2 — S3-compatible client factory.
 *
 * R2 uses the AWS S3 API, so we use @aws-sdk/client-s3 pointed at
 * https://<accountId>.r2.cloudflarestorage.com
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID          — found on the Cloudflare dashboard home page
 *   CLOUDFLARE_R2_ACCESS_KEY_ID    — R2 API token "Access Key ID"
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY— R2 API token "Secret Access Key"
 *   CLOUDFLARE_R2_BUCKET_NAME      — e.g. "punterstat-data"
 *
 * Never cache the client object — tokens can be rotated.
 * Call getR2Client() fresh on every request.
 */

import { S3Client } from "@aws-sdk/client-s3";

export function getR2Client(): S3Client {
  const accountId       = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId     = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is not configured. " +
      "Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, " +
      "and CLOUDFLARE_R2_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getR2Bucket(): string {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not set.");
  return bucket;
}

/** Returns true only if all four R2 env vars are present. */
export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  );
}
