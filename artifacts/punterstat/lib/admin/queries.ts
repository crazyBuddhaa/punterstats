import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  publishedLessons: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalSimSessions: number;
  subscriptionBreakdown: { plan: string; count: number }[];
}

export interface AdminUser {
  profileId: string;
  userId: string;
  displayName: string | null;
  email: string | null;
  role: string;
  plan: string;
  createdAt: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  level: string;
  isPremium: boolean;
  isPublished: boolean;
  lessonCount: number;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [users, courses, publishedCourses, lessons, publishedLessons, blog, publishedBlog, sims, subs] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("simulation_sessions").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("plan"),
    ]);

  const planMap: Record<string, number> = {};
  for (const row of subs.data ?? []) {
    planMap[row.plan] = (planMap[row.plan] ?? 0) + 1;
  }
  const subscriptionBreakdown = Object.entries(planMap).map(([plan, count]) => ({ plan, count }));

  return {
    totalUsers: users.count ?? 0,
    totalCourses: courses.count ?? 0,
    publishedCourses: publishedCourses.count ?? 0,
    totalLessons: lessons.count ?? 0,
    publishedLessons: publishedLessons.count ?? 0,
    totalBlogPosts: blog.count ?? 0,
    publishedBlogPosts: publishedBlog.count ?? 0,
    totalSimSessions: sims.count ?? 0,
    subscriptionBreakdown,
  };
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, user_id, display_name, role, created_at, subscriptions(plan)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const sub = row.subscriptions as unknown as { plan: string } | null;
    return {
      profileId: row.id,
      userId: row.user_id,
      displayName: row.display_name ?? null,
      email: null, // auth.users is not directly queryable; email shown separately if needed
      role: row.role,
      plan: sub?.plan ?? "free",
      createdAt: row.created_at,
    };
  });
}

export async function getAllCourses(): Promise<AdminCourse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, slug, level, is_premium, is_published, sort_order, created_at, updated_at, course_categories(name), lessons(id)")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => {
    const cat = row.course_categories as unknown as { name: string } | null;
    const lessonArr = row.lessons as unknown as { id: string }[] | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      level: row.level,
      isPremium: row.is_premium,
      isPublished: row.is_published,
      lessonCount: lessonArr?.length ?? 0,
      categoryName: cat?.name ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getLessonsForCourse(courseId: string): Promise<AdminLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, title, slug, is_published, sort_order, duration_seconds, created_at, updated_at")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    durationSeconds: row.duration_seconds ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCourseById(courseId: string): Promise<{ id: string; title: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();
  return data ?? null;
}

export async function getAllBlogPosts(): Promise<AdminBlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, thumbnail_url, tags, is_published, published_at, created_at, updated_at, author_id, profiles!blog_posts_author_id_fkey(display_name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const author = row.profiles as unknown as { display_name: string | null } | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? null,
      content: row.content,
      thumbnailUrl: row.thumbnail_url ?? null,
      tags: row.tags ?? [],
      isPublished: row.is_published,
      publishedAt: row.published_at ?? null,
      authorName: author?.display_name ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getBlogPostById(id: string): Promise<AdminBlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, thumbnail_url, tags, is_published, published_at, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? null,
    content: data.content,
    thumbnailUrl: data.thumbnail_url ?? null,
    tags: data.tags ?? [],
    isPublished: data.is_published,
    publishedAt: data.published_at ?? null,
    authorName: null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    enabled: row.enabled,
    description: row.description ?? null,
    updatedAt: row.updated_at,
  }));
}
