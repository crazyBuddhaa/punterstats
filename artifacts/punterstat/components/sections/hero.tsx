import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, BookOpen, Brain, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
  isAuthenticated?: boolean;
}

const modules = [
  { href: "/sports-university", label: "Sports University", icon: BookOpen },
  { href: "/betting-academy", label: "Betting Academy", icon: Brain },
  { href: "/simulation-engine", label: "Simulation Engine", icon: BarChart3 },
  { href: "/match-breakdown", label: "Match Breakdown", icon: Search },
];

export function Hero({ className, isAuthenticated = false }: HeroProps) {
  return (
    <section
      className={cn("relative isolate overflow-hidden bg-brand-ink", className)}
    >
      {/* Background: faint grid fading out, plus two soft glows */}
      <div className="bg-grid-ink mask-fade-radial pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -left-40 -top-48 -z-10 h-[520px] w-[820px] rounded-full bg-brand-blue/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[380px] w-[520px] rounded-full bg-brand-violet/10 blur-[110px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Copy */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-blue/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand-violet">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-mint" />
            Sports intelligence &amp; education
          </p>

          <h1 className="mt-7 text-[2.6rem] font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-6xl lg:text-[4.1rem]">
            Read the game.
            <br />
            Price the odds.
            <br />
            <span className="bg-gradient-to-r from-[#8B84FF] via-brand-violet to-[#B3AEFF] bg-clip-text text-transparent">
              Think in probabilities.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300/80">
            PunterStat is the education platform for sports thinkers. We teach
            the mathematics of probability, how sports systems work, and how to
            read a match — analytically, not emotionally.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="gap-2 bg-brand-blue px-7 text-white shadow-[0_8px_30px_-6px_rgba(61,45,255,0.7)] hover:bg-brand-blue/90"
            >
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {isAuthenticated ? "Go to Dashboard" : "Start learning free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/15 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/pricing">See what&apos;s included</Link>
            </Button>
          </div>

          {/* Module shortcuts */}
          <ul className="mt-10 grid max-w-xl grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {modules.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition-colors hover:border-brand-violet/40 hover:bg-brand-blue/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-violet" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Education only · No real-money transactions · No betting tips
          </p>
        </div>

        {/* Illustration */}
        <div className="relative mx-auto w-full max-w-[640px]">
          <div className="pointer-events-none absolute inset-8 -z-10 rounded-[32px] bg-brand-blue/20 blur-3xl" />
          <Image
            src="/illustrations/hero-pitch.svg"
            alt="A tactical board showing a team's pass network and shot map, with cards converting odds of 2.10 into a 47.6% implied probability and a Poisson model of goals"
            width={640}
            height={580}
            priority
            unoptimized
            className="h-auto w-full select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </section>
  );
}
