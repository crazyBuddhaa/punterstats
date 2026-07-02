import Link from "next/link";
import { ArrowRight, BookOpen, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0f172a] pb-24 pt-20 sm:pb-32 sm:pt-28",
        className
      )}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(to right, #0d9488 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Teal glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#0d9488] opacity-[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Pill badge */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-[#0d9488]/30 bg-[#0d9488]/10 px-4 py-1.5 text-sm font-medium text-[#0d9488]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0d9488]" />
            Sports Intelligence Platform
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Understand Sports.{" "}
          <span className="text-[#0d9488]">Master Probability.</span>
          <br />
          Make Better Decisions.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-white/60">
          PunterStat is the education platform for sports thinkers. We teach the
          mathematics of probability, how sports systems work, and how to read a
          match — analytically, not emotionally.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="/register">
              Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/sports-university">Explore Courses</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: BookOpen, label: "Sports University" },
            { icon: Brain, label: "Betting Literacy Academy" },
            { icon: BarChart3, label: "Probability Simulation" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
            >
              <Icon className="h-3.5 w-3.5 text-[#0d9488]" />
              {label}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-12 text-center text-xs text-white/25">
          Educational platform only. No real-money transactions. No betting tips.
          Knowledge Before Decision.
        </p>
      </div>
    </section>
  );
}
