"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, Zap } from "lucide-react";
import { createLesson, updateLesson } from "@/lib/admin/actions";
import type { AdminLesson } from "@/lib/admin/queries";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface LessonFormModalProps {
  courseId: string;
  lesson?: AdminLesson; // if set → edit mode
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

export function LessonFormModal({ courseId, lesson, onClose }: LessonFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [slug, setSlug] = useState(lesson?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!lesson);
  const [isPublished, setIsPublished] = useState(lesson?.isPublished ?? false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!lesson;

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // Ensure is_published is consistently set
    fd.set("is_published", isPublished ? "true" : "false");

    startTransition(async () => {
      const result = isEdit
        ? await updateLesson(lesson!.id, courseId, fd)
        : await createLesson(courseId, fd);

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
            <Zap className="h-4 w-4 text-violet-600" />
            <h2 className="text-base font-semibold text-[#0f172a]">
              {isEdit ? "Edit Lesson" : "New Lesson"}
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
        <form ref={formRef} onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto space-y-4 px-6 py-5">
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
                placeholder="Understanding Odds Formats"
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
                placeholder="understanding-odds-formats"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Duration (seconds)
              </label>
              <input
                name="duration_seconds"
                type="number"
                min={0}
                defaultValue={lesson?.durationSeconds ?? ""}
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="300"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Sort Order
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={lesson?.sortOrder ?? 0}
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Video URL
              </label>
              <input
                name="video_url"
                type="url"
                defaultValue={lesson?.videoUrl ?? ""}
                className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1e293b]/70">
                Content
              </label>
              <RichTextEditor
                name="content"
                defaultValue={lesson?.content ?? ""}
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded accent-violet-600"
                />
                <span className="font-medium text-[#1e293b]/80">Publish immediately</span>
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
              {isEdit ? "Save Changes" : "Add Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
