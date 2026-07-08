/**
 * Client-safe Cloudinary upload helper — no Node.js imports.
 * Safe to import in both server components and client components.
 */
export type { UploadFolder, UploadSignature } from "./types";

/**
 * Upload a file directly to Cloudinary using a pre-generated signed signature.
 * File bytes go browser → Cloudinary directly; nothing passes through our server.
 * Returns the secure_url of the uploaded asset.
 */
export async function uploadToCloudinary(
  file: File,
  sig: import("./types").UploadSignature
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? "Upload failed");
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}
