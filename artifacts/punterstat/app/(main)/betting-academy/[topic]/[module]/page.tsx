import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, BarChart2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonList } from "@/components/betting-academy/lesson-list";
import {
  getTopicBySlug, getModuleBySlug, getLessonsByModule, getUserProgress,
} from "@/lib/betting-academy/queries";
import { getUserProfile } from "@/lib/auth/helpers";
import type { LessonProgress } from "@/types";

const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };

interface Props {
  params: Promise<{ topic: string; module: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = await getModuleBySlug(slug);
  if (!mod) return { title: "Not Found" };
  return { title: mod.title, description: mod.description };
}

export default async function ModulePage({ params }: Props) {
  const { topic: topicSlug, module: moduleSlug } = await params;
  const [topic, mod, profile] = await Promise.all([
    getTopicBySlug(topicSlug),
    getModuleBySlug(moduleSlug),
    getUserProfile(),
  ]);
  if (!topic || !mod) notFound();

  const lessons = await getLessonsByModule(mod.id);

  let progressMap: Record<string, LessonProgress> = {};
  if (profile) {
    const progressList = await getUserProgress(profile.userId, lessons.map((l) => l.id));
    progressMap = Object.fromEntries(progressList.map((p) => [p.lessonId, p]));
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const nextIncomplete = lessons.find((l) => !progressMap[l.id]?.completed) ?? lessons[0];
  const totalMinutes = lessons.reduce((sum, l) => sum + Math.ceil((l.duration ?? 0) / 60), 0);
  const isLoggedIn = Boolean(profile);
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
        <section className="bg-[#0f172a] px-4 py-12">
          <div className="container mx-auto max-w-6xl">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
              <Link href="/betting-academy" className="hover:text-white/70 transition-colors">Betting Academy</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/betting-academy/${topicSlug}`} className="hover:text-white/70 transition-colors">{topic.name}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/70">{mod.title}</span>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3 border-white/20 text-white/60 text-xs">
                  {LEVEL_LABEL[mod.level]}
                </Badge>
                <h1 className="text-2xl font-bold text-white sm:text-3xl leading-tight">{mod.title}</h1>
                <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-2xl">{mod.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                  {totalMinutes > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />~{totalMinutes} min
                    </span>
                  )}
                </div>
              </div>
              {nextIncomplete && (
                <div className="flex-shrink-0">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/betting-academy/${topicSlug}/${moduleSlug}/${nextIncomplete.slug}`}>
                      Start module
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className={isLoggedIn ? "py-2" : "container mx-auto max-w-6xl px-4 py-10"}>
        {isLoggedIn && (
          <div className="mb-6">
            <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-[#1e293b]/50">
              <Link href="/betting-academy" className="hover:text-[#0f172a] transition-colors">Betting Academy</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/betting-academy/${topicSlug}`} className="hover:text-[#0f172a] transition-colors">{topic.name}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-[#0f172a]">{mod.title}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {LEVEL_LABEL[mod.level]}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-[#1e293b]/50">
                    <BookOpen className="h-3.5 w-3.5" />
                    {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                  {totalMinutes > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#1e293b]/50">
                      <Clock className="h-3.5 w-3.5" />~{totalMinutes} min
                    </span>
                  )}
                  {lessons.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#1e293b]/50">
                      <BarChart2 className="h-3.5 w-3.5" />
                      {completedCount}/{lessons.length} complete
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl leading-tight">{mod.title}</h1>
              </div>

              {nextIncomplete && (
                <div className="flex-shrink-0">
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/betting-academy/${topicSlug}/${moduleSlug}/${nextIncomplete.slug}`}>
                      {completedCount === 0 ? "Start module" : "Continue"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {lessons.length > 0 && (
              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#1e293b]/40">{progressPct}% complete</p>
              </div>
            )}
          </div>
        )}

        <h2 className="mb-4 text-base font-semibold text-[#0f172a]">Module lessons</h2>
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-[#1e293b]/50">Lessons are being prepared.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
            <LessonList
              lessons={lessons}
              topicSlug={topicSlug}
              moduleSlug={moduleSlug}
              progressMap={progressMap}
            />
          </div>
        )}
      </section>
    </div>
  );
}
