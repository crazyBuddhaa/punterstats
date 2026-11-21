import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingCurrencyToggle from "./PricingCurrencyToggle";
import { PLAN_ROWS } from "./plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for PunterStat — start free, or upgrade to Pro (₦700/mo) or Premium (₦1,500/mo) with Paystack, cards, bank transfer or OPay/PalmPay.",
};

const FAQ = [
  {
    q: "Is PunterStat a bookmaker?",
    a: "No. PunterStat provides sports betting education, match analysis tools, calculators and a personal bet tracker. We do not take bets, hold betting funds or sell tips. Your subscription pays for the analytical platform, not for wagers.",
  },
  {
    q: "What does the Free plan include?",
    a: "Free accounts include full access to Sports University & Betting Academy lessons, lesson bookmarks and progress tracking, the Bet Slip Checker & Cash-Out Evaluator, Bet Tracker / Journal with basic ROI summary, and Historical Football Stats & H2H Explorer. Pro (₦700/mo) unlocks the Match Breakdown Analyzer, Simulation Engine history and Daily Match Screener; Premium (₦1,500/mo) adds the full Betting Report Card (CLV, calibration & leak diagnostics) and Calibration Trainer.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "For Nigeria and Africa, we accept Paystack (cards, bank transfer, OPay/PalmPay, USSD) and Remita bank transfer. For UK and international users, we also accept card payments via Stripe. All plans are billed monthly with no lock-in.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no contracts or lock-in periods. You can cancel your subscription at any time and retain access until the end of your billing period.",
  },
  {
    q: "Do you offer team or institutional pricing?",
    a: "Contact us at hello@punterstat.site to discuss group access for sports academies, coaching staff, or educational institutions.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Light editorial hero */}
      <section className="border-b border-slate-200/80 bg-white px-4 py-14 sm:py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Simple, transparent pricing
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Start free, upgrade when you&apos;re ready
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Core lessons, calculators, Bet Slip Checker and Bet Tracker are free forever.
            Upgrade to Pro (₦700/mo) or Premium (₦1,500/mo) for deep diagnostics.
          </p>
        </div>
      </section>

      {/* Plans — currency toggle handled client-side */}
      <PricingCurrencyToggle plans={PLAN_ROWS} />

      {/* Payment providers */}
      <section className="border-t border-slate-200/80 bg-white px-4 py-10">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Accepted payment methods
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
            <span>Paystack — Nigeria &amp; Africa (cards, transfer, OPay/PalmPay, USSD)</span>
            <span>Stripe — UK &amp; International</span>
            <span>Remita — Nigeria bank transfer</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200/80 bg-[#f8fafc] px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-slate-950">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200/80 bg-white p-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">{item.q}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light CTA */}
      <section className="border-t border-slate-200/80 bg-white px-4 py-16 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-950">
            Ready to start with better numbers?
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Create a free account in under a minute — no card required.
          </p>
          <Button asChild size="lg" className="rounded-lg bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/register" className="inline-flex items-center gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
