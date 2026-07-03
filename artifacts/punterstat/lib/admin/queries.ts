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

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  isPremium: boolean;
  isPublished: boolean;
  lessonCount: number;
  categoryId: string | null;
  categoryName: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  videoUrl: string | null;
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

  // profiles and subscriptions both reference auth.users — no direct FK between
  // them, so PostgREST cannot auto-join. Fetch separately and merge by user_id.
  const [{ data: profileData }, { data: subData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, user_id, display_name, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("user_id, plan"),
  ]);

  const subMap = new Map<string, string>(
    (subData ?? []).map((s) => [s.user_id as string, s.plan as string])
  );

  return (profileData ?? []).map((row) => ({
    profileId: row.id,
    userId: row.user_id,
    displayName: row.display_name ?? null,
    email: null,
    role: row.role,
    plan: subMap.get(row.user_id) ?? "free",
    createdAt: row.created_at,
  }));
}

export async function getAllCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  }));
}

export async function getAllCourses(): Promise<AdminCourse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, slug, description, level, is_premium, is_published, sort_order, category_id, created_at, updated_at, course_categories(id, name), lessons(id)")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => {
    const cat = row.course_categories as unknown as { id: string; name: string } | null;
    const lessonArr = row.lessons as unknown as { id: string }[] | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description ?? "",
      level: row.level,
      isPremium: row.is_premium,
      isPublished: row.is_published,
      lessonCount: lessonArr?.length ?? 0,
      categoryId: (row.category_id as string | null) ?? null,
      categoryName: cat?.name ?? null,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getLessonsForCourse(courseId: string): Promise<AdminLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, title, slug, content, video_url, is_published, sort_order, duration_seconds, created_at, updated_at")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content ?? null,
    videoUrl: row.video_url ?? null,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    durationSeconds: row.duration_seconds ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCourseWithDetails(courseId: string): Promise<(AdminCourse & { categoryId: string | null }) | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, slug, description, level, is_premium, is_published, sort_order, category_id, created_at, updated_at, course_categories(id, name), lessons(id)")
    .eq("id", courseId)
    .single();

  if (!data) return null;
  const cat = data.course_categories as unknown as { id: string; name: string } | null;
  const lessonArr = data.lessons as unknown as { id: string }[] | null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description ?? "",
    level: data.level,
    isPremium: data.is_premium,
    isPublished: data.is_published,
    lessonCount: lessonArr?.length ?? 0,
    categoryId: (data.category_id as string | null) ?? null,
    categoryName: cat?.name ?? null,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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
  // Note: blog_posts.author_id references auth.users (not profiles), so we
  // cannot auto-join to profiles via Supabase's FK syntax. authorName is
  // always null in the admin view; Stage 10 public pages can do a separate
  // profile lookup if needed.
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, thumbnail_url, tags, is_published, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? null,
    content: row.content,
    thumbnailUrl: row.thumbnail_url ?? null,
    tags: row.tags ?? [],
    isPublished: row.is_published,
    publishedAt: row.published_at ?? null,
    authorName: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
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
