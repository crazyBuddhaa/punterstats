import { createClient } from "@/lib/supabase/server";
import type { CourseCategory, Course, Lesson, LessonProgress, Bookmark } from "@/types";

// ── Mappers ────────────────────────────────────────────────

function mapCategory(row: Record<string, unknown>): CourseCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | null,
    iconName: row.icon_name as string | null,
    sortOrder: row.sort_order as number,
    section: "betting_academy",
  };
}

function mapCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    title: row.title as string,
    slug: row.slug as string,
    description: row.description as string,
    thumbnailUrl: row.thumbnail_url as string | null,
    level: row.level as Course["level"],
    isPremium: row.is_premium as boolean,
    isPublished: row.is_published as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string | null,
    videoUrl: row.video_url as string | null,
    duration: row.duration_seconds as number | null,
    sortOrder: row.sort_order as number,
    isPublished: row.is_published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapProgress(row: Record<string, unknown>): LessonProgress {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    lessonId: row.lesson_id as string,
    completed: row.completed as boolean,
    completedAt: row.completed_at as string | null,
    progressPct: row.progress_pct as number,
  };
}

function mapBookmark(row: Record<string, unknown>): Bookmark {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    lessonId: row.lesson_id as string,
    createdAt: row.created_at as string,
  };
}

// ── Queries ────────────────────────────────────────────────

export async function getTopics(): Promise<CourseCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("*")
    .eq("section", "betting_academy")
    .order("sort_order");
  return (data ?? []).map(mapCategory);
}

export async function getTopicBySlug(slug: string): Promise<CourseCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("*")
    .eq("slug", slug)
    .eq("section", "betting_academy")
    .single();
  return data ? mapCategory(data) : null;
}

export async function getModulesByTopic(topicId: string): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("category_id", topicId)
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map(mapCourse);
}

export async function getModuleBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ? mapCourse(data) : null;
}

export async function getLessonsByModule(moduleId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", moduleId)
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map(mapLesson);
}

export async function getLessonBySlug(moduleId: string, slug: string): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", moduleId)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ? mapLesson(data) : null;
}

export async function getUserProgress(userId: string, lessonIds: string[]): Promise<LessonProgress[]> {
  if (!lessonIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return (data ?? []).map(mapProgress);
}

export async function getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();
  return data ? mapProgress(data) : null;
}

export async function isLessonBookmarked(userId: string, lessonId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();
  return !!data;
}

/**
 * Returns every published topic/module/lesson slug triple — used by
 * generateStaticParams in the lesson page to pre-build all routes at deploy time.
 * One Supabase query with a nested join to avoid N+1.
 */
export async function getAllLessonPaths(): Promise<
  Array<{ topic: string; module: string; lesson: string }>
> {
  const supabase = await createClient();
  // Fetch all published lessons with their parent course slug and the course's
  // parent category slug in one query via Supabase's foreign-table notation.
  const { data } = await supabase
    .from("lessons")
    .select("slug, courses!inner(slug, course_categories!inner(slug, section))")
    .eq("is_published", true)
    .eq("courses.is_published", true)
    .eq("courses.course_categories.section", "betting_academy");

  if (!data) return [];

  return data.flatMap((lesson) => {
    const courses = Array.isArray(lesson.courses) ? lesson.courses : [lesson.courses];
    return courses.flatMap((course: Record<string, unknown>) => {
      const categories = Array.isArray(course.course_categories)
        ? course.course_categories
        : [course.course_categories];
      return categories.map((cat: Record<string, unknown>) => ({
        topic: cat.slug as string,
        module: course.slug as string,
        lesson: lesson.slug,
      }));
    });
  });
}

export async function getModuleCount(topicId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", topicId)
    .eq("is_published", true);
  return count ?? 0;
}

export async function getLessonCount(moduleId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", moduleId)
    .eq("is_published", true);
  return count ?? 0;
}
