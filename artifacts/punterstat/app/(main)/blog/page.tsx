import type { Metadata } from "next";
import { Suspense } from "react";
import { PenLine } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { TagFilter } from "@/components/blog/tag-filter";
import { getPublishedPosts, getAllTags } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Analysis, education, and insight from the PunterStat team on football, tactics, markets, and sports intelligence.",
};

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const [posts, tags] = await Promise.all([
    getPublishedPosts(tag),
    getAllTags(),
  ]);

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
            Analysis, education & insight
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Tactical breakdowns, probability deep-dives, and sports intelligence articles
            from the PunterStat team.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={null}>
              <TagFilter tags={tags} />
            </Suspense>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <PenLine className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">
              {tag ? `No posts tagged "${tag}"` : "No posts published yet"}
            </h2>
            <p className="text-sm text-[#1e293b]/50">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured post */}
            {featured && !tag && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">
                  Latest
                </p>
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {(tag ? posts : rest).length > 0 && (
              <div>
                {!tag && rest.length > 0 && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">
                    More articles
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(tag ? posts : rest).map((post) => (
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
