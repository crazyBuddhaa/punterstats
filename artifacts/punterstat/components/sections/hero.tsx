import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
  isAuthenticated?: boolean;
}

export function Hero({ className, isAuthenticated = false }: HeroProps) {
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
            "linear-gradient(#3D2DFF 1px, transparent 1px), linear-gradient(to right, #3D2DFF 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#3D2DFF] opacity-[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Pill badge */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-[#3D2DFF]/30 bg-[#3D2DFF]/10 px-4 py-1.5 text-sm font-medium text-[#3D2DFF]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3D2DFF]" />
            Bet Analysis · Bet Learning · Bet Assist
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Analyse the Match.{" "}
          <span className="text-[#3D2DFF]">Learn the Maths.</span>
          <br />
          Bet Smarter.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-white/60">
          PunterStat is your data-driven betting companion. Break down fixtures
          with model probabilities, learn how odds and value really work, and use
          smart tools to pick, price, stake and track every bet.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="gap-2 px-8 bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/bet-assist/picks">See today&apos;s picks</Link>
          </Button>
        </div>

        {/* Pillar pills */}
        <div className="mt-14 flex flex-row flex-wrap items-center justify-center gap-3">
          {[
            { href: "/bet-analysis", label: "Bet Analysis", icon: BarChart3 },
            { href: "/bet-learning", label: "Bet Learning", icon: GraduationCap },
            { href: "/bet-assist", label: "Bet Assist", icon: Target },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-[#3D2DFF]/40 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#3D2DFF]" />
              {label}
            </Link>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs text-white/25">
          18+ only. PunterStat does not take bets. Please gamble responsibly.
          Knowledge Before Decision.
        </p>
      </div>
    </section>
  );
}
