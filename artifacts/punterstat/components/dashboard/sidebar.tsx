"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  BookMarked,
  FlaskConical,
  BarChart2,
  TrendingUp,
  Target,
  Zap,
  User,
  CreditCard,
  Bell,
  ChevronRight,
  NotebookPen,
  ClipboardCheck,
  GraduationCap,
  Library,
  Calculator,
  Database,
  Globe,
  Sliders,
  Lock,
} from "lucide-react";
import type { SubscriptionTier } from "@/lib/auth/access";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  admin: 99,
};

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  requiredPlan?: "pro" | "premium";
  badge?: number;
}

const assistItems: SidebarItem[] = [
  { href: "/dashboard/bet-tracker", label: "Bet Tracker", icon: NotebookPen },
  { href: "/dashboard/report-card", label: "Report Card", icon: ClipboardCheck },
  { href: "/bet-assist/slip-checker", label: "Slip Checker", icon: ClipboardCheck },
  { href: "/bet-assist/calculators", label: "Calculators", icon: Calculator },
  { href: "/stats", label: "Stats Centre", icon: Database },
  { href: "/match-breakdown/analyzer", label: "Match Breakdown", icon: Sliders, requiredPlan: "pro" },
  { href: "/dashboard/match-analyses", label: "Saved Analyses", icon: BarChart2, requiredPlan: "pro" },
  { href: "/dashboard/spot-the-value", label: "Spot The Value", icon: Zap, requiredPlan: "pro" },
  { href: "/simulation-engine", label: "Simulation Engine", icon: FlaskConical },
  { href: "/dashboard/simulation-history", label: "Simulation History", icon: FlaskConical, requiredPlan: "pro" },
  { href: "/dashboard/calibration", label: "Calibration", icon: Target, requiredPlan: "premium" },
];

const topItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/continue-learning", label: "Continue Learning", icon: BookOpen },
  { href: "/sports-university", label: "Sports University", icon: GraduationCap },
  { href: "/betting-academy", label: "Betting Academy", icon: Library },
  { href: "/league-glossary", label: "League Glossary", icon: Globe },
  { href: "/betting-academy/option-glossary", label: "Option Glossary", icon: BookMarked },
  { href: "/dashboard/bookmarks", label: "Saved Lessons", icon: Bookmark },
  { href: "/dashboard/progress", label: "Learning Progress", icon: TrendingUp },
];

const bottomItems: SidebarItem[] = [
  { href: "/dashboard/profile", label: "Profile Settings", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

interface DashboardSidebarProps {
  unreadCount?: number;
  userTier?: SubscriptionTier;
}

function isLocked(requiredPlan: "pro" | "premium" | undefined, userTier: SubscriptionTier): boolean {
  if (!requiredPlan) return false;
  return TIER_RANK[userTier] < TIER_RANK[requiredPlan];
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact = false,
  badge,
  lockedPlan,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
  lockedPlan?: "pro" | "premium" | null;
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
      <span className="flex items-center gap-2.5 min-w-0">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : lockedPlan ? (
        <span
          className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0 ${
            lockedPlan === "premium"
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "bg-[#3D2DFF]/10 text-[#3D2DFF] border border-[#3D2DFF]/20"
          }`}
        >
          <Lock className="h-2.5 w-2.5" />
          {lockedPlan}
        </span>
      ) : active ? (
        <ChevronRight className="h-3.5 w-3.5 opacity-30 shrink-0" />
      ) : null}
    </Link>
  );
}

export function DashboardSidebar({
  unreadCount = 0,
  userTier = "free",
}: DashboardSidebarProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
        Learning
      </p>
      {topItems.map(({ href, label, icon, exact, requiredPlan }) => (
        <NavItem
          key={href}
          href={href}
          label={label}
          icon={icon}
          exact={exact}
          lockedPlan={isLocked(requiredPlan, userTier) ? requiredPlan : null}
        />
      ))}

      <div className="my-3 border-t border-border" />

      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
        Analysis &amp; Assist
      </p>
      {assistItems.map(({ href, label, icon, requiredPlan }) => (
        <NavItem
          key={href}
          href={href}
          label={label}
          icon={icon}
          lockedPlan={isLocked(requiredPlan, userTier) ? requiredPlan : null}
        />
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
export function DashboardMobileNav({
  unreadCount = 0,
  userTier = "free",
}: DashboardSidebarProps) {
  const allItems = [
    ...topItems,
    ...assistItems,
    ...bottomItems.map((item) => ({
      ...item,
      badge: item.href === "/dashboard/notifications" ? unreadCount : undefined,
    })),
  ];

  return <MobileNavInner items={allItems} userTier={userTier} />;
}

function MobileNavInner({
  items,
  userTier,
}: {
  items: SidebarItem[];
  userTier: SubscriptionTier;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 py-2">
      {items.map(({ href, label, icon: Icon, exact, badge, requiredPlan }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const locked = isLocked(requiredPlan, userTier);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap relative ${
              active
                ? "bg-[#3D2DFF]/10 text-[#3D2DFF] font-semibold"
                : "text-[#1e293b]/55"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
            {locked && <Lock className="h-3 w-3 opacity-60" />}
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
