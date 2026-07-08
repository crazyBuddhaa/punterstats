/**
 * Server-only Cloudinary signing module.
 * Uses Node.js crypto — must NOT be imported in client components.
 */
import crypto from "crypto";
import type { UploadFolder, UploadSignature } from "./types";

export function generateUploadSignature(folder: UploadFolder): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  // Parameters must be sorted alphabetically for Cloudinary signature
  const paramsStr = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsStr + (process.env.CLOUDINARY_API_SECRET ?? ""))
    .digest("hex");

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    folder,
  };
}
