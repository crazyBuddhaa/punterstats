import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  ClipboardCheck,
  FileBarChart2,
  FlaskConical,
  GraduationCap,
  LineChart,
  NotebookPen,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { PLAN_ROWS } from "@/app/(main)/pricing/plans";

interface LandingPageProps {
  courses: number;
  lessons: number;
  isAuthenticated: boolean;
}

const SLIP_LEGS = [
  { match: "Arsenal vs Chelsea", market: "Home Win (1)", odds: "1.82" },
  { match: "Liverpool vs Brighton", market: "Over 2.5 Goals", odds: "1.55" },
  { match: "Inter vs Napoli", market: "BTTS (GG)", odds: "1.74" },
  { match: "Real Madrid vs Sevilla", market: "Home & O1.5", odds: "1.31" },
];

const MATCH_SIGNALS = [
  { label: "Home Win", model: "47%", fairOdds: "2.13", barWidth: "47%", tone: "bg-slate-900" },
  { label: "Draw", model: "26%", fairOdds: "3.85", barWidth: "26%", tone: "bg-slate-400" },
  { label: "Away Win", model: "27%", fairOdds: "3.70", barWidth: "27%", tone: "bg-teal-600" },
];

const ASSIST_TOOLS = [
  {
    href: "/bet-assist/slip-checker",
    icon: ClipboardCheck,
    title: "Bet Slip Checker",
    description: "Quick-paste odds to expose true win probability, bookmaker margin and whether an Acca Bonus actually helps.",
  },
  {
    href: "/dashboard/bet-tracker",
    icon: NotebookPen,
    title: "Bet Tracker (₦)",
    description: "Log singles and multi-leg accumulators across SportyBet, Bet9ja, BetKing or 1xBet with one-tap settlement and CSV export.",
  },
  {
    href: "/dashboard/report-card",
    icon: FileBarChart2,
    title: "Betting Report Card",
    description: "Track Closing-Line Value (CLV), probability calibration and automatic leak diagnostics across your bet history.",
  },
  {
    href: "/bet-assist/slip-checker?tab=cashout",
    icon: Calculator,
    title: "Cash-Out Evaluator",
    description: "Check whether a live SportyBet or Bet9ja cash-out offer is fair or if the bookmaker is taking a heavy cut.",
  },
];

const ANALYSIS_TOOLS = [
  {
    href: "/match-breakdown",
    icon: Search,
    title: "Match Breakdown",
    description: "Quick 1-Page or 6-Step model probabilities for 1X2, Over/Under and BTTS with inline bookmaker odds comparison.",
  },
  {
    href: "/stats",
    icon: LineChart,
    title: "Historical Stats Explorer",
    description: "Top 5 European league benchmarks plus club-vs-club H2H lookups for BTTS, Over 1.5/2.5 and corners.",
  },
  {
    href: "/bet-analysis/screener",
    icon: Zap,
    title: "Daily Match Screener",
    description: "Filter upcoming matches by highest-probability favorites, Over 2.5, BTTS, Acca Anchors, or Draw Hunters.",
  },
  {
    href: "/simulation-engine",
    icon: FlaskConical,
    title: "Simulation Engine & Calibration",
    description: "Run 1,000-trial Monte Carlo bankroll simulations with Nigerian stake presets and drill Brier calibration.",
  },
];

const LEARNING_CARDS = [
  {
    href: "/betting-academy",
    icon: GraduationCap,
    eyebrow: "Betting Academy",
    title: "Odds, probability, value & bankroll discipline",
    description:
      "Structured modules written for real markets — from understanding bookmaker margin on accumulators to sizing stakes without going bust.",
    cta: "Open Betting Academy",
  },
  {
    href: "/sports-university",
    icon: BookOpen,
    eyebrow: "Sports University",
    title: "Tactical & statistical drivers across sports",
    description:
      "Learn what actually moves results in football, basketball and tennis — pressing, expected goals, home advantage, pace and schedule fatigue.",
    cta: "Open Sports University",
  },
  {
    href: "/betting-academy/option-glossary",
    icon: SlidersHorizontal,
    eyebrow: "Option Glossary & League Profiles",
    title: "Instant market shorthand & league context",
    description:
      "Look up GG, NG, DNB, 1X, Asian Handicaps and Corners in seconds, or browse European league scoring profiles before you bet.",
    cta: "Browse Option Glossary",
  },
];

