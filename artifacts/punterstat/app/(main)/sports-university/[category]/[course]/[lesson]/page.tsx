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
import { getUser } from "@/lib/auth/helpers";
import type { LessonProgress } from "@/types";

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

function ContentRenderer({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[#1e293b] leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return <h3 key={i} className="text-base font-semibold text-[#0f172a] mt-6">{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith("## ")) {
          return <h2 key={i} className="text-lg font-semibold text-[#0f172a] mt-8">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold text-[#0f172a] mt-8">{trimmed.slice(2)}</h1>;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("* "));
          return (
            <ul key={i} className="list-disc list-inside space-y-1.5 text-sm">
              {items.map((item, j) => (
                <li key={j} className="text-[#1e293b]/80">{item.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm text-[#1e293b]/80 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
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
                <ContentRenderer content={lesson.content} />
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
