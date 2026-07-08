"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, BookOpen, ImagePlus, Trash2 } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/admin/actions";
import { uploadToCloudinary, type UploadSignature } from "@/lib/cloudinary/upload";
import type { AdminCategory, AdminCourse } from "@/lib/admin/queries";

interface CourseFormModalProps {
  categories: AdminCategory[];
  course?: AdminCourse;
  onClose: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CourseFormModal({ categories, course, onClose }: CourseFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!course);
  const [isPremium, setIsPremium] = useState(course?.isPremium ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!course;

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image must be smaller than 8 MB.");
      return;
    }
    setUploadError(null);

    // Show instant local preview
    const blobUrl = URL.createObjectURL(file);
    setThumbnailUrl(blobUrl);
    setIsUploading(true);

    try {
      const res = await fetch("/api/upload?folder=thumbnails");
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Could not get upload signature");
      }
      const sig = await res.json() as UploadSignature;
      const secureUrl = await uploadToCloudinary(file, sig);

      URL.revokeObjectURL(blobUrl);
      setThumbnailUrl(secureUrl);
    } catch (err) {
      URL.revokeObjectURL(blobUrl);
      setThumbnailUrl(course?.thumbnailUrl ?? "");
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return; // wait for upload to finish
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateCourse(course!.id, fd)
        : await createCourse(fd);

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-600" />
            <h2 className="text-base font-semibold text-[#0f172a]">
              {isEdit ? "Edit Course" : "New Course"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#1e293b]/40 hover:bg-slate-100 hover:text-[#0f172a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-4 px-6 py-5">
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            {/* ── Thumbnail upload ── */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1e293b]/70">
                Thumbnail
              </label>

              {/* Hidden input carries the final URL to the server action */}
              <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

              {/* Clickable preview / drop zone */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
                className={`group relative h-40 w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                  isUploading
                    ? "cursor-wait border-violet-300 bg-violet-50"
                    : "cursor-pointer border-border bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40"
                }`}
              >
                {thumbnailUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl}
                      alt="Course thumbnail"
                      className="h-full w-full object-cover"
                    />
                    {/* Overlay on hover */}
                    {!isUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <ImagePlus className="h-6 w-6 text-white" />
                        <span className="text-xs font-semibold text-white">Replace image</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#1e293b]/30">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-medium">Click to upload image</span>
                  </div>
                )}

                {/* Upload spinner overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    <span className="text-xs font-semibold text-violet-700">Uploading…</span>
                  </div>
                )}
              </div>

              {/* Below-preview row: hint + clear button */}
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[11px] text-[#1e293b]/40">
                  JPG, PNG, WebP · max 8 MB · recommended <span className="font-medium text-[#1e293b]/60">1280 × 720 px</span> (16:9)
                </p>
                {thumbnailUrl && !isUploading && (
                  <button
                    type="button"
                    onClick={() => { setThumbnailUrl(""); setUploadError(null); }}
                    className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>
              {uploadError && (
                <p className="mt-1 text-xs font-medium text-red-600">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* ── Title ── */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="Introduction to Betting Markets"
              />
            </div>

            {/* ── Slug ── */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                value={slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                required
                pattern="[a-z0-9-]+"
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 font-mono text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="intro-to-betting-markets"
              />
            </div>

            {/* ── Description ── */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={course?.description ?? ""}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="A short overview of what students will learn…"
              />
            </div>

            {/* ── Module + Level ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">Module</label>
                <select
                  name="category_id"
                  defaultValue={course?.categoryId ?? ""}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                  <option value="">— Uncategorised —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">Level</label>
                <select
                  name="level"
                  defaultValue={course?.level ?? "beginner"}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* ── Sort order + Premium ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                  Sort Order
                </label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={course?.sortOrder ?? 0}
                  className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              <div className="flex items-end pb-1">
                <input type="hidden" name="is_premium" value={isPremium ? "true" : "false"} />
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setIsPremium(e.target.checked)
                    }
                    className="h-4 w-4 rounded accent-violet-600"
                  />
                  <span className="font-medium text-[#1e293b]/80">Premium only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-[#1e293b]/70 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {(isPending || isUploading) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Uploading…" : isEdit ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
