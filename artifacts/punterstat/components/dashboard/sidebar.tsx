"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  FlaskConical,
  BarChart2,
  TrendingUp,
  User,
  CreditCard,
  Bell,
  ChevronRight,
} from "lucide-react";

const topItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/continue-learning", label: "Continue Learning", icon: BookOpen },
  { href: "/dashboard/bookmarks", label: "Saved Lessons", icon: Bookmark },
  { href: "/dashboard/simulation-history", label: "Simulation History", icon: FlaskConical },
  { href: "/dashboard/match-analyses", label: "Match Analyses", icon: BarChart2 },
  { href: "/dashboard/progress", label: "Learning Progress", icon: TrendingUp },
];

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile Settings", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

interface DashboardSidebarProps {
  unreadCount?: number;
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact = false,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-teal-50 text-teal-700 font-semibold"
          : "text-[#1e293b]/70 hover:bg-slate-100 hover:text-[#0f172a]"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : active ? (
        <ChevronRight className="h-3.5 w-3.5 opacity-30" />
      ) : null}
    </Link>
  );
}

export function DashboardSidebar({ unreadCount = 0 }: DashboardSidebarProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
        Learning
      </p>
      {topItems.map(({ href, label, icon, exact }) => (
        <NavItem key={href} href={href} label={label} icon={icon} exact={exact} />
      ))}

      <div className="my-3 border-t border-border" />

      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
        Account
      </p>
      {bottomItems.map(({ href, label, icon }) => (
        <NavItem
          key={href}
          href={href}
          label={label}
          icon={icon}
          badge={href === "/dashboard/notifications" ? unreadCount : undefined}
        />
      ))}
    </nav>
  );
}

/** Compact horizontal scrollable tab bar for mobile */
export function DashboardMobileNav({ unreadCount = 0 }: DashboardSidebarProps) {
  const allItems = [
    ...topItems,
    ...bottomItems.map((item) => ({
      ...item,
      badge: item.href === "/dashboard/notifications" ? unreadCount : undefined,
    })),
  ];

  return <MobileNavInner items={allItems} />;
}

function MobileNavInner({
  items,
}: {
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
    badge?: number;
  }>;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 py-2">
      {items.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap relative ${
              active
                ? "bg-[#3D2DFF]/10 text-[#3D2DFF]"
                : "text-[#1e293b]/60 hover:bg-slate-100 hover:text-[#0f172a]"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
            {badge && badge > 0 ? (
              <span className="ml-0.5 rounded-full bg-[#3D2DFF] px-1 py-px text-[9px] font-bold leading-none text-white">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
