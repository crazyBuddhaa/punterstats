import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, ChevronRight as ChevronNext } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonList } from "@/components/betting-academy/lesson-list";
import { VideoPlayer } from "@/components/sports-university/video-player";
import { BookmarkButton } from "@/components/betting-academy/bookmark-button";
import {
  getTopicBySlug, getModuleBySlug, getLessonsByModule,
  getLessonBySlug, getUserProgress, getLessonProgress, isLessonBookmarked,
} from "@/lib/betting-academy/queries";
import { CompleteButton } from "@/components/betting-academy/complete-button";
import { getUser, getUserProfile } from "@/lib/auth/helpers";
import { LessonContent } from "@/components/lessons/lesson-content";
import type { LessonProgress } from "@/types";

// Rendering: fully dynamic SSR.
// These pages call getUser() → cookies() on every render, which opts the
// route out of Next.js static/ISR caching regardless of revalidate/generateStaticParams.
// Authenticated users get personalised progress + bookmark state server-side.
// Static pre-rendering requires extracting the personalisation layer to a
// client component (planned for a future PPR refactor).

interface Props {
  params: Promise<{ topic: string; module: string; lesson: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const mod = await getModuleBySlug(moduleSlug);
  if (!mod) return { title: "Not Found" };
  const lesson = await getLessonBySlug(mod.id, lessonSlug);
  if (!lesson) return { title: "Not Found" };
  return { title: `${lesson.title} — ${mod.title}` };
}


export default async function LessonPage({ params }: Props) {
  const { topic: topicSlug, module: moduleSlug, lesson: lessonSlug } = await params;

  const [topic, mod, user] = await Promise.all([
    getTopicBySlug(topicSlug),
    getModuleBySlug(moduleSlug),
    getUser(),
  ]);
  if (!topic || !mod) notFound();

  // Premium access gate — checked before any lesson content is fetched or rendered
  if (mod.isPremium) {
    const profile = await getUserProfile();
    if (!profile || profile.role === "user") {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Premium Content</h1>
            <p className="text-[#1e293b]/60 mb-8">
              This lesson is part of a premium module. Upgrade your plan to unlock access.
            </p>
            {profile ? (
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/pricing">Upgrade to Premium</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/betting-academy">Back to Betting Academy</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/register">Create a Free Account</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <p className="text-xs text-[#1e293b]/40 mt-1">Already have premium? Sign in to access.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  const [lessons, lesson] = await Promise.all([
    getLessonsByModule(mod.id),
    getLessonBySlug(mod.id, lessonSlug),
  ]);
  if (!lesson) notFound();

  let progressMap: Record<string, LessonProgress> = {};
  let lessonCompleted = false;
  let lessonBookmarked = false;

  if (user) {
    const [progressList, progress, bookmarked] = await Promise.all([
      getUserProgress(user.id, lessons.map((l) => l.id)),
      getLessonProgress(user.id, lesson.id),
      isLessonBookmarked(user.id, lesson.id),
    ]);
    progressMap = Object.fromEntries(progressList.map((p) => [p.lessonId, p]));
    lessonCompleted = progress?.completed ?? false;
    lessonBookmarked = bookmarked;
  }

  const currentIdx = lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-border/50 bg-white px-4 py-3">
        <div className="container mx-auto max-w-7xl">
          <nav className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
            <Link href="/betting-academy" className="hover:text-emerald-600 transition-colors">Betting Academy</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/betting-academy/${topicSlug}`} className="hover:text-emerald-600 transition-colors">{topic.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/betting-academy/${topicSlug}/${moduleSlug}`} className="hover:text-emerald-600 transition-colors">{mod.title}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1e293b]/80 truncate max-w-[160px]">{lesson.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8 lg:items-start">
          {/* Sidebar */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
              <div className="border-b border-border/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">Module lessons</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0f172a] line-clamp-1">{mod.title}</h3>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <LessonList
                  lessons={lessons}
                  topicSlug={topicSlug}
                  moduleSlug={moduleSlug}
                  activeLessonId={lesson.id}
                  progressMap={progressMap}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0f172a] leading-tight sm:text-3xl">{lesson.title}</h1>
              {lesson.duration && (
                <p className="mt-1 text-sm text-[#1e293b]/50">~{Math.ceil(lesson.duration / 60)} min read</p>
              )}
            </div>

            {lesson.videoUrl && (
              <div className="mb-8">
                <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
              </div>
            )}

            {lesson.content ? (
              <div className="mb-8 rounded-xl border border-border/50 bg-white p-6 shadow-sm">
                <LessonContent html={lesson.content} variant="betting-academy" />
              </div>
            ) : (
              <div className="mb-8 rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-[#1e293b]/40">
                Lesson content is being prepared.
              </div>
            )}

            {user ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm">
                <BookmarkButton lessonId={lesson.id} initialBookmarked={lessonBookmarked} />
                <CompleteButton
                  lessonId={lesson.id}
                  topicSlug={topicSlug}
                  moduleSlug={moduleSlug}
                  initialCompleted={lessonCompleted}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center text-sm text-emerald-700">
                <Link href="/register" className="font-medium hover:underline">Create a free account</Link>
                {" "}to track your progress and save bookmarks.
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              {prevLesson ? (
                <Button variant="outline" size="sm" asChild className="gap-2 max-w-[48%]">
                  <Link href={`/betting-academy/${topicSlug}/${moduleSlug}/${prevLesson.slug}`}>
                    <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{prevLesson.title}</span>
                  </Link>
                </Button>
              ) : <div />}

              {nextLesson ? (
                <Button size="sm" asChild className="gap-2 max-w-[48%] bg-emerald-600 hover:bg-emerald-700 ml-auto">
                  <Link href={`/betting-academy/${topicSlug}/${moduleSlug}/${nextLesson.slug}`}>
                    <span className="truncate">{nextLesson.title}</span>
                    <ChevronNext className="h-4 w-4 flex-shrink-0" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <Link href={`/betting-academy/${topicSlug}/${moduleSlug}`}>Back to module</Link>
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
