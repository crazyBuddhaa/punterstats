import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Zap, BookOpen, TrendingUp, BarChart2 } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { getOdds } from "@/lib/odds/client";
import { computeValueFromOddsEvent } from "@/lib/spot-the-value/calculator";
import { ValueAnalyzer } from "@/components/spot-the-value/value-analyzer";

export const metadata: Metadata = {
  title: "Spot The Value — PunterStat",
  description:
    "Compare your model's estimated probabilities against market-implied probabilities for upcoming football fixtures. An educational tool for understanding bookmaker margins and value gaps.",
  openGraph: {
    title: "Spot The Value — PunterStat",
    description:
      "Compare model probabilities against market odds to understand where value gaps appear.",
  },
};

const WHAT_YOU_LEARN = [
  {
    icon: BarChart2,
    title: "Bookmaker overround",
    body: "Bookmakers price all outcomes so their implied probabilities sum to more than 100%. That surplus — the overround — is the built-in margin that guarantees long-term profit for the house.",
  },
  {
    icon: TrendingUp,
    title: "Fair implied probability",
    body: "Once the overround is stripped out, each outcome's 'fair' probability represents what the market consensus believes about the match. This is the apples-to-apples number to compare your model against.",
  },
  {
    icon: Zap,
    title: "Value gap",
    body: "When your model assigns a higher probability to an outcome than the market's fair probability, that gap is called a value edge. Consistently finding positive-EV opportunities is how professional analysts think about markets.",
  },
  {
    icon: BookOpen,
    title: "Why most bettors don't find value",
    body: "Without stripping overround, comparing your gut feel to raw decimal odds is misleading. The market already prices that margin in. Understanding this distinction is one of the most important lessons in sports analytics.",
  },
];

export default async function SpotTheValuePage() {
  const [profile, result] = await Promise.all([
    getUserProfile(),
    getOdds("soccer_epl"),
  ]);
  const isLoggedIn = Boolean(profile);

  const initialMatches = result.success
    ? result.events
        .map((e) => computeValueFromOddsEvent(e))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .slice(0, 15)
    : [];
  const fromCache = result.success ? result.fromCache : false;

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {/* Hero & disclaimer strip — shown only for signed-out visitors */}
      {!isLoggedIn && (
        <>
          <div className="border-b border-slate-200/80 bg-white">
            <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Home
              </Link>
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-700">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Spot The Value
                  </h1>
                  <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-slate-600">
                    Load live market odds or paste your bookmaker&apos;s 1X2 prices, enter your
                    probability estimates, and instantly see where the value gaps are once the
                    bookmaker&apos;s margin is stripped away.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/80 bg-slate-100/80">
            <div className="container mx-auto max-w-5xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-700" />
                <span>
                  18+ only. PunterStat does not take bets and does not give tips. Probability comparisons are
                  illustrative estimates, not guarantees.
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className={isLoggedIn ? "space-y-8 py-2" : "container mx-auto max-w-5xl px-4 py-10 space-y-12"}>
        {/* Analyzer */}
        <section>
          <div className="mb-5">
            <h1 className={isLoggedIn ? "text-xl font-bold text-[#0f172a] sm:text-2xl" : "text-xl font-bold text-[#0f172a]"}>
              {isLoggedIn ? "Spot The Value" : "Live Odds Comparison"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#1e293b]/60">
              Select a league to compare live odds, or use Manual Odds Checker to paste SportyBet / Bet9ja prices directly.
            </p>
          </div>
          <ValueAnalyzer
            initialMatches={initialMatches}
            initialSport="soccer_epl"
            fromCache={fromCache}
          />
        </section>

        {/* How it works — shown only for signed-out visitors */}
        {!isLoggedIn && (
          <section>
            <h2 className="mb-6 text-xl font-bold text-[#0f172a]">What you&apos;ll learn</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {WHAT_YOU_LEARN.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#3D2DFF]/10 p-2.5">
                    <Icon className="h-5 w-5 text-[#3D2DFF]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#0f172a]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#1e293b]/60">{body}</p>
              </div>
            ))}
            </div>
          </section>
        )}

        {/* How to use — shown only for signed-out visitors */}
        {!isLoggedIn && (
          <section className="rounded-2xl border border-border bg-white p-7 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-[#0f172a]">How to use this tool</h2>
            <ol className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Pick a league or enter odds manually",
                  desc: "Choose from Premier League, Champions League, Europa League, La Liga, Bundesliga, Serie A, Championship, or NBA — or switch to Manual Odds Checker to paste SportyBet / Bet9ja odds directly.",
                },
                {
                  step: "2",
                  title: "Note the market's fair probabilities",
                  desc: "We strip the bookmaker's overround (e.g. 5%) and show you the 'fair' implied probability for each outcome — this is the market's true consensus view.",
                },
                {
                  step: "3",
                  title: "Run the Match Analyzer first (optional but recommended)",
                  desc: "Use the Match Breakdown Analyzer to generate model probabilities for the same fixture, then bring those numbers back here.",
                },
                {
                  step: "4",
                  title: "Enter your model probabilities",
                  desc: "Type in your home win %, draw %, and away win % (they should sum to ~100%). Click Compare to instantly see the value gap for each outcome.",
                },
                {
                  step: "5",
                  title: "Read the value rating & log +EV spots",
                  desc: "A positive delta means your model sees more probability than the market implies. Log positive-EV spots straight into your Bet Tracker in one click.",
                },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3D2DFF] text-xs font-bold text-white">
                    {step}
                  </span>
                  <div>
                    <p className="font-semibold text-[#0f172a]">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#1e293b]/60">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Cross-links */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/match-breakdown/analyzer"
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition hover:border-[#3D2DFF]/30 hover:shadow-sm"
          >
            <div className="rounded-xl bg-slate-100 p-3">
              <BarChart2 className="h-5 w-5 text-[#1e293b]" />
            </div>
            <div>
              <p className="font-semibold text-[#0f172a]">Match Breakdown Analyzer</p>
              <p className="text-xs text-[#1e293b]/50">
                Generate model probabilities to compare here
              </p>
            </div>
          </Link>
          <Link
            href="/betting-academy"
            className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition hover:border-[#3D2DFF]/30 hover:shadow-sm"
          >
            <div className="rounded-xl bg-slate-100 p-3">
              <BookOpen className="h-5 w-5 text-[#1e293b]" />
            </div>
            <div>
              <p className="font-semibold text-[#0f172a]">Betting Academy</p>
              <p className="text-xs text-[#1e293b]/50">
                Deep dive into odds, margins, and value theory
              </p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
