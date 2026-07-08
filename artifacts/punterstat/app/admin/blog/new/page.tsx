import { requireAdmin } from "@/lib/auth/helpers";
import { BlogForm } from "@/components/admin/blog-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewBlogPostPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="mb-3 flex items-center gap-1.5 text-sm text-[#1e293b]/60 hover:text-[#0f172a]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blog Posts
        </Link>
        <h1 className="text-2xl font-bold text-[#0f172a]">New Blog Post</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">Write in Markdown. Save as draft or publish immediately.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <BlogForm />
      </div>
    </div>
  );
}
