"use client";

import { useState } from "react";
import { ChevronLeft, Plus, Pencil, Zap } from "lucide-react";
import Link from "next/link";
import { LessonFormModal } from "@/components/admin/lesson-form-modal";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { toggleLessonPublished } from "@/lib/admin/actions";
import type { AdminCategory, AdminCourse, AdminLesson } from "@/lib/admin/queries";

interface LessonsClientPageProps {
  course: AdminCourse & { categoryId: string | null };
  lessons: AdminLesson[];
  categories: AdminCategory[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LessonsClientPage({ course, lessons, categories }: LessonsClientPageProps) {
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [showEditCourse, setShowEditCourse] = useState(false);

  return (
    <>
      {(showAddLesson || editingLesson) && (
        <LessonFormModal
          courseId={course.id}
          lesson={editingLesson ?? undefined}
          onClose={() => { setShowAddLesson(false); setEditingLesson(null); }}
        />
      )}
      {showEditCourse && (
        <CourseFormModal
          categories={categories}
          course={course}
          onClose={() => setShowEditCourse(false)}
        />
      )}

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

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">{course.title}</h1>
              <p className="mt-1 text-sm text-[#1e293b]/60">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} —{" "}
                {lessons.filter((l) => l.isPublished).length} published
                {course.categoryName && (
                  <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                    {course.categoryName}
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEditCourse(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-[#1e293b]/70 hover:bg-slate-50 hover:text-[#0f172a]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Course
              </button>
              <button
                onClick={() => setShowAddLesson(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Add Lesson
              </button>
            </div>
          </div>
        </div>

        {/* Lessons table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Zap className="mb-3 h-8 w-8 text-[#1e293b]/20" />
              <p className="font-semibold text-[#0f172a]">No lessons yet</p>
              <p className="mt-1 text-sm text-[#1e293b]/50">
                Click &quot;Add Lesson&quot; to create the first one.
              </p>
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
                    <th className="px-5 py-3">Edit</th>
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
                        {lesson.videoUrl && (
                          <p className="text-[11px] text-violet-500">▶ video attached</p>
                        )}
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
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-[#1e293b]/70 hover:bg-slate-100 hover:text-[#0f172a]"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
