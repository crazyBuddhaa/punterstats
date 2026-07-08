import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free and premium plans for PunterStat — sports intelligence and education for every level.",
};

const PLANS = [
  {
    name: "Free",
    price: null,
    badge: null,
    description: "Explore the platform and start learning at no cost.",
    cta: "Get started free",
    ctaHref: "/register",
    ctaVariant: "outline" as const,
    features: [
      { label: "Sports University (all lessons)", included: true },
      { label: "Betting Academy (all lessons)", included: true },
      { label: "Bet Simulator (basic)", included: true },
      { label: "Probability Simulator", included: true },
      { label: "Match Breakdown Analyzer", included: false },
      { label: "Progress tracking & completion", included: false },
      { label: "Lesson bookmarks", included: false },
      { label: "Simulation history", included: false },
      { label: "Blog access", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Premium",
    price: "£9",
    period: "/month",
    badge: "Most popular",
    description: "Full platform access with progress tracking and match analysis.",
    cta: "Start Premium",
    ctaHref: "/register?plan=premium",
    ctaVariant: "default" as const,
    features: [
      { label: "Sports University (all lessons)", included: true },
      { label: "Betting Academy (all lessons)", included: true },
      { label: "Bet Simulator (advanced)", included: true },
      { label: "Probability Simulator", included: true },
      { label: "Match Breakdown Analyzer", included: true },
      { label: "Progress tracking & completion", included: true },
      { label: "Lesson bookmarks", included: true },
      { label: "Simulation history", included: true },
      { label: "Blog access", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "£19",
    period: "/month",
    badge: null,
    description: "Everything in Premium plus priority support and early feature access.",
    cta: "Start Pro",
    ctaHref: "/register?plan=pro",
    ctaVariant: "default" as const,
    features: [
      { label: "Sports University (all lessons)", included: true },
      { label: "Betting Academy (all lessons)", included: true },
      { label: "Bet Simulator (advanced)", included: true },
      { label: "Probability Simulator", included: true },
      { label: "Match Breakdown Analyzer", included: true },
      { label: "Progress tracking & completion", included: true },
      { label: "Lesson bookmarks", included: true },
      { label: "Simulation history", included: true },
      { label: "Blog access", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

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

      {/* Plans */}
      <section className="container mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/50 ${plan.badge ? "border-[#3D2DFF]/40 shadow-lg shadow-[#3D2DFF]/5" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#3D2DFF] text-white text-xs px-3">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-6">
                <h2 className="text-lg font-bold text-[#0f172a]">{plan.name}</h2>
                <div className="mt-1 flex items-end gap-1">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-bold text-[#0f172a]">{plan.price}</span>
                      <span className="mb-1 text-sm text-[#1e293b]/50">{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-[#0f172a]">Free</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#1e293b]/60 leading-relaxed">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3D2DFF]" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                      )}
                      <span className={f.included ? "text-[#1e293b]/80" : "text-[#1e293b]/40 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full ${plan.ctaVariant === "default" ? "bg-[#3D2DFF] hover:bg-[#3D2DFF]/90" : ""}`}
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#1e293b]/40">
          Prices shown in GBP. VAT may apply. No contracts — cancel anytime.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/50 bg-white px-4 py-14">
        <div className="container mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#0f172a]">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-border/50 bg-[#f8fafc] p-5">
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
