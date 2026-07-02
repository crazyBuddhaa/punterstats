import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, CheckCircle2, BookOpen } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getCourseProgress } from "@/lib/dashboard/queries";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Learning Progress — Dashboard — PunterStat" };

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} strokeWidth="6" className="stroke-slate-100 fill-none" />
      <circle
        cx="32"
        cy="32"
        r={r}
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`fill-none transition-all duration-700 ${
          pct === 100 ? "stroke-emerald-500" : "stroke-teal-500"
        }`}
      />
    </svg>
  );
}

export default async function ProgressPage() {
  const profile = await requireAuth();
  const courseProgress = await getCourseProgress(profile.userId);

  const totalLessons = courseProgress.reduce((s, c) => s + c.totalLessons, 0);
  const totalCompleted = courseProgress.reduce((s, c) => s + c.completedLessons, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const fullyDone = courseProgress.filter((c) => c.pct === 100).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Learning Progress</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Track your completion across all courses.
        </p>
      </div>

      {courseProgress.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No progress yet"
          description="Start a lesson from Sports University or Betting Academy — your progress will appear here."
          actionLabel="Start learning"
          actionHref="/sports-university"
        />
      ) : (
        <>
          {/* Overall summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-teal-600">{overallPct}%</p>
              <p className="mt-1 text-sm text-[#1e293b]/60">Overall completion</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#0f172a]">
                {totalCompleted}
                <span className="text-base font-normal text-[#1e293b]/50">/{totalLessons}</span>
              </p>
              <p className="mt-1 text-sm text-[#1e293b]/60">Lessons completed</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{fullyDone}</p>
              <p className="mt-1 text-sm text-[#1e293b]/60">
                Course{fullyDone !== 1 ? "s" : ""} completed
              </p>
            </div>
          </div>

          {/* Course breakdown */}
          <div>
            <h2 className="mb-4 font-semibold text-[#0f172a]">By Course</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {courseProgress.map((c) => (
                <div
                  key={c.courseId}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="relative flex-shrink-0">
                    <ProgressRing pct={c.pct} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0f172a]">
                      {c.pct}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate font-semibold text-[#0f172a]">{c.courseTitle}</p>
                      {c.pct === 100 && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          levelColors[c.level] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.level}
                      </span>
                      <span className="text-xs text-[#1e293b]/50">
                        {c.completedLessons}/{c.totalLessons} lessons
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          c.pct === 100 ? "bg-emerald-500" : "bg-teal-500"
                        }`}
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {overallPct < 100 && (
            <div className="rounded-xl border border-border bg-white p-5 text-center shadow-sm">
              <BookOpen className="mx-auto mb-3 h-6 w-6 text-teal-500" />
              <p className="font-semibold text-[#0f172a]">Keep going!</p>
              <p className="mt-1 text-sm text-[#1e293b]/60">
                You&apos;ve completed {totalCompleted} of {totalLessons} lessons. Consistency is the
                key to building genuine sports probability literacy.
              </p>
              <Link
                href="/dashboard/continue-learning"
                className="mt-4 inline-block rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Continue Learning
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
