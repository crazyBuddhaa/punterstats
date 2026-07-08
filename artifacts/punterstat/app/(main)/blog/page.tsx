import type { Metadata } from "next";
import { Suspense } from "react";
import { PenLine } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { BlogSearch } from "@/components/blog/blog-search";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedPosts, getAllTags } from "@/lib/blog/queries";

// ISR: revalidate the blog index every 30 minutes so new posts surface quickly.
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Blog",
  description: "Analysis, education, and insight from the PunterStat team on football, tactics, markets, and sports intelligence.",
};

interface Props {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { tag, q } = await searchParams;
  const [posts, tags] = await Promise.all([
    getPublishedPosts(tag, q),
    getAllTags(),
  ]);

  const hasFilter = !!(tag || q);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <PenLine className="h-3.5 w-3.5" />
            PunterStat Blog
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Analysis, education &amp; insight
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Tactical breakdowns, probability deep-dives, and sports intelligence articles
            from the PunterStat team.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        {/* Search + tag filter */}
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-56 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
              </div>
            }
          >
            <BlogSearch tags={tags} />
          </Suspense>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <PenLine className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">
              {q
                ? `No results for "${q}"`
                : tag
                ? `No posts tagged "${tag}"`
                : "No posts published yet"}
            </h2>
            <p className="text-sm text-[#1e293b]/50">
              {q || tag ? "Try a different search or browse all articles." : "Check back soon."}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured post — only when no filters active */}
            {featured && !hasFilter && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">
                  Latest
                </p>
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {(hasFilter ? posts : rest).length > 0 && (
              <div>
                {!hasFilter && rest.length > 0 && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">
                    More articles
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(hasFilter ? posts : rest).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
