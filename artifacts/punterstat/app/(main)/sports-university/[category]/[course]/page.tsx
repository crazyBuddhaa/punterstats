import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, BarChart2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonList } from "@/components/sports-university/lesson-list";
import {
  getCategoryBySlug,
  getCourseBySlug,
  getLessonsByCourse,
  getUserProgress,
} from "@/lib/sports-university/queries";
import { getUser } from "@/lib/auth/helpers";
import type { LessonProgress } from "@/types";

const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };

interface Props {
  params: Promise<{ category: string; course: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Not Found" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { category: categorySlug, course: courseSlug } = await params;

  const [category, course, user] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getCourseBySlug(courseSlug),
    getUser(),
  ]);
  if (!category || !course) notFound();

  const lessons = await getLessonsByCourse(course.id);

  let progressMap: Record<string, LessonProgress> = {};
  if (user) {
    const progressList = await getUserProgress(user.id, lessons.map((l) => l.id));
    progressMap = Object.fromEntries(progressList.map((p) => [p.lessonId, p]));
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const firstLesson = lessons[0];
  const nextIncomplete = lessons.find((l) => !progressMap[l.id]?.completed) ?? firstLesson;

  const totalMinutes = lessons.reduce((sum, l) => sum + Math.ceil((l.duration ?? 0) / 60), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <section className="bg-[#0f172a] px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/sports-university" className="hover:text-white/70 transition-colors">Sports University</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/sports-university/${categorySlug}`} className="hover:text-white/70 transition-colors">{category.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">{course.title}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <Badge variant="outline" className="mb-3 border-white/20 text-white/60 text-xs">
                {LEVEL_LABEL[course.level]}
              </Badge>
              <h1 className="text-2xl font-bold text-white sm:text-3xl leading-tight">{course.title}</h1>
              <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-2xl">{course.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </span>
                {totalMinutes > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    ~{totalMinutes} min
                  </span>
                )}
                {user && lessons.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" />
                    {completedCount}/{lessons.length} complete
                  </span>
                )}
              </div>
            </div>

            {nextIncomplete && (
              <div className="flex-shrink-0">
                <Button asChild className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
                  <Link href={`/sports-university/${categorySlug}/${courseSlug}/${nextIncomplete.slug}`}>
                    {completedCount === 0 ? "Start course" : "Continue"}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {user && lessons.length > 0 && (
            <div className="mt-6">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#3D2DFF] transition-all"
                  style={{ width: `${Math.round((completedCount / lessons.length) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-white/30">
                {Math.round((completedCount / lessons.length) * 100)}% complete
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lesson list */}
      <section className="container mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 text-base font-semibold text-[#0f172a]">Course lessons</h2>
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-[#1e293b]/50">Lessons are being prepared.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
            <LessonList
              lessons={lessons}
              categorySlug={categorySlug}
              courseSlug={courseSlug}
              progressMap={progressMap}
            />
          </div>
        )}
      </section>
    </div>
  );
}
