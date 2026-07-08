import { requireAdmin } from "@/lib/auth/helpers";
import { getAdminStats } from "@/lib/admin/queries";
import {
  Users,
  BookOpen,
  FileText,
  Activity,
  Eye,
  EyeOff,
  CreditCard,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
  accent?: string;
}

function StatCard({ label, value, sub, icon, href, accent = "bg-violet-50 text-violet-600" }: StatCardProps) {
  const inner = (
    <div className="flex items-start justify-between rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-[#1e293b]/60">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[#0f172a]">{value}</p>
        {sub && <p className="mt-1 text-xs text-[#1e293b]/50">{sub}</p>}
      </div>
      <div className={`rounded-xl p-2.5 ${accent}`}>{icon}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  const planColors: Record<string, string> = {
    free: "bg-slate-100 text-slate-600",
    premium: "bg-amber-50 text-amber-700",
    pro: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Admin Overview</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">Platform-wide snapshot</p>
      </div>

      {/* Users & sims */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          href="/admin/users"
          accent="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Sim Sessions"
          value={stats.totalSimSessions}
          icon={<Activity className="h-5 w-5" />}
          accent="bg-teal-50 text-teal-600"
        />
        <StatCard
          label="Published Courses"
          value={`${stats.publishedCourses} / ${stats.totalCourses}`}
          icon={<BookOpen className="h-5 w-5" />}
          href="/admin/courses"
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Published Lessons"
          value={`${stats.publishedLessons} / ${stats.totalLessons}`}
          icon={<Zap className="h-5 w-5" />}
          accent="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Blog & subscriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Blog */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a]">Blog Posts</h2>
            <Link
              href="/admin/blog"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              Manage →
            </Link>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2">
                <Eye className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-[#0f172a]">
                  {stats.publishedBlogPosts}
                </p>
                <p className="text-xs text-[#1e293b]/50">Published</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-2">
                <EyeOff className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-[#0f172a]">
                  {stats.totalBlogPosts - stats.publishedBlogPosts}
                </p>
                <p className="text-xs text-[#1e293b]/50">Drafts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-2">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-[#0f172a]">{stats.totalBlogPosts}</p>
                <p className="text-xs text-[#1e293b]/50">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0f172a]">Subscriptions by Plan</h2>
            <CreditCard className="h-4 w-4 text-[#1e293b]/30" />
          </div>
          {stats.subscriptionBreakdown.length === 0 ? (
            <p className="text-sm text-[#1e293b]/50">No subscription data.</p>
          ) : (
            <div className="space-y-3">
              {stats.subscriptionBreakdown
                .sort((a, b) => b.count - a.count)
                .map(({ plan, count }) => {
                  const total = stats.totalUsers || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={plan}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${planColors[plan] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {plan}
                        </span>
                        <span className="font-semibold tabular-nums text-[#0f172a]">
                          {count} <span className="font-normal text-[#1e293b]/40">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${plan === "free" ? "bg-slate-400" : plan === "premium" ? "bg-amber-400" : "bg-violet-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#0f172a]">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/blog/new", label: "New Blog Post", color: "bg-violet-600 text-white hover:bg-violet-700" },
            { href: "/admin/courses", label: "Manage Courses", color: "bg-blue-600 text-white hover:bg-blue-700" },
            { href: "/admin/users", label: "View Users", color: "bg-teal-600 text-white hover:bg-teal-700" },
            { href: "/admin/flags", label: "Feature Flags", color: "bg-slate-700 text-white hover:bg-slate-800" },
          ].map(({ href, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${color}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
