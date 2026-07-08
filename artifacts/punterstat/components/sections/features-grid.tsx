"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Search,
  TrendingUp,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "university",
    icon: GraduationCap,
    title: "Sports University",
    subtitle: "Football · Basketball · Tennis",
    description:
      "Structured courses covering how sports work — tactics, systems, formations, and historical patterns. Learn how to read a game before you read a market.",
    image: "/feature-university.jpg",
    large: true,
    accent: false,
  },
  {
    id: "academy",
    icon: BookOpen,
    title: "Betting Academy",
    subtitle: "232 lessons across 8 courses",
    description:
      "The full mathematics of odds, expected value, variance, Kelly criterion, and de-vigging. Understand what the numbers actually mean.",
    image: null,
    large: false,
    accent: true,
  },
  {
    id: "simulation",
    icon: BarChart3,
    title: "Simulation Engine",
    subtitle: "Monte Carlo · Risk modelling",
    description:
      "Run thousands of simulated bet sequences. Explore bankroll distributions, see the long-run impact of edge, and stress-test staking strategies — risk-free.",
    image: "/feature-simulation.jpg",
    large: false,
    accent: false,
  },
  {
    id: "breakdown",
    icon: Search,
    title: "Match Breakdown",
    subtitle: "Dixon-Coles Poisson model",
    description:
      "A multi-factor analytical engine: weighted form, H2H patterns, injury impact, and home advantage — combined into calibrated win/draw/loss probabilities.",
    image: "/feature-breakdown.jpg",
    large: false,
    accent: false,
  },
  {
    id: "value",
    icon: TrendingUp,
    title: "Spot The Value",
    subtitle: "Live odds · De-vig analysis",
    description:
      "Pulls live odds, strips the overround, and flags markets where the offered price diverges from the model's fair probability. The closing-line edge, made visible.",
    image: "/feature-value.jpg",
    large: false,
    accent: false,
  },
  {
    id: "dataset",
    icon: Database,
    title: "Historical Dataset",
    subtitle: "1993/94 – 2025/26",
    description:
      "33 seasons of match results and bookmaker odds across 5 top European leagues and the EFL — up to 20 bookmakers per match, with calibrated model probabilities. The same data that powers every PunterStat tool.",
    image: "/feature-dataset.jpg",
    large: true,
    accent: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface FeaturesGridProps {
  className?: string;
}

export function FeaturesGrid({ className }: FeaturesGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const topRow = features.filter((f) => f.id === "university" || f.id === "academy");
  const midRow = features.filter((f) =>
    ["simulation", "breakdown", "value"].includes(f.id)
  );
  const bottomRow = features.filter((f) => f.id === "dataset");

  return (
    <section className={cn("bg-[#f8fafc] py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            What We&apos;ve Built
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            A complete sports intelligence platform
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#1e293b]/55 sm:text-lg">
            Six interconnected modules — each powered by real historical data and
            built to develop analytical thinking, not guesswork.
          </p>
        </div>

        {/* Bento grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="space-y-4"
        >
          {/* Row 1: University (2/3 wide) + Academy (1/3 wide) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* University — spans 2 cols */}
            <motion.div
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl border border-[#0f172a]/[0.07] bg-white shadow-sm transition-shadow hover:shadow-lg md:col-span-2"
            >
              {/* Image header */}
              <div className="relative h-52 w-full overflow-hidden sm:h-60">
                <Image
                  src="/feature-university.jpg"
                  alt="Sports University"
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
              </div>
              <div className="p-6 pt-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D2DFF]/8 text-[#3D2DFF]">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f172a]">Sports University</h3>
                    <p className="text-xs text-[#1e293b]/45">Football · Basketball · Tennis · Table Tennis</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#1e293b]/60">
                  Structured courses covering how sports work — tactics, systems, formations, and historical patterns across four sports. Learn how to read a game before you read a market. Progress tracking, bookmarks, and adaptive learning paths included.
                </p>
              </div>
            </motion.div>

            {/* Academy — spans 1 col, accent */}
            <motion.div
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl border border-[#3D2DFF]/25 bg-[#3D2DFF]/[0.04] shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D2DFF] text-white shadow-lg shadow-[#3D2DFF]/30">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a]">Betting Literacy Academy</h3>
                  <p className="mt-1 text-xs font-medium text-[#3D2DFF]">232 lessons · 8 courses</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#1e293b]/60">
                    The full mathematics of betting — odds, expected value, variance, Kelly criterion, bankroll management, psychology, and statistical thinking. From beginner to expert, in structured order.
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  {[
                    "Odds & Markets",
                    "Probability & Value",
                    "Bet Types",
                    "Bankroll Management",
                    "Psychology",
                    "Statistical Thinking",
                  ].map((course) => (
                    <div
                      key={course}
                      className="flex items-center gap-2 text-xs text-[#1e293b]/60"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3D2DFF]" />
                      {course}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Simulation + Breakdown + Value (3 equal) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {midRow.map((feature) => (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className="group overflow-hidden rounded-2xl border border-[#0f172a]/[0.07] bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                {feature.image && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
                  </div>
                )}
                <div className="p-5 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f172a]/[0.05] text-[#3D2DFF]">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a]">{feature.title}</h3>
                      <p className="text-[10px] text-[#1e293b]/40">{feature.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#1e293b]/60">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 3: Historical Dataset — full width */}
          <motion.div
            variants={cardVariants}
            className="group overflow-hidden rounded-2xl border border-[#0f172a]/[0.07] bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="grid gap-0 md:grid-cols-2">
              {/* Image side */}
              <div className="relative h-56 overflow-hidden md:h-auto md:min-h-[280px]">
                <Image
                  src="/feature-dataset.jpg"
                  alt="Historical Dataset"
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white md:bg-gradient-to-r md:from-transparent md:to-white" />
              </div>
              {/* Text side */}
              <div className="flex flex-col justify-center p-8">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a]/[0.05] text-[#3D2DFF]">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">Historical Dataset</h3>
                <p className="mt-1 text-xs font-semibold text-[#3D2DFF]">1993/94 – 2025/26 · football-data.co.uk source</p>
                <p className="mt-3 text-sm leading-relaxed text-[#1e293b]/60">
                  33 seasons of match results and bookmaker odds across the top-5 European leagues and the EFL — up to 20 bookmakers per match, with calibrated model probabilities and ELO ratings. The same dataset that powers every PunterStat tool.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { value: "33", label: "Seasons" },
                    { value: "20", label: "Bookmakers" },
                    { value: "5+", label: "Leagues" },
                    { value: "180k+", label: "Matches" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-extrabold text-[#0f172a]">{s.value}</p>
                      <p className="text-xs text-[#1e293b]/50">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