const BANKROLL_BARS = [34, 42, 39, 51, 48, 60, 56, 68, 65, 76, 72, 88];

export function LandingPage({ courses, lessons, isAuthenticated }: LandingPageProps) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/register";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start free";
  const formattedLessons = lessons > 0 ? `${lessons.toLocaleString()}` : "400+";
  const formattedCourses = courses > 0 ? `${courses}` : "40+";

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Football analytics &amp; betting education
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">
              Know the true odds before you stake.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Check your bet slips for hidden margin, track singles and accumulators in ₦,
              diagnose leaks with your Betting Report Card, and master probability across{" "}
              {formattedLessons} structured lessons.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/bet-assist/slip-checker"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Check a bet slip
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-700" /> Free forever tier
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-700" /> No tips or bookmaker links
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-700" /> 18+ · Gamble responsibly
              </span>
            </div>
          </div>

          {/* Crisp Light Product Preview: Bet Slip Reality Check */}
          <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 shadow-sm sm:p-6">
            <div className="rounded-xl border border-slate-200/90 bg-white p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                    Bet Slip Checker · Live Example
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-950">
                    4-Leg Weekend Accumulator
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700">
                  Stake ₦5,000 · 6.42x
                </span>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {SLIP_LEGS.map((leg) => (
                  <div key={leg.match} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{leg.match}</p>
                      <p className="text-slate-500">{leg.market}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-700">
                      {leg.odds}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Fair chance</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-950">12.8%</p>
                </div>
                <div className="rounded-lg bg-amber-50/70 p-3">
                  <p className="text-[11px] font-medium text-amber-800">Bookie margin</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-amber-900">14.6%</p>
                </div>
                <div className="rounded-lg bg-teal-50/70 p-3">
                  <p className="text-[11px] font-medium text-teal-800">Potential win</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-teal-900">₦32,100</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3.5 py-2.5 text-xs leading-relaxed text-amber-950">
                <span className="font-semibold">Acca Bonus reality:</span> A +5% bookmaker bonus
                still leaves you paying <span className="font-semibold">9.6% net margin</span> across
                4 legs. Trim to 1–2 value singles to cut compounding hold.
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                <p className="text-[11px] font-medium text-slate-500">Sample Tracker P/L</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-teal-700">+₦48,200</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                <p className="text-[11px] font-medium text-slate-500">Report Card CLV</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-950">+2.4% avg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200/80 bg-[#f8fafc]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-slate-200/80 px-5 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-8">
          {[
            { value: formattedLessons, label: "Structured lessons" },
            { value: formattedCourses, label: "Courses & modules" },
            { value: "1,000", label: "Monte Carlo trials per run" },
            { value: "₦0", label: "To start — upgrade anytime" },
          ].map((stat) => (
            <div key={stat.label} className="py-6 sm:px-6 sm:py-7 first:sm:pl-0 last:sm:pr-0">
              <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-950 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKFLOW 01: BET ASSIST ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              01 · Bet Assist
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Check every slip, track every naira, plug your leaks.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Most punters never see how much bookmaker margin eats into 5-leg tickets or cash-out
              offers. Bet Assist gives you a clean daily loop from pre-bet check to post-match audit.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {ASSIST_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group rounded-xl border border-slate-200/90 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-teal-700" />
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
                    </div>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-950">{tool.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Report Card Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Betting Report Card
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">Last 90 Days Diagnostic</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                Grade B+
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[11px] text-slate-500">ROI</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-teal-700">+8.4%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[11px] text-slate-500">Avg CLV</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">+2.4%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[11px] text-slate-500">Brier Score</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">0.184</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Bankroll progression (₦)</span>
                <span className="font-semibold tabular-nums text-slate-900">₦100k → ₦148.2k</span>
              </div>
              <div className="flex h-24 items-end gap-1.5 rounded-xl bg-slate-50 p-3">
                {BANKROLL_BARS.map((height, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t-sm ${idx >= 9 ? "bg-teal-600" : "bg-slate-300"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3.5 py-2.5">
                <span className="font-semibold text-slate-800">Strongest market</span>
                <span className="font-medium text-teal-700">EPL Singles (+12.1% ROI)</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg bg-amber-50/70 px-3.5 py-2.5">
                <span className="font-semibold text-amber-950">Top leak flagged</span>
                <span className="font-medium text-amber-800">4+ leg accas (-11.2% ROI)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW 02: MATCH & STATS INTELLIGENCE ──────────────────────────── */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24">
          {/* Match Breakdown Preview */}
          <div className="order-2 rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 lg:order-1">
            <div className="rounded-xl border border-slate-200/90 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                    Match Breakdown · Quick 1-Page Mode
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">Arsenal vs Liverpool</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                  +4.8% Value Edge
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {MATCH_SIGNALS.map((signal) => (
                  <div key={signal.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{signal.label}</span>
                      <span className="tabular-nums text-slate-500">
                        <strong className="text-slate-950">{signal.model}</strong> · Fair {signal.fairOdds}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${signal.tone}`} style={{ width: signal.barWidth }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-4 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[11px] text-slate-500">Over 2.5</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-950">58%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[11px] text-slate-500">BTTS (GG)</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-950">54%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[11px] text-slate-500">Avg Goals</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-950">2.84</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-xs">
              <span className="text-slate-600">Compare against SportyBet / Bet9ja / Pinnacle odds</span>
              <Link href="/match-breakdown" className="font-semibold text-teal-700 hover:text-teal-800">
                Try analyzer →
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              02 · Bet Analysis
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Price a fixture yourself before looking at the odds.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Anchor on form, head-to-head trends and league averages first — then compare your
              fair price to the market so you only bet when the numbers justify the risk.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {ANALYSIS_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group rounded-xl border border-slate-200/90 bg-[#f8fafc] p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-slate-900" />
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
                    </div>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-950">{tool.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW 03: EDUCATION ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              03 · Bet Learning
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {formattedLessons} lessons from odds basics to closing-line value.
            </h2>
          </div>
          <Link
            href="/bet-learning"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Explore all learning tracks
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LEARNING_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                    {card.eyebrow}
                  </span>
                  <Icon className="h-5 w-5 text-slate-400 transition group-hover:text-slate-900" />
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {card.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                  {card.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── TRANSPARENT PRICING PREVIEW ──────────────────────────────────────── */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Transparent pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Start free. Upgrade only when you want deeper diagnostics.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Pay effortlessly via Paystack (cards, bank transfer, OPay/PalmPay, USSD) or Stripe.
              Cancel anytime.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PLAN_ROWS.map((plan) => {
              const isHighlighted = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    isHighlighted
                      ? "border-slate-900 bg-white shadow-md"
                      : "border-slate-200 bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-950">{plan.name}</h3>
                    {plan.badge && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isHighlighted
                            ? "bg-slate-900 text-white"
                            : "bg-teal-50 text-teal-800"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight tabular-nums text-slate-950">
                      {plan.ngn ?? "₦0"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {plan.ngn ? `${plan.period} · ${plan.gbp}${plan.period}` : "forever"}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    {plan.description}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-5 text-xs">
                    {plan.features.filter((f) => f.included).slice(0, 6).map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2 text-slate-700">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
                        <span>{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaHref}
                    className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      isHighlighted
                        ? "mt-6 bg-slate-900 text-white hover:bg-slate-800"
                        : "mt-6 border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Want to compare every feature side by side?{" "}
            <Link href="/pricing" className="font-semibold text-slate-900 underline underline-offset-4">
              View full pricing &amp; FAQ
            </Link>
          </p>
        </div>
      </section>

      {/* ── FINAL TRUST & CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-14">
          <div className="mx-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Independent · Educational · Transparent
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Don&apos;t chase certainty. Build a repeatable edge.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Start with one slip check, one match breakdown or one lesson. No tips, no hype, and
            no bookmaker affiliate links — ever.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/bet-assist/slip-checker"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Try Bet Slip Checker
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            18+ · PunterStat does not accept wagers or hold betting funds ·{" "}
            <Link href="/responsible-gambling" className="underline underline-offset-2 hover:text-slate-900">
              Gamble responsibly
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}