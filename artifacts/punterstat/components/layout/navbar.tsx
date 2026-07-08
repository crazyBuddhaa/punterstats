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

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.displayName
    ? (user.displayName.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?")
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D2DFF]">
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
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <header className="sticky top-0 z-50 w-screen border-b border-white/10 bg-[#0f172a]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Image src="/logo.png" alt="PunterStat" width={32} height={32} className="rounded-lg" />
          <span className="text-lg tracking-tight">PunterStat</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none">
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-[#0f172a] border-white/10">
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
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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
              <Button size="sm" asChild>
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
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/10 bg-[#0f172a] transition-all duration-200 lg:hidden",
          mobileOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label}>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
                    onClick={() => setGlossaryOpen((o) => !o)}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        glossaryOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      glossaryOpen ? "max-h-40" : "max-h-0"
                    )}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md py-2 pl-7 pr-3 text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white"
                        onClick={() => { setMobileOpen(false); setGlossaryOpen(false); }}
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
                className="rounded-md px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
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
                <Button size="sm" asChild className="justify-center">
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
