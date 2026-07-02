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
import { getUser } from "@/lib/auth/helpers";
import type { LessonProgress } from "@/types";

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

function ContentRenderer({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[#1e293b] leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-[#0f172a] mt-6">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith("## "))  return <h2 key={i} className="text-lg font-semibold text-[#0f172a] mt-8">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith("# "))   return <h1 key={i} className="text-xl font-bold text-[#0f172a] mt-8">{trimmed.slice(2)}</h1>;
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("* "));
          return (
            <ul key={i} className="list-disc list-inside space-y-1.5 text-sm">
              {items.map((item, j) => <li key={j} className="text-[#1e293b]/80">{item.slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i} className="text-sm text-[#1e293b]/80 leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

export default async function LessonPage({ params }: Props) {
  const { topic: topicSlug, module: moduleSlug, lesson: lessonSlug } = await params;

  const [topic, mod, user] = await Promise.all([
    getTopicBySlug(topicSlug),
    getModuleBySlug(moduleSlug),
    getUser(),
  ]);
  if (!topic || !mod) notFound();

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
                <ContentRenderer content={lesson.content} />
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
