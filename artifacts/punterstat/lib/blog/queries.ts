import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost } from "@/types";

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    authorName: (row.author_name as string | null) ?? null,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string | null,
    content: row.content as string,
    thumbnailUrl: row.thumbnail_url as string | null,
    tags: (row.tags as string[]) ?? [],
    isPublished: row.is_published as boolean,
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getPublishedPosts(tag?: string, search?: string): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (tag) query = query.contains("tags", [tag]);

  // Full-text search across title, excerpt, and content via the `fts`
  // generated tsvector column (added in migration 007). Uses websearch
  // mode so users can type naturally without learning tsquery syntax.
  if (search?.trim()) {
    query = query.textSearch("fts", search.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  const { data } = await query;
  return (data ?? []).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ? mapPost(data) : null;
}

export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("tags")
    .eq("is_published", true);

  const tagSet = new Set<string>();
  (data ?? []).forEach((row) => {
    ((row.tags as string[]) ?? []).forEach((t) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

/**
 * Returns all published post slugs — used by generateStaticParams in
 * app/(main)/blog/[slug]/page.tsx to pre-build every blog post at deploy time.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  // Uses admin client (no cookies) because this is called from generateStaticParams
  // which runs at build time outside any request scope.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  return (data ?? []).map((r) => r.slug as string);
}

export async function getRelatedPosts(currentId: string, tags: string[]): Promise<BlogPost[]> {
  if (!tags.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .neq("id", currentId)
    .overlaps("tags", tags)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data ?? []).map(mapPost);
}
