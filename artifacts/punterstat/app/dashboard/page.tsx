import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  FlaskConical,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Bell,
} from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getDashboardStats, getInProgressLessons, getSimulationSessions } from "@/lib/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const profile = await requireAuth();
  const [stats, inProgress, simSessions] = await Promise.all([
    getDashboardStats(profile.userId),
    getInProgressLessons(profile.userId),
    getSimulationSessions(profile.userId),
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {greeting}, {profile.displayName?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Here&apos;s a snapshot of your learning journey on PunterStat.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lessons Completed"
          value={stats.lessonsCompleted}
          icon={BookOpen}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          label="Saved Lessons"
          value={stats.bookmarksCount}
          icon={Bookmark}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Simulation Sessions"
          value={stats.simSessionsCount}
          icon={FlaskConical}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          label="Match Analyses"
          value={stats.matchAnalysesCount}
          icon={BarChart2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {stats.unreadNotifications > 0 && (
        <Link
          href="/dashboard/notifications"
          className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm text-teal-800 transition hover:bg-teal-100"
        >
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            You have{" "}
            <strong>{stats.unreadNotifications}</strong> unread notification
            {stats.unreadNotifications !== 1 ? "s" : ""}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continue learning */}
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-[#0f172a]">Continue Learning</span>
            </div>
            <Link
              href="/dashboard/continue-learning"
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {inProgress.slice(0, 4).map((item) => (
              <div key={item.progressId} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0f172a]">
                      {item.lessonTitle}
                    </p>
                    <p className="text-xs text-[#1e293b]/50">{item.courseTitle}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-teal-600">
                    {item.progressPct}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${item.progressPct}%` }}
                  />
                </div>
              </div>
            ))}
            {inProgress.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#1e293b]/50">
                No lessons in progress yet.{" "}
                <Link href="/sports-university" className="text-teal-600 hover:underline">
                  Start learning →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent simulations */}
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-violet-600" />
              <span className="font-semibold text-[#0f172a]">Recent Simulations</span>
            </div>
            <Link
              href="/dashboard/simulation-history"
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {simSessions.slice(0, 4).map((s) => {
              const pl = s.virtualBalance - s.startingBalance;
              const positive = pl >= 0;
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium capitalize text-[#0f172a]">
                      {s.type} simulator
                    </p>
                    <p className="text-xs text-[#1e293b]/50">
                      {s.totalBets} bet{s.totalBets !== 1 ? "s" : ""} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        positive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {pl.toFixed(0)} ₦
                    </p>
                    <p className="text-xs text-[#1e293b]/50">ROI {s.roi}%</p>
                  </div>
                </div>
              );
            })}
            {simSessions.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#1e293b]/50">
                No simulations yet.{" "}
                <Link href="/simulation-engine" className="text-teal-600 hover:underline">
                  Try the simulator →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
          Quick Access
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/sports-university", label: "Sports University", icon: BookOpen, desc: "Courses & lessons" },
            { href: "/betting-academy", label: "Betting Academy", icon: TrendingUp, desc: "Literacy modules" },
            { href: "/simulation-engine", label: "Simulation Engine", icon: FlaskConical, desc: "Practice & explore" },
            { href: "/match-breakdown", label: "Match Breakdown", icon: BarChart2, desc: "Probability analyzer" },
            { href: "/dashboard/progress", label: "Learning Progress", icon: TrendingUp, desc: "Your course progress" },
            { href: "/dashboard/bookmarks", label: "Saved Lessons", icon: Bookmark, desc: "Your saved content" },
          ].map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition hover:shadow-sm hover:border-teal-200"
            >
              <div className="rounded-lg bg-slate-100 p-2">
                <Icon className="h-4 w-4 text-[#1e293b]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{label}</p>
                <p className="text-xs text-[#1e293b]/50">{desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-[#1e293b]/30" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
