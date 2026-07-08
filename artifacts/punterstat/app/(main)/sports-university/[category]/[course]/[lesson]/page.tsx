import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, ChevronRight as ChevronNext } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonList } from "@/components/sports-university/lesson-list";
import { VideoPlayer } from "@/components/sports-university/video-player";
import { BookmarkButton } from "@/components/sports-university/bookmark-button";
import { CompleteButton } from "@/components/sports-university/complete-button";
import {
  getCategoryBySlug,
  getCourseBySlug,
  getLessonsByCourse,
  getLessonBySlug,
  getUserProgress,
  getLessonProgress,
  isLessonBookmarked,
} from "@/lib/sports-university/queries";
import { getUser, getUserProfile } from "@/lib/auth/helpers";
import type { LessonProgress } from "@/types";

// Rendering: fully dynamic SSR — same rationale as betting-academy lesson page.

interface Props {
  params: Promise<{ category: string; course: string; lesson: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) return { title: "Not Found" };
  const lesson = await getLessonBySlug(course.id, lessonSlug);
  if (!lesson) return { title: "Not Found" };
  return { title: `${lesson.title} — ${course.title}` };
}

/**
 * Decode HTML entities stored in the DB (e.g. &lt;p&gt; → <p>).
 * Some lessons were saved via a plain textarea where the browser submitted
 * entity-encoded text. This is a no-op when content already contains real tags.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // must be last — avoids double-decoding &amp;lt; etc.
}

/** Renders admin-authored HTML lesson content. Content is written only by admins. */
function LessonContent({ html }: { html: string }) {
  return (
    <div
      className="
        text-sm text-[#1e293b] leading-relaxed

        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#0f172a] [&_h1]:mt-6 [&_h1]:mb-3
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0f172a] [&_h2]:mt-5 [&_h2]:mb-2
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0f172a] [&_h3]:mt-4 [&_h3]:mb-1.5

        [&_p]:mb-3 [&_p]:leading-relaxed

        [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:space-y-1.5
        [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:space-y-1.5
        [&_li]:text-[#1e293b]/80 [&_li]:leading-relaxed

        [&_a]:text-[#3D2DFF] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80

        [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4 [&_img]:block [&_img]:mx-auto

        [&_hr]:border-border [&_hr]:my-6

        [&_strong]:font-semibold [&_em]:italic [&_u]:underline

        [&_blockquote]:border-l-4 [&_blockquote]:border-[#3D2DFF]/30
        [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#1e293b]/60 [&_blockquote]:my-4
      "
      dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(html) }}
    />
  );
}

export default async function LessonPage({ params }: Props) {
  const { category: categorySlug, course: courseSlug, lesson: lessonSlug } = await params;

  const [category, course, user] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getCourseBySlug(courseSlug),
    getUser(),
  ]);
  if (!category || !course) notFound();

  // Premium access gate — checked before any lesson content is fetched or rendered
  if (course.isPremium) {
    const profile = await getUserProfile();
    if (!profile || profile.role === "user") {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3D2DFF]/10">
              <svg className="h-8 w-8 text-[#3D2DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Premium Content</h1>
            <p className="text-[#1e293b]/60 mb-8">
              This lesson is part of a premium course. Upgrade your plan to unlock access.
            </p>
            {profile ? (
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
                  <Link href="/pricing">Upgrade to Premium</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/sports-university">Back to Sports University</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
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
    getLessonsByCourse(course.id),
    getLessonBySlug(course.id, lessonSlug),
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
      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-white px-4 py-3">
        <div className="container mx-auto max-w-7xl">
          <nav className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
            <Link href="/sports-university" className="hover:text-[#3D2DFF] transition-colors">Sports University</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/sports-university/${categorySlug}`} className="hover:text-[#3D2DFF] transition-colors">{category.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/sports-university/${categorySlug}/${courseSlug}`} className="hover:text-[#3D2DFF] transition-colors">{course.title}</Link>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40">
                  Course lessons
                </p>
                <h3 className="mt-1 text-sm font-semibold text-[#0f172a] line-clamp-1">{course.title}</h3>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <LessonList
                  lessons={lessons}
                  categorySlug={categorySlug}
                  courseSlug={courseSlug}
                  activeLessonId={lesson.id}
                  progressMap={progressMap}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Lesson header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0f172a] leading-tight sm:text-3xl">
                {lesson.title}
              </h1>
              {lesson.duration && (
                <p className="mt-1 text-sm text-[#1e293b]/50">
                  ~{Math.ceil(lesson.duration / 60)} min read
                </p>
              )}
            </div>

            {/* Video */}
            {lesson.videoUrl && (
              <div className="mb-8">
                <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
              </div>
            )}

            {/* Content */}
            {lesson.content ? (
              <div className="mb-8 rounded-xl border border-border/50 bg-white p-6 shadow-sm">
                <LessonContent html={lesson.content} />
              </div>
            ) : (
              <div className="mb-8 rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-[#1e293b]/40">
                Lesson content is being prepared.
              </div>
            )}

            {/* Action bar */}
            {user ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm">
                <BookmarkButton lessonId={lesson.id} initialBookmarked={lessonBookmarked} />
                <CompleteButton
                  lessonId={lesson.id}
                  categorySlug={categorySlug}
                  courseSlug={courseSlug}
                  initialCompleted={lessonCompleted}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[#3D2DFF]/20 bg-[#3D2DFF]/5 p-4 text-center text-sm text-[#3D2DFF]">
                <Link href="/register" className="font-medium hover:underline">Create a free account</Link>
                {" "}to track your progress and save bookmarks.
              </div>
            )}

            {/* Prev / Next navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {prevLesson ? (
                <Button variant="outline" size="sm" asChild className="gap-2 max-w-[48%]">
                  <Link href={`/sports-university/${categorySlug}/${courseSlug}/${prevLesson.slug}`}>
                    <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{prevLesson.title}</span>
                  </Link>
                </Button>
              ) : <div />}

              {nextLesson ? (
                <Button size="sm" asChild className="gap-2 max-w-[48%] bg-[#3D2DFF] hover:bg-[#3D2DFF]/90 ml-auto">
                  <Link href={`/sports-university/${categorySlug}/${courseSlug}/${nextLesson.slug}`}>
                    <span className="truncate">{nextLesson.title}</span>
                    <ChevronNext className="h-4 w-4 flex-shrink-0" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <Link href={`/sports-university/${categorySlug}/${courseSlug}`}>Back to course</Link>
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
