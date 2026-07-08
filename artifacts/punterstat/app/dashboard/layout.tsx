// Dashboard reads the user session on every request — must never be cached.
export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth/helpers";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/sidebar";
import { signOut } from "@/lib/auth/actions";
import { LayoutDashboard, LogOut, ExternalLink } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();
  const stats = await getDashboardStats(profile.userId);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#0f172a]">
            <Image src="/logo.png" alt="PunterStat" width={28} height={28} className="rounded-md" />
            <span className="text-base tracking-tight">PunterStat</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-[#1e293b]/60 transition hover:text-[#0f172a] sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Back to site
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
              title={profile.displayName ?? "Profile"}
            >
              {(profile.displayName ?? "U").slice(0, 1).toUpperCase()}
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-[#1e293b]/50 transition hover:bg-slate-100 hover:text-[#0f172a]"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile nav strip — horizontal scroll above content */}
      <div className="sticky top-14 z-30 border-b border-border bg-white lg:hidden">
        <div className="mx-auto max-w-7xl overflow-x-auto scrollbar-hide px-4 sm:px-6">
          <DashboardMobileNav unreadCount={stats.unreadNotifications} />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
              <LayoutDashboard className="h-4 w-4 text-[#3D2DFF]" />
              <span className="text-sm font-semibold text-[#0f172a]">Dashboard</span>
            </div>
            <DashboardSidebar unreadCount={stats.unreadNotifications} />
          </div>
        </aside>

        {/* Main content — full width on mobile, flex-1 on desktop */}
        <main className="min-w-0 w-full lg:flex-1">{children}</main>
      </div>
    </div>
  );
}
