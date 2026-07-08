import { requireAdmin } from "@/lib/auth/helpers";
import { getAllBlogPosts } from "@/lib/admin/queries";
import { toggleBlogPostPublished, deleteBlogPost } from "@/lib/admin/actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { BlogDeleteButton } from "@/components/admin/blog-delete-button";
import { FileText, Plus, Pencil } from "lucide-react";
import Link from "next/link";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Blog Posts</h1>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            {posts.length} post{posts.length !== 1 ? "s" : ""} —{" "}
            {posts.filter((p) => p.isPublished).length} published
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-8 w-8 text-[#1e293b]/20" />
            <p className="font-semibold text-[#0f172a]">No blog posts yet</p>
            <Link
              href="/admin/blog/new"
              className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#0f172a]">{post.title}</p>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-1 text-sm text-[#1e293b]/60">{post.excerpt}</p>
                  )}
                  <p className="mt-1 font-mono text-[11px] text-[#1e293b]/40">/{post.slug}</p>
                  <p className="mt-0.5 text-[11px] text-[#1e293b]/40">
                    {post.publishedAt
                      ? `Published ${new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : `Created ${new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PublishToggle
                    id={post.id}
                    isPublished={post.isPublished}
                    action={toggleBlogPostPublished}
                  />
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-[#1e293b]/50 transition hover:bg-slate-100 hover:text-[#0f172a]"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <BlogDeleteButton id={post.id} title={post.title} action={deleteBlogPost} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
