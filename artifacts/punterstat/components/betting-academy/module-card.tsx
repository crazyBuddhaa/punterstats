import Link from "next/link";
import { BookOpen, Clock, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

const LEVEL_LABEL: Record<Course["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const LEVEL_COLOR: Record<Course["level"], string> = {
  beginner: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
  expert: "bg-purple-50 text-purple-700 border-purple-200",
};

interface Props {
  module: Course;
  topicSlug: string;
  lessonCount: number;
  completedCount?: number;
}

export function ModuleCard({ module: mod, topicSlug, lessonCount, completedCount = 0 }: Props) {
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  return (
    <Link href={`/betting-academy/${topicSlug}/${mod.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#0f172a] leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                {mod.title}
              </h3>
              <Badge
                variant="outline"
                className={`mt-1.5 w-fit text-xs ${LEVEL_COLOR[mod.level]}`}
              >
                {LEVEL_LABEL[mod.level]}
              </Badge>
            </div>
            {mod.isPremium && (
              <div className="ml-auto flex flex-shrink-0 items-center gap-1 rounded-md bg-[#0f172a]/80 px-2 py-0.5 text-xs text-white">
                <Lock className="h-3 w-3" />
                Pro
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3 pt-0">
          <p className="text-sm text-[#1e293b]/60 leading-relaxed line-clamp-2">{mod.description}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
            <Clock className="h-3.5 w-3.5" />
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </div>
          {completedCount > 0 && (
            <span className="text-xs font-medium text-emerald-600">{progress}% done</span>
          )}
        </CardFooter>

        {lessonCount > 0 && completedCount > 0 && (
          <div className="h-1 w-full bg-emerald-500/10">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Card>
    </Link>
  );
}
