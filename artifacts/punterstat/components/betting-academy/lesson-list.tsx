import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson, LessonProgress } from "@/types";

interface Props {
  lessons: Lesson[];
  topicSlug: string;
  moduleSlug: string;
  activeLessonId?: string;
  progressMap: Record<string, LessonProgress>;
}

export function LessonList({ lessons, topicSlug, moduleSlug, activeLessonId, progressMap }: Props) {
  if (!lessons.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-[#1e293b]/50">
        No lessons published yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-border/40">
      {lessons.map((lesson, idx) => {
        const progress = progressMap[lesson.id];
        const isCompleted = progress?.completed ?? false;
        const isActive = lesson.id === activeLessonId;

        return (
          <li key={lesson.id}>
            <Link
              href={`/betting-academy/${topicSlug}/${moduleSlug}/${lesson.slug}`}
              className={cn(
                "flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#0f172a]/5",
                isActive && "bg-emerald-500/5 border-l-2 border-emerald-500"
              )}
            >
              <span className="mt-0.5 flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : lesson.videoUrl ? (
                  <PlayCircle className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-[#1e293b]/40")} />
                ) : (
                  <Circle className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-[#1e293b]/30")} />
                )}
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span
                  className={cn(
                    "font-medium leading-snug truncate",
                    isActive ? "text-emerald-600" : "text-[#1e293b]",
                    isCompleted && "line-through opacity-60"
                  )}
                >
                  {idx + 1}. {lesson.title}
                </span>
                {lesson.duration && (
                  <span className="text-xs text-[#1e293b]/40">
                    {Math.ceil(lesson.duration / 60)} min
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
