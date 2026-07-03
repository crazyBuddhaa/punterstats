import { requireAdmin } from "@/lib/auth/helpers";
import { getBlogPostById } from "@/lib/admin/queries";
import { BlogForm } from "@/components/admin/blog-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

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
        <h1 className="text-2xl font-bold text-[#0f172a]">Edit Post</h1>
        <p className="mt-1 font-mono text-sm text-[#1e293b]/50">/{post.slug}</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <BlogForm post={post} />
      </div>
    </div>
  );
}
