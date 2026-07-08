import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getInProgressLessons, getCompletedLessons, type InProgressLesson, type CompletedLesson } from "@/lib/dashboard/queries";
import { EmptyState } from "@/components/dashboard/empty-state";

function lessonUrl(item: Pick<InProgressLesson | CompletedLesson, "section" | "categorySlug" | "courseSlug" | "lessonSlug">): string {
  const base = item.section === "betting_academy" ? "/betting-academy" : "/sports-university";
  return `${base}/${item.categorySlug}/${item.courseSlug}/${item.lessonSlug}`;
}

export const metadata: Metadata = { title: "Continue Learning — Dashboard — PunterStat" };

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function ContinueLearningPage() {
  const profile = await requireAuth();
  const [inProgress, completed] = await Promise.all([
    getInProgressLessons(profile.userId),
    getCompletedLessons(profile.userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Continue Learning</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Pick up where you left off or browse your completed lessons.
        </p>
      </div>

      {/* In Progress */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold text-[#0f172a]">In Progress</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {inProgress.length}
          </span>
        </div>

        {inProgress.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nothing in progress"
            description="Start a lesson from Sports University or Betting Academy to see it here."
            actionLabel="Browse courses"
            actionHref="/sports-university"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {inProgress.map((item) => (
              <div
                key={item.progressId}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <p className="mb-0.5 text-xs font-medium text-[#1e293b]/50">{item.courseTitle}</p>
                <p className="mb-3 font-semibold text-[#0f172a]">{item.lessonTitle}</p>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#1e293b]/50">Progress</span>
                  <span className="font-semibold text-teal-600">{item.progressPct}%</span>
                </div>
                <ProgressBar pct={item.progressPct} />
                <Link
                  href={lessonUrl(item)}
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Continue →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h2 className="font-semibold text-[#0f172a]">Completed</h2>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {completed.length}
          </span>
        </div>

        {completed.length === 0 ? (
          <p className="text-sm text-[#1e293b]/50">No completed lessons yet.</p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {completed.map((item) => (
              <div key={item.progressId} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0f172a]">{item.lessonTitle}</p>
                    <p className="text-xs text-[#1e293b]/50">{item.courseTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {item.completedAt && (
                    <span className="hidden text-xs text-[#1e293b]/40 sm:block">
                      {new Date(item.completedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  <Link
                    href={lessonUrl(item)}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
