"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { createBlogPost, updateBlogPost } from "@/lib/admin/actions";
import type { AdminBlogPost } from "@/lib/admin/queries";

interface BlogFormProps {
  post?: AdminBlogPost;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export function BlogForm({ post }: BlogFormProps) {
  const isEdit = Boolean(post);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnailUrl ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit || !post?.slug) setSlug(slugify(val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("thumbnail_url", thumbnailUrl);
    formData.set("tags", tags);
    formData.set("is_published", String(isPublished));

    startTransition(async () => {
      if (isEdit && post) {
        const result = await updateBlogPost(post.id, formData);
        if (!result.success) { setError(result.error); return; }
        setSuccess(true);
      } else {
        const result = await createBlogPost(formData);
        if (!result.success) { setError(result.error); return; }
        router.push("/admin/blog");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Post saved successfully.
        </div>
      )}

      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">Title *</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            maxLength={200}
            placeholder="Post title…"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            maxLength={100}
            placeholder="post-url-slug"
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">
          Excerpt <span className="font-normal text-[#1e293b]/50">(optional)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Short summary shown on listing pages…"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
        <p className="mt-1 text-right text-[11px] text-[#1e293b]/40">{excerpt.length}/500</p>
      </div>

      {/* Content */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">Content * (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          required
          placeholder="Write your post in Markdown…"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        />
      </div>

      {/* Thumbnail + Tags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">
            Thumbnail URL <span className="font-normal text-[#1e293b]/50">(optional)</span>
          </label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0f172a]">
            Tags <span className="font-normal text-[#1e293b]/50">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="probability, odds, strategy"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Publish toggle + submit */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-5 py-4">
        <button
          type="button"
          onClick={() => setIsPublished((p) => !p)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isPublished ? "text-emerald-700" : "text-[#1e293b]/60"
          }`}
        >
          {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isPublished ? "Publish on save" : "Save as draft"}
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Post"}
        </button>
      </div>
    </form>
  );
}
