import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    authorId: row.author_id as string,
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

export async function getPublishedPosts(tag?: string): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (tag) query = query.contains("tags", [tag]);

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
