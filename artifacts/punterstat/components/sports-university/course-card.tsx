import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

const LEVEL_LABEL: Record<Course["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const LEVEL_COLOR: Record<Course["level"], string> = {
  beginner: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  course: Course;
  categorySlug: string;
  lessonCount: number;
  completedCount?: number;
}

export function CourseCard({ course, categorySlug, lessonCount, completedCount = 0 }: Props) {
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  return (
    <Link href={`/sports-university/${categorySlug}/${course.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-[#3D2DFF]/40 hover:shadow-md hover:-translate-y-0.5">
        {/* Thumbnail */}
        <div className="relative h-40 bg-[#0f172a]/5 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-[#0f172a]/20" />
            </div>
          )}
          {course.isPremium && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-[#0f172a]/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              Premium
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#0f172a] leading-snug group-hover:text-[#3D2DFF] transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={`w-fit text-xs ${LEVEL_COLOR[course.level]}`}
          >
            {LEVEL_LABEL[course.level]}
          </Badge>
        </CardHeader>

        <CardContent className="pb-3 pt-0">
          <p className="text-sm text-[#1e293b]/60 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
            <Clock className="h-3.5 w-3.5" />
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </div>
          {completedCount > 0 && (
            <span className="text-xs font-medium text-[#3D2DFF]">{progress}% done</span>
          )}
        </CardFooter>

        {/* Progress bar */}
        {lessonCount > 0 && completedCount > 0 && (
          <div className="h-1 w-full bg-[#3D2DFF]/10">
            <div
              className="h-full bg-[#3D2DFF] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Card>
    </Link>
  );
}
