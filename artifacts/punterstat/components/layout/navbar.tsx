"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/sports-university", label: "Sports University" },
  { href: "/betting-academy", label: "Betting Academy" },
  { href: "/simulation", label: "Simulation" },
  { href: "/match-analysis", label: "Match Analysis" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[#0f172a]">
          <Image
            src="/logo.png"
            alt="PunterStat"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg tracking-tight">PunterStat</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#1e293b]/70 transition-colors hover:bg-[#0f172a]/5 hover:text-[#0f172a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-[#0f172a] hover:bg-[#0f172a]/5 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/50 bg-white transition-all duration-200 lg:hidden",
          mobileOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#1e293b]/70 hover:bg-[#0f172a]/5 hover:text-[#0f172a]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-3">
            <Button variant="outline" size="sm" asChild className="justify-center">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="justify-center">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
