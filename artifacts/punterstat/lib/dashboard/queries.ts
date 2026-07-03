import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  lessonsCompleted: number;
  bookmarksCount: number;
  simSessionsCount: number;
  matchAnalysesCount: number;
  unreadNotifications: number;
}

export interface InProgressLesson {
  progressId: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  progressPct: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  categorySlug: string;
  section: string;
  updatedAt: string;
}

export interface CompletedLesson {
  progressId: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  completedAt: string | null;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  categorySlug: string;
  section: string;
}

export interface BookmarkedLesson {
  bookmarkId: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  categorySlug: string;
  section: string;
  createdAt: string;
}

export interface SimSession {
  id: string;
  type: "bet" | "probability";
  virtualBalance: number;
  startingBalance: number;
  totalBets: number;
  roi: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgressItem {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  pct: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  createdAt: string;
}

export interface SavedMatchAnalysis {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  createdAt: string;
}

// ─── Lesson nested row helper ─────────────────────────────────────────────────

type NestedLesson = {
  id: string;
  title: string;
  slug: string;
  course_id: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    level?: string;
    course_categories: { slug: string; section: string } | null;
  } | null;
} | null;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const [a, b, c, d, e] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("simulation_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("match_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
  ]);
  return {
    lessonsCompleted: a.count ?? 0,
    bookmarksCount: b.count ?? 0,
    simSessionsCount: c.count ?? 0,
    matchAnalysesCount: d.count ?? 0,
    unreadNotifications: e.count ?? 0,
  };
}

export async function getInProgressLessons(userId: string): Promise<InProgressLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("id, progress_pct, updated_at, lessons(id, title, slug, course_id, courses(id, title, slug, course_categories(slug, section)))")
    .eq("user_id", userId)
    .eq("completed", false)
    .gt("progress_pct", 0)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (data ?? []).flatMap((row) => {
    const lesson = row.lessons as unknown as NestedLesson;
    if (!lesson?.courses) return [];
    return [
      {
        progressId: row.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        progressPct: row.progress_pct,
        courseId: lesson.courses.id,
        courseTitle: lesson.courses.title,
        courseSlug: lesson.courses.slug,
        categorySlug: lesson.courses.course_categories?.slug ?? "",
        section: lesson.courses.course_categories?.section ?? "sports_university",
        updatedAt: row.updated_at,
      },
    ];
  });
}

export async function getCompletedLessons(userId: string): Promise<CompletedLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("id, completed_at, lessons(id, title, slug, course_id, courses(id, title, slug, course_categories(slug, section)))")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(50);

  return (data ?? []).flatMap((row) => {
    const lesson = row.lessons as unknown as NestedLesson;
    if (!lesson?.courses) return [];
    return [
      {
        progressId: row.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        completedAt: row.completed_at ?? null,
        courseId: lesson.courses.id,
        courseTitle: lesson.courses.title,
        courseSlug: lesson.courses.slug,
        categorySlug: lesson.courses.course_categories?.slug ?? "",
        section: lesson.courses.course_categories?.section ?? "sports_university",
      },
    ];
  });
}

export async function getBookmarks(userId: string): Promise<BookmarkedLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("id, created_at, lessons(id, title, slug, course_id, courses(id, title, slug, course_categories(slug, section)))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).flatMap((row) => {
    const lesson = row.lessons as unknown as NestedLesson;
    if (!lesson?.courses) return [];
    return [
      {
        bookmarkId: row.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        courseId: lesson.courses.id,
        courseTitle: lesson.courses.title,
        courseSlug: lesson.courses.slug,
        categorySlug: lesson.courses.course_categories?.slug ?? "",
        section: lesson.courses.course_categories?.section ?? "sports_university",
        createdAt: row.created_at,
      },
    ];
  });
}

export async function getSimulationSessions(userId: string): Promise<SimSession[]> {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("simulation_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!sessions?.length) return [];

  const sessionIds = sessions.map((s) => s.id);
  const { data: history } = await supabase
    .from("simulation_history")
    .select("session_id, profit_loss, stake")
    .in("session_id", sessionIds);

  const agg: Record<string, { totalBets: number; totalPL: number; totalStaked: number }> = {};
  for (const row of history ?? []) {
    if (!agg[row.session_id])
      agg[row.session_id] = { totalBets: 0, totalPL: 0, totalStaked: 0 };
    agg[row.session_id].totalBets += 1;
    agg[row.session_id].totalPL += Number(row.profit_loss);
    agg[row.session_id].totalStaked += Number(row.stake);
  }

  return sessions.map((s) => {
    const h = agg[s.id] ?? { totalBets: 0, totalPL: 0, totalStaked: 0 };
    const roi = h.totalStaked > 0 ? (h.totalPL / h.totalStaked) * 100 : 0;
    return {
      id: s.id,
      type: s.type as "bet" | "probability",
      virtualBalance: Number(s.virtual_balance),
      startingBalance: Number(s.starting_balance),
      totalBets: h.totalBets,
      roi: Math.round(roi * 10) / 10,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    };
  });
}

export async function getCourseProgress(userId: string): Promise<CourseProgressItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("completed, lessons(course_id, courses(id, title, slug, level))")
    .eq("user_id", userId);

  if (!data?.length) return [];

  const map: Record<string, { title: string; slug: string; level: string; completed: number; total: number }> = {};
  for (const row of data) {
    const lesson = row.lessons as unknown as {
      course_id: string;
      courses: { id: string; title: string; slug: string; level: string } | null;
    } | null;
    if (!lesson?.courses) continue;
    const c = lesson.courses;
    if (!map[c.id]) map[c.id] = { title: c.title, slug: c.slug, level: c.level, completed: 0, total: 0 };
    map[c.id].total += 1;
    if (row.completed) map[c.id].completed += 1;
  }

  return Object.entries(map)
    .map(([courseId, c]) => ({
      courseId,
      courseTitle: c.title,
      courseSlug: c.slug,
      level: c.level,
      totalLessons: c.total,
      completedLessons: c.completed,
      pct: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);
}

export async function getNotifications(userId: string): Promise<DashboardNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    link: row.link ?? null,
    createdAt: row.created_at,
  }));
}

export async function getSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    plan: data.plan,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelledAt: data.cancelled_at ?? null,
    createdAt: data.created_at,
  };
}

export async function getSavedMatchAnalyses(userId: string): Promise<SavedMatchAnalysis[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("match_analyses")
    .select("id, home_team_name, away_team_name, analysis_result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => {
    const result = row.analysis_result as {
      homeWinProb?: number;
      drawProb?: number;
      awayWinProb?: number;
    } | null;
    return {
      id: row.id,
      homeTeamName: row.home_team_name,
      awayTeamName: row.away_team_name,
      homeWinProb: result?.homeWinProb ?? 0,
      drawProb: result?.drawProb ?? 0,
      awayWinProb: result?.awayWinProb ?? 0,
      createdAt: row.created_at,
    };
  });
}
