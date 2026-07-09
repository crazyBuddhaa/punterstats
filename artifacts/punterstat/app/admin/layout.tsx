import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/helpers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOut } from "@/lib/auth/actions";
import { Shield, LogOut, ExternalLink } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-[#0f172a]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="PunterStat" width={26} height={26} className="rounded-md" />
              <span className="text-sm font-bold text-white tracking-tight">PunterStat</span>
            </Link>
            <div className="hidden items-center gap-1.5 rounded-full bg-violet-600/20 px-2.5 py-0.5 sm:flex">
              <Shield className="h-3 w-3 text-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-300">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 text-sm text-white/50 transition hover:text-white sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Dashboard
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-1 py-1">
              <span className="text-xs font-semibold text-white/80">
                {profile.displayName ?? "Admin"}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                {(profile.displayName ?? "A").slice(0, 1).toUpperCase()}
              </div>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-0 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
              <Shield className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold text-[#0f172a]">Admin Panel</span>
            </div>
            <AdminSidebar />
          </div>
        </aside>

        {/* Mobile nav strip */}
        <div className="mb-4 w-full lg:hidden">
          <div className="overflow-x-auto rounded-xl border border-border bg-white p-2 shadow-sm">
            <div className="flex gap-1 min-w-max">
              {[
                { href: "/admin", label: "Overview" },
                { href: "/admin/users", label: "Users" },
                { href: "/admin/courses", label: "Courses" },
                { href: "/admin/blog", label: "Blog" },
                { href: "/admin/flags", label: "Flags" },
                { href: "/admin/data-health", label: "Data Health" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#1e293b]/70 hover:bg-slate-50 hover:text-[#0f172a] whitespace-nowrap"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
