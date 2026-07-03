"use client";

import { useEffect, useState, useTransition } from "react";
import { BookOpen, Plus, Pencil, ChevronRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { toggleCoursePublished } from "@/lib/admin/actions";
import type { AdminCategory, AdminCourse } from "@/lib/admin/queries";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

interface CoursesClientPageProps {
  courses: AdminCourse[];
  categories: AdminCategory[];
}

export function CoursesClientPage({ courses, categories }: CoursesClientPageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);

  // Group courses by category
  const grouped: { category: string; categoryId: string | null; courses: AdminCourse[] }[] = [];
  const seen = new Set<string | null>();

  // First pass — preserve category order from categories list
  for (const cat of categories) {
    const catCourses = courses.filter((c) => c.categoryId === cat.id);
    if (catCourses.length > 0 || true) {
      grouped.push({ category: cat.name, categoryId: cat.id, courses: catCourses });
      seen.add(cat.id);
    }
  }
  // Uncategorised
  const uncategorised = courses.filter((c) => !c.categoryId || !seen.has(c.categoryId));
  if (uncategorised.length > 0) {
    grouped.push({ category: "Uncategorised", categoryId: null, courses: uncategorised });
  }

  const publishedCount = courses.filter((c) => c.isPublished).length;

  return (
    <>
      {(showCreate || editingCourse) && (
        <CourseFormModal
          categories={categories}
          course={editingCourse ?? undefined}
          onClose={() => { setShowCreate(false); setEditingCourse(null); }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Courses &amp; Lessons</h1>
            <p className="mt-1 text-sm text-[#1e293b]/60">
              {courses.length} course{courses.length !== 1 ? "s" : ""} — {publishedCount} published
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            New Course
          </button>
        </div>

        {/* Module sections */}
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-16 text-center shadow-sm">
            <BookOpen className="mb-3 h-8 w-8 text-[#1e293b]/20" />
            <p className="font-semibold text-[#0f172a]">No courses yet</p>
            <p className="mt-1 text-sm text-[#1e293b]/50">Click "New Course" to add your first one.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.categoryId ?? "uncategorised"} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {/* Module header */}
                <div className="flex items-center gap-2.5 border-b border-border bg-slate-50 px-5 py-3">
                  <FolderOpen className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-semibold text-[#0f172a]">{group.category}</span>
                  <span className="ml-auto rounded-full bg-white border border-border px-2 py-0.5 text-xs font-medium text-[#1e293b]/50">
                    {group.courses.length} course{group.courses.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {group.courses.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[#1e293b]/40 italic">No courses in this module yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {group.courses.map((course) => (
                      <div key={course.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                        {/* Course info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-[#0f172a]">{course.title}</p>
                          <p className="font-mono text-[11px] text-[#1e293b]/40">{course.slug}</p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${LEVEL_COLORS[course.level] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {course.level}
                          </span>
                          {course.isPremium && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Premium
                            </span>
                          )}
                          <span className="text-xs text-[#1e293b]/40">
                            {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <PublishToggle
                            id={course.id}
                            isPublished={course.isPublished}
                            action={toggleCoursePublished}
                          />
                          <button
                            onClick={() => setEditingCourse(course)}
                            title="Edit course"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-[#1e293b]/70 hover:bg-slate-100 hover:text-[#0f172a]"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <Link
                            href={`/admin/courses/${course.id}/lessons`}
                            className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                          >
                            Lessons <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
