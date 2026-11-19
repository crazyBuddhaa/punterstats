"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
import { PILLARS } from "@/lib/bet-assist/pillars";

type NavChild = { href: string; label: string; description?: string };
type NavLink =
  | { href: string; label: string; children?: undefined }
  | { href?: undefined; label: string; children: NavChild[] };

// Three pillars (Bet Analysis / Bet Learning / Bet Assist) — see lib/bet-assist/pillars.ts
const navLinks: NavLink[] = [
  ...PILLARS.map((p) => ({
    label: p.label,
    children: [{ href: p.href, label: `All ${p.label}`, description: p.tagline }, ...p.links],
  })),
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.displayName
    ? (user.displayName.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?")
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
          <Avatar className="h-8 w-8 border border-slate-200">
            <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.displayName ?? "User"} />
            <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex cursor-pointer items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo — points to dashboard when authenticated, landing page otherwise */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          prefetch={false}
          className="flex items-center gap-2.5 font-bold text-slate-900"
        >
          <Image src="/logo.png" alt="PunterStat" width={30} height={30} className="rounded-lg" />
          <span className="text-lg tracking-tight">PunterStat</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none">
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                  >
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          href={child.href}
                          prefetch={false}
                          className="flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-50 focus:bg-slate-50"
                        >
                          <span className="text-sm font-semibold text-slate-900">{child.label}</span>
                          {child.description && (
                            <span className="text-xs leading-snug text-slate-500">{child.description}</span>
                          )}
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
                prefetch={false}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / User menu */}
        <div className="hidden items-center gap-2 lg:flex">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
          ) : isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                asChild
              >
                <Link href="/dashboard" prefetch={false}>Dashboard</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                asChild
              >
                <Link href="/login" prefetch={false}>Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                asChild
              >
                <Link href="/register" prefetch={false}>Start free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
          )}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-slate-200/80 bg-white transition-all duration-200 lg:hidden",
          mobileOpen ? "max-h-[calc(100vh-4rem)] overflow-y-auto" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label}>
                  <button
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    onClick={() => setOpenGroup((g) => (g === link.label ? null : link.label))}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                        openGroup === link.label && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      openGroup === link.label ? "max-h-96" : "max-h-0"
                    )}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch={false}
                        className="block rounded-lg py-2 pl-7 pr-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
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
                prefetch={false}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center border-slate-300 text-slate-900 hover:bg-slate-100"
                  asChild
                >
                  <Link href="/dashboard" prefetch={false} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
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
                  className="justify-center border-slate-300 text-slate-900 hover:bg-slate-100"
                  asChild
                >
                  <Link href="/login" prefetch={false} onClick={() => setMobileOpen(false)}>Sign in</Link>
                </Button>
                <Button size="sm" asChild className="justify-center bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/register" prefetch={false} onClick={() => setMobileOpen(false)}>Start free</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
