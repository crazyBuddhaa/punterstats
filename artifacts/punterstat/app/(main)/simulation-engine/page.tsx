import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Dices, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Simulation Engine — PunterStat",
  description:
    "Practice bet placement and run probability scenarios in a risk-free virtual environment. No real money. Pure education.",
};

const simulators = [
  {
    href: "/simulation-engine/bet-simulator",
    icon: Dices,
    badge: "Interactive",
    title: "Bet Simulator",
    description:
      "Start with a virtual ₦10,000 balance. Enter decimal odds and a stake, and watch your balance move with each outcome. Track your win streaks, ROI, and decision patterns over time.",
    highlights: [
      "Virtual ₦10,000 balance",
      "Win / loss streak tracking",
      "ROI & profit analytics",
      "Per-bet history table",
    ],
    cta: "Open Bet Simulator",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
    accentText: "text-teal-700",
  },
  {
    href: "/simulation-engine/probability-simulator",
    icon: TrendingUp,
    badge: "Monte Carlo",
    title: "Probability Simulator",
    description:
      "Enter your odds, estimated win percentage, and number of bets. Run 200 Monte Carlo simulations simultaneously and see the full distribution of possible outcomes — from ruin to profit.",
    highlights: [
      "200 parallel simulations",
      "Balance band charts",
      "Expected value calculation",
      "Variance & ruin rate analysis",
    ],
    cta: "Open Probability Simulator",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    accentText: "text-indigo-700",
  },
];

export default function SimulationEnginePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400">
            <FlaskConical className="h-3.5 w-3.5" />
            Simulation Engine
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore probability without risking anything
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/60">
            Two interactive simulators to help you understand variance, expected value, and the
            long-term mechanics of betting mathematics — with no real money involved.
          </p>
        </div>
      </section>

      {/* Disclaimer bar */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[#1e293b]/60">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>
              All simulations use virtual currency only. No real money is ever involved. This tool
              is for educational purposes — understanding probability and variance, not gambling.
            </span>
          </div>
        </div>
      </div>

      {/* Simulator cards */}
      <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {simulators.map(
            ({ href, icon: Icon, badge, title, description, highlights, cta, accentBg, accentBorder, accentText }) => (
              <div
                key={href}
                className="flex flex-col rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="rounded-xl bg-[#0f172a] p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${accentBg} ${accentBorder} ${accentText}`}
                  >
                    {badge}
                  </span>
                </div>
                <h2 className="mb-3 text-xl font-bold text-[#0f172a]">{title}</h2>
                <p className="mb-6 text-sm leading-relaxed text-[#1e293b]/60">{description}</p>
                <ul className="mb-8 space-y-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-[#1e293b]/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0f172a]/30" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Link
                    href={href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
                  >
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          )}
        </div>

        {/* What you'll learn */}
        <div className="mt-12 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-[#0f172a]">What you&apos;ll learn</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "The house edge",
                body: "Why bookmakers always price in a margin — and what that means for your long-term returns.",
              },
              {
                title: "Variance",
                body: "How you can make correct decisions and still lose money in the short term due to statistical noise.",
              },
              {
                title: "Expected value",
                body: "The single most important concept in probability-based decision making — and how to calculate it.",
              },
              {
                title: "Bankroll decay",
                body: "How staking too large a portion of your balance accelerates ruin — even with positive EV.",
              },
              {
                title: "Sample size",
                body: "Why 20 bets tells you almost nothing, and why 500+ bets starts to reflect your true edge (or lack of).",
              },
              {
                title: "Emotional patterns",
                body: "Streak chasing, loss chasing, and overconfidence — visible in your own bet history data.",
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <h3 className="mb-1 text-sm font-semibold text-[#0f172a]">{title}</h3>
                <p className="text-xs leading-relaxed text-[#1e293b]/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
