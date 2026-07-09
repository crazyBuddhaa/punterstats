"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ToggleLeft,
  ChevronRight,
  HeartPulse,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses & Lessons", icon: BookOpen },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  { href: "/admin/flags", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/data-health", label: "Data Health", icon: HeartPulse },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-violet-50 font-semibold text-violet-700"
                : "font-medium text-[#1e293b]/70 hover:bg-slate-50 hover:text-[#0f172a]"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-violet-600" : "text-[#1e293b]/40"}`} />
              {label}
            </span>
            {active && <ChevronRight className="h-3.5 w-3.5 text-violet-400" />}
          </Link>
        );
      })}
    </nav>
  );
}
