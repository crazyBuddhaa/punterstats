import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/post-card";
import { ShareArticleButtons } from "@/components/blog/share-button";
import { getUserProfile } from "@/lib/auth/helpers";
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from "@/lib/blog/queries";
import { sanitizeContentHtml } from "@/lib/sanitize-html";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

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

function estimateReadingMinutes(content: string): number {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}

function ContentRenderer({ content }: { content: string }) {
  const trimmedContent = content.trim();
  if (trimmedContent.startsWith("<") || /<\/(p|h[1-6]|ul|ol|li|table|blockquote|div|strong|em)>/i.test(trimmedContent)) {
    const safeHtml = sanitizeContentHtml(trimmedContent);
    return (
      <div
        className="prose max-w-none space-y-5 text-[#1e293b]"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

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
  const [profile, post] = await Promise.all([
    getUserProfile(),
    getPostBySlug(slug),
  ]);
  if (!post) notFound();

  const isLoggedIn = Boolean(profile);
  const related = await getRelatedPosts(post.id, post.tags);
  const readMins = estimateReadingMinutes(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.thumbnailUrl ?? undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
    author: {
      "@type": "Organization",
      name: post.authorName ?? "PunterStat",
    },
    publisher: {
      "@type": "Organization",
      name: "PunterStat",
    },
  };

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Light editorial header for signed-out visitors */}
      {!isLoggedIn && (
        <section className="border-b border-slate-200/80 bg-white px-4 pb-0 pt-10">
          <div className="container mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
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
                      className="border-slate-200 bg-slate-50 text-xs capitalize text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-base leading-relaxed text-slate-600">{post.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pb-8 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readMins} min read
                </span>
                {post.authorName && <span>by {post.authorName}</span>}
              </div>
              <ShareArticleButtons title={post.title} />
            </div>
          </div>
        </section>
      )}

      {/* Thumbnail */}
      {post.thumbnailUrl && !isLoggedIn && (
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
      <section className={isLoggedIn ? "space-y-6 py-2" : "container mx-auto max-w-3xl px-4 py-12"}>
        {isLoggedIn && (
          <div className="space-y-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#3D2DFF] hover:underline"
            >
              <ChevronLeft className="h-3 w-3" />
              Back to blog
            </Link>
            <h1 className="text-2xl font-bold text-[#0f172a] leading-tight sm:text-3xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#1e293b]/55">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readMins} min read
                </span>
                {post.authorName && <span>by {post.authorName}</span>}
              </div>
              <ShareArticleButtons title={post.title} light />
            </div>
            {post.thumbnailUrl && (
              <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        )}

        <article className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <ContentRenderer content={post.content} />
        </article>

        {/* Contextual Tool CTA */}
        <div className="mt-8 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50/50 p-6">
          <h2 className="text-base font-bold text-[#0f172a]">Put this into practice</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#1e293b]/65">
            Test your next ticket&apos;s true odds and margin, or track your real ROI and closing-line value in Naira.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="teal" size="sm" asChild>
              <Link href="/bet-assist/slip-checker">Check a Bet Slip</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/bet-assist/calculators">Open Calculators</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/betting-academy">Betting Academy</Link>
            </Button>
          </div>
        </div>

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
