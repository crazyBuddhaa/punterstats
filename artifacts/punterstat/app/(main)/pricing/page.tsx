import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import PricingCurrencyToggle from "./PricingCurrencyToggle";
import { PLAN_ROWS } from "./plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free and premium plans for PunterStat — sports intelligence and education for every level.",
};

const FAQ = [
  {
    q: "Is PunterStat a betting site?",
    a: "No. PunterStat is a sports intelligence and education platform. We do not facilitate gambling, accept stakes, or process betting transactions of any kind.",
  },
  {
    q: "What does the Free plan include?",
    a: "Free users get full access to Sports University and Betting Academy course content. The Bet Simulator and Probability Simulator are available in a basic form. Progress tracking, bookmarks, and match breakdown require a Premium or Pro plan.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept card payments via Stripe (UK/international), and African payments via Paystack (cards, bank transfer, USSD) or Remita bank transfer (Nigeria). All plans are billed monthly with no lock-in.",
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
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <Zap className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start free, upgrade when you&apos;re ready
          </h1>
          <p className="text-base text-white/60 leading-relaxed">
            All core educational content is free. Premium unlocks the full analytical toolkit.
          </p>
        </div>
      </section>

      {/* Plans — currency toggle handled client-side */}
      <PricingCurrencyToggle plans={PLAN_ROWS} />

      {/* Payment providers */}
      <section className="border-t border-border/50 bg-white px-4 py-10">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1e293b]/40 mb-4">
            Accepted payment methods
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[#1e293b]/60">
            <span>💳 Stripe — UK &amp; International</span>
            <span>🌍 Paystack — Africa</span>
            <span>🏦 Remita — Nigeria (bank transfer)</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/50 bg-[#f8fafc] px-4 py-14">
        <div className="container mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#0f172a]">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-border/50 bg-white p-5">
                <h3 className="mb-2 text-sm font-semibold text-[#0f172a]">{item.q}</h3>
                <p className="text-sm text-[#1e293b]/60 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f172a] px-4 py-14 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="mb-3 text-2xl font-bold text-white">Ready to start learning?</h2>
          <p className="mb-6 text-sm text-white/60">
            Create a free account in under a minute — no card required.
          </p>
          <Button asChild size="lg" className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
