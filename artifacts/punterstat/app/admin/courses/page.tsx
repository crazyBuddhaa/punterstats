import { requireAdmin } from "@/lib/auth/helpers";
import { getAllCourses } from "@/lib/admin/queries";
import { toggleCoursePublished } from "@/lib/admin/actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getAllCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Courses &amp; Lessons</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          {courses.length} course{courses.length !== 1 ? "s" : ""} —{" "}
          {courses.filter((c) => c.isPublished).length} published
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-3 h-8 w-8 text-[#1e293b]/20" />
            <p className="font-semibold text-[#0f172a]">No courses yet</p>
            <p className="mt-1 text-sm text-[#1e293b]/50">Add courses via Supabase Studio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-[#1e293b]/50">
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Lessons</th>
                  <th className="px-5 py-3">Premium</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr key={course.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-[#0f172a]">{course.title}</p>
                        <p className="font-mono text-[11px] text-[#1e293b]/40">{course.slug}</p>
                        {course.categoryName && (
                          <p className="text-[11px] text-[#1e293b]/50">{course.categoryName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${LEVEL_COLORS[course.level] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {course.level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-[#1e293b]/70">
                      {course.lessonCount}
                    </td>
                    <td className="px-5 py-3.5">
                      {course.isPremium ? (
                        <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Premium
                        </span>
                      ) : (
                        <span className="text-xs text-[#1e293b]/40">Free</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PublishToggle
                        id={course.id}
                        isPublished={course.isPublished}
                        action={toggleCoursePublished}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/courses/${course.id}/lessons`}
                        className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
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
