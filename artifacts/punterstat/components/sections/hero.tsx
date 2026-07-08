"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Brain,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
  isAuthenticated?: boolean;
}

const pills = [
  { icon: BookOpen, label: "Sports University" },
  { icon: Brain, label: "Betting Academy" },
  { icon: BarChart3, label: "Simulation Engine" },
  { icon: Search, label: "Match Breakdown" },
  { icon: TrendingUp, label: "Spot The Value" },
];

export function Hero({ className, isAuthenticated = false }: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0f172a] pb-0 pt-14 sm:pt-20",
        className
      )}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#3D2DFF 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Top glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[#3D2DFF] opacity-[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="pb-14 pt-4 lg:pb-24"
          >
            {/* Badge */}
            <div className="mb-7">
              <Badge
                variant="outline"
                className="gap-2 border-[#3D2DFF]/40 bg-[#3D2DFF]/10 px-4 py-1.5 text-sm font-semibold text-[#3D2DFF]"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3D2DFF]" />
                Sports Intelligence &amp; Education Platform
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-[3.6rem]">
              Think Analytically.
              <br />
              <span className="text-[#3D2DFF]">Bet Responsibly.</span>
            </h1>

            <p className="mt-6 max-w-[500px] text-base leading-relaxed text-white/55 sm:text-lg">
              PunterStat is a complete sports intelligence platform built on 33 seasons of real data — 5 top European leagues, 20 bookmakers per match. Structured courses, probability tools, and the mathematics behind every decision.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="gap-2 bg-[#3D2DFF] px-8 text-[15px] font-semibold hover:bg-[#3D2DFF]/90"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Go to Dashboard" : "Start Learning Free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 bg-white/[0.04] text-[15px] text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/pricing">See what&apos;s included</Link>
              </Button>
            </div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-11 flex flex-wrap gap-2"
            >
              {pills.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/55 backdrop-blur-sm"
                >
                  <Icon className="h-3 w-3 text-[#3D2DFF]" />
                  {label}
                </div>
              ))}
            </motion.div>

            <p className="mt-8 text-[11px] text-white/20">
              Educational platform only — no real-money transactions, no betting tips.&nbsp;&nbsp;Knowledge Before Decision.
            </p>
          </motion.div>

          {/* ── Right: Hero image ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
            className="relative hidden lg:flex lg:items-end lg:self-end"
          >
            <div className="relative w-full overflow-hidden rounded-t-3xl shadow-[0_-8px_80px_rgba(61,45,255,0.18)]">
              <Image
                src="/hero-visual.jpg"
                alt="PunterStat analytics interface"
                width={720}
                height={520}
                className="w-full object-cover object-top"
                priority
              />
              {/* Bottom fade into page bg */}
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0f172a] to-transparent" />
              {/* Logo badge overlay */}
              <div className="absolute left-5 top-5">
                <Image
                  src="/logo.png"
                  alt="PunterStat"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>

            {/* Floating stat — bottom-left */}
            <div className="absolute -left-6 bottom-10 rounded-2xl border border-white/[0.08] bg-[#1e293b]/80 px-4 py-3 shadow-2xl backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Closing-Line Edge</p>
              <p className="mt-0.5 text-2xl font-bold text-white">+4.2%</p>
              <p className="mt-0.5 text-xs text-[#3D2DFF]">tracked across 500+ simulations</p>
            </div>

            {/* Floating pill — top-right */}
            <div className="absolute -right-3 top-6 flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#1e293b]/80 px-4 py-2 shadow-2xl backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-white/65">180,000+ historical matches</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
