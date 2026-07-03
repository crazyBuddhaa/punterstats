"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, BookOpen } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/admin/actions";
import type { AdminCategory, AdminCourse } from "@/lib/admin/queries";

interface CourseFormModalProps {
  categories: AdminCategory[];
  course?: AdminCourse; // if set → edit mode
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
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!course);
  const [isPremium, setIsPremium] = useState(course?.isPremium ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!course;

  // Auto-derive slug from title until user manually edits it
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
            onClick={onClose}
            className="rounded-lg p-1 text-[#1e293b]/40 hover:bg-slate-100 hover:text-[#0f172a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="Introduction to Betting Markets"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                required
                pattern="[a-z0-9-]+"
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 font-mono text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="intro-to-betting-markets"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={course?.description ?? ""}
                rows={3}
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                placeholder="A short overview of what students will learn…"
              />
            </div>

            {/* Thumbnail */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Thumbnail URL
              </label>
              <input
                name="thumbnail_url"
                type="url"
                value={thumbnailUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThumbnailUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="https://example.com/image.jpg"
              />
              {/* Live preview */}
              <div className={`mt-2 h-32 w-full overflow-hidden rounded-xl border border-border ${thumbnailUrl ? "bg-slate-100" : "bg-slate-50"}`}>
                {thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[#1e293b]/20" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#1e293b]/40">
                Paste a direct image URL. Cloudinary URLs work great.
              </p>
            </div>

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
              </select>
            </div>

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

            <div className="flex items-center gap-3 self-end pb-1">
              {/* Controlled checkbox — value sent via hidden input */}
              <input type="hidden" name="is_premium" value={isPremium ? "true" : "false"} />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPremium(e.target.checked)}
                  className="h-4 w-4 rounded accent-violet-600"
                />
                <span className="font-medium text-[#1e293b]/80">Premium only</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-[#1e293b]/70 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
