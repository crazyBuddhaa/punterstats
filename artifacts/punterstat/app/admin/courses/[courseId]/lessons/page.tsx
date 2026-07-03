import { requireAdmin } from "@/lib/auth/helpers";
import { getLessonsForCourse, getCourseById } from "@/lib/admin/queries";
import { toggleLessonPublished } from "@/lib/admin/actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function AdminLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireAdmin();
  const { courseId } = await params;

  const [course, lessons] = await Promise.all([
    getCourseById(courseId),
    getLessonsForCourse(courseId),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/courses"
          className="mb-3 flex items-center gap-1.5 text-sm text-[#1e293b]/60 hover:text-[#0f172a]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-[#0f172a]">{course.title}</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} —{" "}
          {lessons.filter((l) => l.isPublished).length} published
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="mb-3 h-8 w-8 text-[#1e293b]/20" />
            <p className="font-semibold text-[#0f172a]">No lessons yet</p>
            <p className="mt-1 text-sm text-[#1e293b]/50">Add lessons via Supabase Studio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-[#1e293b]/50">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Lesson</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 tabular-nums text-[#1e293b]/40">
                      {lesson.sortOrder}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#0f172a]">{lesson.title}</p>
                      <p className="font-mono text-[11px] text-[#1e293b]/40">{lesson.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-[#1e293b]/60">
                      {formatDuration(lesson.durationSeconds)}
                    </td>
                    <td className="px-5 py-3.5">
                      <PublishToggle
                        id={lesson.id}
                        isPublished={lesson.isPublished}
                        action={toggleLessonPublished}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
