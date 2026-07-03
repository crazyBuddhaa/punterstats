"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Upload, Camera } from "lucide-react";
import { uploadToCloudinary, type UploadSignature } from "@/lib/cloudinary/upload";
import { updateAvatar } from "@/lib/dashboard/actions";

interface AvatarUploadProps {
  currentUrl?: string | null;
  displayName: string;
}

export function AvatarUpload({ currentUrl, displayName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initials = (displayName || "U").slice(0, 1).toUpperCase();

  async function handleFile(file: File, objectUrl: string) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      URL.revokeObjectURL(objectUrl);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      URL.revokeObjectURL(objectUrl);
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        // Get signed upload params from our API
        const res = await fetch("/api/upload?folder=avatars");
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "Failed to get upload signature");
        }
        const sig = await res.json() as UploadSignature;

        // Upload directly to Cloudinary
        const secureUrl = await uploadToCloudinary(file, sig);

        // Swap optimistic blob URL for the real Cloudinary URL
        URL.revokeObjectURL(objectUrl);
        setPreview(secureUrl);

        // Persist to Supabase
        const result = await updateAvatar(secureUrl);
        if (!result.success) {
          setError(result.error);
          setPreview(currentUrl ?? null);
        }
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        setPreview(currentUrl ?? null);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative">
        {/* Avatar display */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#3D2DFF] text-2xl font-bold text-white ring-2 ring-white ring-offset-2 transition hover:ring-[#3D2DFF] disabled:opacity-70"
          title="Change avatar"
        >
          {preview ? (
            <Image
              src={preview}
              alt={displayName}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={preview.startsWith("blob:")}
            />
          ) : (
            <span>{initials}</span>
          )}
          {/* Hover overlay */}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </span>
        </button>

        {/* Uploading spinner badge */}
        {isPending && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3D2DFF]">
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          </span>
        )}
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-medium text-[#3D2DFF] hover:underline disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {isPending ? "Uploading…" : "Change photo"}
        </button>
        <p className="text-[11px] text-[#1e293b]/40">JPG, PNG or WebP · max 5 MB</p>
        {error && <p className="text-[11px] text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Show instant local preview before the upload starts
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            handleFile(file, objectUrl);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
