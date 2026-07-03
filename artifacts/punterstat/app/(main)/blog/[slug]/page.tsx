import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/post-card";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.thumbnailUrl
      ? { images: [{ url: post.thumbnailUrl }] }
      : undefined,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function ContentRenderer({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-5 text-[#1e293b]">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### ")) return (
          <h3 key={i} className="text-lg font-semibold text-[#0f172a] mt-8 mb-3 leading-snug">
            {trimmed.slice(4)}
          </h3>
        );
        if (trimmed.startsWith("## ")) return (
          <h2 key={i} className="text-xl font-bold text-[#0f172a] mt-10 mb-4 leading-snug">
            {trimmed.slice(3)}
          </h2>
        );
        if (trimmed.startsWith("# ")) return (
          <h1 key={i} className="text-2xl font-bold text-[#0f172a] mt-10 mb-4 leading-snug">
            {trimmed.slice(2)}
          </h1>
        );
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("* "));
          return (
            <ul key={i} className="list-disc list-inside space-y-2 text-sm leading-relaxed text-[#1e293b]/80 pl-2">
              {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
            </ul>
          );
        }
        if (/^\d+\. /.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => /^\d+\. /.test(l));
          return (
            <ol key={i} className="list-decimal list-inside space-y-2 text-sm leading-relaxed text-[#1e293b]/80 pl-2">
              {items.map((item, j) => <li key={j}>{item.replace(/^\d+\. /, "")}</li>)}
            </ol>
          );
        }
        if (trimmed.startsWith("> ")) return (
          <blockquote key={i} className="border-l-4 border-[#3D2DFF]/30 pl-4 italic text-sm text-[#1e293b]/70 leading-relaxed">
            {trimmed.slice(2)}
          </blockquote>
        );
        return (
          <p key={i} className="text-[15px] text-[#1e293b]/80 leading-[1.8]">{trimmed}</p>
        );
      })}
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.tags);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero / Header */}
      <section className="bg-[#0f172a] px-4 pb-0 pt-10">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to blog
          </Link>

          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${tag}`}>
                  <Badge
                    variant="outline"
                    className="border-white/20 text-white/60 text-xs capitalize hover:border-white/40 hover:text-white transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold text-white leading-tight sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-base text-white/60 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="mt-6 flex items-center gap-1.5 pb-8 text-xs text-white/30">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt ?? post.createdAt)}
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      {post.thumbnailUrl && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <article className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <ContentRenderer content={post.content} />
        </article>

        {/* Tags footer */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#1e293b]/40">Tagged:</span>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${tag}`}>
                <Badge
                  variant="outline"
                  className="text-xs capitalize hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF] transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-lg font-semibold text-[#0f172a]">Related articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/blog" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              All articles
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
