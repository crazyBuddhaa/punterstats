import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Search,
  ShieldCheck,
  Target,
  Users,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = {
  title: "About PunterStat",
  description:
    "PunterStat is a sports intelligence and education platform. We teach probability, sports systems, and analytical thinking — not betting tips.",
  openGraph: {
    title: "About PunterStat — Knowledge Before Decision",
    description:
      "We built PunterStat to change how people think about sports. Learn the maths, understand the systems, make better decisions.",
  },
};

const modules = [
  {
    icon: GraduationCap,
    title: "Sports University",
    description:
      "Structured courses covering how sports actually work — rules, tactics, team systems, squad rotation, home advantage, and historical patterns.",
    href: "/sports-university",
    tag: "Free",
  },
  {
    icon: BookOpen,
    title: "Betting Literacy Academy",
    description:
      "Learn the mathematics behind odds, implied probability, expected value, variance, and bankroll theory. No tips — just the maths.",
    href: "/betting-academy",
    tag: "Free",
  },
  {
    icon: BarChart3,
    title: "Simulation Engine",
    description:
      "Two simulators: a virtual-balance Bet Simulator and a Monte Carlo Probability Simulator with long-run charts. All using virtual currency.",
    href: "/simulation-engine",
    tag: "Free",
  },
  {
    icon: Search,
    title: "Match Breakdown Engine",
    description:
      "A six-factor analytical framework covering form, head-to-head record, xG, injury impact, and match stakes. Educational breakdowns, not predictions.",
    href: "/match-breakdown",
    tag: "Premium",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "We are not a betting site",
    description:
      "PunterStat does not process transactions, accept deposits, or facilitate gambling of any kind. We are an education platform — full stop.",
  },
  {
    icon: Target,
    title: "Precision over noise",
    description:
      "We don't publish picks, tips, or predictions. We teach frameworks that help you think clearly about probability and risk.",
  },
  {
    icon: Lightbulb,
    title: "Knowledge first",
    description:
      "Every module is built around one question: does this help someone understand the system better? If not, it doesn't belong on the platform.",
  },
  {
    icon: Users,
    title: "Built for thinkers",
    description:
      "PunterStat is for anyone who wants to understand sports and probability analytically — sports enthusiasts, students, analysts, and curious minds.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#3D2DFF 1px, transparent 1px), linear-gradient(to right, #3D2DFF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#3D2DFF] opacity-[0.06] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Badge
            variant="outline"
            className="mb-6 border-[#3D2DFF]/30 bg-[#3D2DFF]/10 px-4 py-1.5 text-sm font-medium text-[#3D2DFF]"
          >
            Our mission
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            We built PunterStat to change{" "}
            <span className="text-[#3D2DFF]">how people think</span> about
            sports.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60">
            Not to tip winners. Not to beat bookmakers. To give people a
            genuine understanding of probability, sports systems, and analytical
            decision-making.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
                Core philosophy
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Knowledge Before Decision.
              </h2>
              <div className="space-y-4 text-[#475569] leading-relaxed">
                <p>
                  Most people engage with sports through emotion — their team,
                  their gut feeling, what pundits say on TV. Very few understand
                  the actual mathematics of what they&apos;re watching.
                </p>
                <p>
                  PunterStat exists to close that gap. We teach the probability
                  theory, the sports science, the tactical frameworks, and the
                  risk mathematics that professionals use — so that anyone can
                  engage with sports from a position of genuine understanding.
                </p>
                <p>
                  We believe better-informed people make better decisions. In
                  sport. In analysis. In life.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
                >
                  <Link href="/register">Start learning free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">See what&apos;s included</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#3D2DFF]/10 bg-[#f8fafc] p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#3D2DFF]">
                Think of us as
              </p>
              <div className="space-y-5">
                {[
                  {
                    name: "Investopedia",
                    for: "sports intelligence",
                    desc: "Deep educational content on how sports systems and probability actually work.",
                  },
                  {
                    name: "Coursera",
                    for: "sports education",
                    desc: "Structured, progressive courses you can take at your own pace.",
                  },
                  {
                    name: "Duolingo",
                    for: "betting literacy",
                    desc: "A systematic approach to building mathematical fluency around odds and risk.",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-border/50 bg-white p-4"
                  >
                    <p className="mb-1 text-sm font-semibold text-[#0f172a]">
                      {item.name}{" "}
                      <span className="font-normal text-[#1e293b]/50">
                        for {item.for}
                      </span>
                    </p>
                    <p className="text-sm text-[#475569]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four modules */}
      <section className="border-y border-border/50 bg-[#f8fafc] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
              What we teach
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
              Four modules. One complete education.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[#1e293b]/60">
              Each module is self-contained and builds on the others. Start
              anywhere — the platform adapts to your knowledge level.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {modules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="group rounded-xl border border-border/50 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D2DFF]/8 text-[#3D2DFF]">
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-border/50 px-2.5 py-0.5 text-xs font-medium text-[#1e293b]/50">
                    {mod.tag}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-[#0f172a] group-hover:text-[#3D2DFF] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#475569]">
                  {mod.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
              What we stand for
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
              Our principles
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border/50 bg-[#f8fafc] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D2DFF]/8 text-[#3D2DFF]">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-[#0f172a]">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#475569]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-border/50 bg-[#f8fafc] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-xl border border-border/50 bg-white p-6 text-center">
            <ShieldCheck className="mx-auto mb-3 h-6 w-6 text-[#3D2DFF]" />
            <h3 className="mb-2 text-sm font-semibold text-[#0f172a]">
              Educational platform — not a gambling service
            </h3>
            <p className="text-sm leading-relaxed text-[#475569]">
              PunterStat does not process real-money transactions, accept
              deposits, facilitate wagering, or provide betting tips of any
              kind. All simulation features use virtual currency exclusively for
              educational purposes. Any decisions made outside this platform are
              the sole responsibility of the individual.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f172a] px-4 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 text-2xl font-bold text-white">
            Ready to start thinking analytically?
          </h2>
          <p className="mb-6 text-sm text-white/60">
            Create a free account. No card required. All core content is free.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
          >
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
