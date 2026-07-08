import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Target,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Match Breakdown Engine — PunterStat",
  description:
    "Learn how analysts break down football matches using form, head-to-head records, xG, injury impact, and home advantage. Educational probability analysis — no tips, no tips.",
};

const factors = [
  {
    icon: TrendingUp,
    title: "Recent Form",
    description:
      "The last 5 results — weighted by recency — are the strongest short-term predictor. A team on a 5-game winning streak carries structural momentum that raw league table position often misses.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  {
    icon: Users,
    title: "Head-to-Head Record",
    description:
      "Some fixture pairings produce persistent patterns due to tactical matchups, pitch dimensions, or psychological dynamics. H2H weight decays with time to account for squad turnover.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    icon: Activity,
    title: "Goal Scoring & xG",
    description:
      "Expected goals (xG) compares a team's attacking output against the opponent's defensive solidity, producing a more calibrated estimate than raw scorelines. It underpins our goals-line calculation.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    icon: Zap,
    title: "Home Advantage",
    description:
      "Across Europe's top five leagues, home teams win ~45% of matches vs ~28% for away teams. Crowd pressure, pitch familiarity, and reduced travel fatigue create a measurable 8–15% probability shift.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    icon: AlertTriangle,
    title: "Injury & Suspension Impact",
    description:
      "Losing a top scorer reduces expected output by ~15%. Losing a defensive anchor raises xGA by a similar margin. The analyzer grades absence impact from None → Major, adjusting the probability model accordingly.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    icon: Target,
    title: "Match Stakes",
    description:
      "Title deciders and relegation six-pointers produce more conservative, lower-scoring affairs than routine mid-table clashes. The importance context shifts baseline probabilities and goal expectation.",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Enter match context",
    body: "Name the teams, choose the match importance, and work through each factor step-by-step — form, H2H, goals, availability.",
  },
  {
    step: "02",
    title: "Model weights the signals",
    body: "Each factor contributes a signed edge to a baseline (home 42%, draw 26%, away 32%). Weights are calibrated against historical top-league data.",
  },
  {
    step: "03",
    title: "Read the educational breakdown",
    body: "The output shows probability bars, implied odds, expected goals, and per-factor explanations — so you understand the 'why', not just the number.",
  },
];

export default function MatchBreakdownPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400">
            <BarChart2 className="h-3.5 w-3.5" />
            Match Breakdown Engine
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Understand how analysts read a match
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/60">
            Enter the factors that shape match probability — form, head-to-head, goal data, injuries,
            home advantage — and see a full educational breakdown of how each signal moves the
            probability needle.
          </p>
          <div className="mt-8">
            <Link
              href="/match-breakdown/analyzer"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-400"
            >
              Open the Analyzer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[#1e293b]/60">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>
              The Match Breakdown Engine is an educational tool. It produces illustrative probability
              estimates — not predictions of actual match results. No tips. No recommendations.
            </span>
          </div>
        </div>
      </div>

      {/* The six factors */}
      <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">Six factors. One probability model.</h2>
          <p className="mt-2 text-sm text-[#1e293b]/60 max-w-xl mx-auto">
            Professional analysts weigh these signals every match day. Learn what each one means and
            how it shifts the probability estimate.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {factors.map(({ icon: Icon, title, description, color, bg, border }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <div className={`mb-4 inline-flex rounded-xl border ${border} ${bg} p-2.5`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="mb-2 font-semibold text-[#0f172a]">{title}</h3>
              <p className="text-sm leading-relaxed text-[#1e293b]/60">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-white py-14 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[#0f172a]">How it works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {howItWorks.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f172a] text-lg font-bold text-teal-400">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold text-[#0f172a]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#1e293b]/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="container mx-auto max-w-4xl px-4 py-14 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">What you&apos;ll learn</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Why home advantage is a statistical signal, not a myth",
            "How form rating weights recent results over old ones",
            "What expected goals (xG) measures and why it outperforms raw scorelines",
            "How injury impact is quantified as a probability shift",
            "Why H2H records lose relevance after 2–3 seasons",
            "How high-stakes matches produce lower-scoring, conservative game plans",
          ].map((point) => (
            <div
              key={point}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-4"
            >
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <p className="text-sm text-[#1e293b]/80">{point}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/match-breakdown/analyzer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
          >
            Open the Analyzer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
