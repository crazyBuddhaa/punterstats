"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { signOut } from "@/lib/auth/actions";

type NavChild = { href: string; label: string };
type NavLink =
  | { href: string; label: string; children?: undefined }
  | { href?: undefined; label: string; children: NavChild[] };

const navLinks: NavLink[] = [
  { href: "/sports-university", label: "Sports University" },
  { href: "/betting-academy", label: "Betting Academy" },
  { href: "/simulation-engine", label: "Simulation" },
  { href: "/match-breakdown", label: "Match Analysis" },
  { href: "/spot-the-value", label: "Spot The Value" },
  {
    label: "Stats",
    children: [
      { href: "/stats/results", label: "Results Browser" },
      { href: "/stats/head-to-head", label: "Head-to-Head" },
    ],
  },
  {
    label: "Glossary",
    children: [
      { href: "/league-glossary", label: "League Glossary" },
      { href: "/betting-academy/option-glossary", label: "Option Glossary" },
    ],
  },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.displayName
    ? (user.displayName.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?")
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.displayName ?? "User"} />
            <AvatarFallback className="bg-[#3D2DFF]/20 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
          onSelect={async () => { await signOut(); }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which collapsible group is open in the mobile menu (one at a time)
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname() ?? "";
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-brand-ink/90 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-ink/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo — points to dashboard when authenticated, landing page otherwise */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex shrink-0 items-center gap-2.5 font-bold text-white"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={30}
            height={30}
            unoptimized
            className="rounded-lg shadow-[0_4px_14px_-4px_rgba(61,45,255,0.8)]"
          />
          <span className="text-[17px] tracking-tight">PunterStat</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none xl:px-3 xl:text-sm",
                        link.children.some((c) => isActive(pathname, c.href))
                          ? "text-white"
                          : "text-slate-400"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 border-white/10 bg-brand-ink">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          href={child.href}
                          className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white focus:text-white"
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/[0.06] hover:text-white xl:px-3 xl:text-sm",
                  isActive(pathname, link.href)
                    ? "text-white after:absolute after:inset-x-2.5 after:-bottom-[15px] after:h-0.5 after:rounded-full after:bg-brand-blue xl:after:inset-x-3"
                    : "text-slate-400"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / User menu */}
        <div className="hidden items-center gap-2 lg:flex">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-brand-blue text-white shadow-[0_6px_20px_-6px_rgba(61,45,255,0.9)] hover:bg-brand-blue/90"
              >
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.06] bg-brand-ink transition-all duration-200 lg:hidden",
          mobileOpen ? "max-h-[calc(100vh-4rem)] overflow-y-auto" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label}>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
                    onClick={() =>
                      setOpenGroup((g) => (g === link.label ? null : link.label))
                    }
                    aria-expanded={openGroup === link.label}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        openGroup === link.label && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      openGroup === link.label ? "max-h-40" : "max-h-0"
                    )}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md py-2 pl-7 pr-3 text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white"
                        onClick={() => { setMobileOpen(false); setOpenGroup(null); }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white",
                  isActive(pathname, link.href)
                    ? "bg-white/[0.06] text-white"
                    : "text-white/60"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center border-white/20 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-center text-red-400 hover:bg-white/10 hover:text-red-300"
                  onClick={async () => { setMobileOpen(false); await signOut(); }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center border-white/20 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                </Button>
                <Button size="sm" asChild className="justify-center bg-brand-blue text-white hover:bg-brand-blue/90">
                  <Link href="/register" onClick={() => setMobileOpen(false)}>Get started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
