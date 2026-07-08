import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Everything you need to know about PunterStat — the platform, the modules, pricing, data, and more.",
};

const faqSections = [
  {
    section: "About PunterStat",
    items: [
      {
        q: "What is PunterStat?",
        a: "PunterStat is a sports intelligence and education platform. We teach how sports systems work, how probability and odds mathematics work, and how to think analytically about sports and risk. We are not a betting site.",
      },
      {
        q: "Is PunterStat a betting site or tipster service?",
        a: "No. PunterStat does not facilitate gambling, accept stakes or deposits, process real-money transactions, or provide betting recommendations of any kind. We are an educational platform — comparable to Investopedia for sports and probability literacy.",
      },
      {
        q: "Who is PunterStat for?",
        a: "PunterStat is for anyone who wants to understand sports and probability more deeply — sports enthusiasts, students of analytics, coaches, data hobbyists, or curious minds who want to understand how the mathematics of odds and risk actually works.",
      },
      {
        q: "What is the core philosophy?",
        a: "Knowledge Before Decision. We believe that understanding the system — sports, probability, risk — is more valuable than any single tip or prediction. We teach frameworks, not forecasts.",
      },
    ],
  },
  {
    section: "Platform & Modules",
    items: [
      {
        q: "What is Sports University?",
        a: "Sports University is a structured learning module covering how sports work — football tactics, formations, pressing systems, squad rotation, home advantage, tournament structures, and more. It is fully free to access.",
      },
      {
        q: "What is the Betting Literacy Academy?",
        a: "The Betting Academy teaches the mathematics behind odds: decimal and fractional formats, implied probability, expected value (EV), variance, Kelly Criterion, and bankroll and risk management. It is educational — there are no tips or picks. All content is free to access.",
      },
      {
        q: "How does the Simulation Engine work?",
        a: "The Simulation Engine has two tools. The Bet Simulator gives you a virtual ₦10,000 balance to simulate bet outcomes and track profit/loss over time — using virtual currency only. The Probability Simulator uses Monte Carlo methods to show the long-run impact of different odds and win rates, visualised with charts. Neither tool involves real money.",
      },
      {
        q: "What is the Match Breakdown Engine?",
        a: "The Match Breakdown Engine is a six-factor analytical framework that examines home advantage, recent form, head-to-head record, goal-scoring trends, injury availability, and match stakes. It produces probability estimates and educational analysis — not betting recommendations.",
      },
      {
        q: "Are there certificates or qualifications?",
        a: "Certification infrastructure is being built. When launched, course completions will be recognised with platform certificates. These are not regulated qualifications but they do demonstrate structured learning completion.",
      },
    ],
  },
  {
    section: "Accounts & Access",
    items: [
      {
        q: "Is it free to sign up?",
        a: "Yes. Creating an account is completely free, and all core educational content — Sports University and Betting Academy — is free to access with no time limits.",
      },
      {
        q: "What does a Premium account include?",
        a: "Premium unlocks the full analytical toolkit: Match Breakdown Analyzer, progress tracking, lesson bookmarks, simulation history, and priority support. See the pricing page for the full breakdown.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes, at any time. There are no contracts or lock-in periods. You retain access until the end of your current billing period.",
      },
      {
        q: "Can I use PunterStat on mobile?",
        a: "Yes. PunterStat is fully responsive and works on any modern browser on phones, tablets, and desktops.",
      },
      {
        q: "Do you offer group or institutional access?",
        a: "Yes. Contact us at hello@punterstat.site to discuss pricing for sports academies, coaching staff, universities, or corporate groups.",
      },
    ],
  },
  {
    section: "Data & Privacy",
    items: [
      {
        q: "What data do you collect?",
        a: "We collect your name, email address, and learning activity (lesson progress, simulation sessions, bookmarks). We do not collect financial data — there are no payment details stored on PunterStat directly. See our Privacy Policy for the full breakdown.",
      },
      {
        q: "Who can see my data?",
        a: "Your learning activity is private to your account. Administrators can access platform-level usage statistics for moderation and support purposes. We do not sell your data to third parties.",
      },
      {
        q: "Is PunterStat GDPR compliant?",
        a: "Yes. We process personal data under the UK GDPR and EU GDPR. You have the right to access, correct, and delete your data at any time. Contact legal@punterstat.site to exercise your rights.",
      },
    ],
  },
  {
    section: "Technical",
    items: [
      {
        q: "What browsers does PunterStat support?",
        a: "PunterStat works on all modern browsers: Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date for the best experience.",
      },
      {
        q: "Do I need to install anything?",
        a: "No. PunterStat is a web platform — there is nothing to download or install. Open your browser, go to punterstat.site, and you're ready.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <PageHeader
        title="Frequently asked questions"
        description="Can't find what you're looking for? Email us at hello@punterstat.site"
      />

      <div className="mx-auto max-w-3xl pb-20">
        {/* Quick links */}
        <div className="mb-10 flex flex-wrap gap-2">
          {faqSections.map((s) => (
            <a
              key={s.section}
              href={`#${s.section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="rounded-full border border-border/50 bg-white px-3 py-1.5 text-xs font-medium text-[#1e293b]/70 transition hover:border-[#3D2DFF]/30 hover:text-[#3D2DFF]"
            >
              {s.section}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {faqSections.map((section) => (
            <div
              key={section.section}
              id={section.section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            >
              <h2 className="mb-5 text-base font-semibold uppercase tracking-widest text-[#3D2DFF]">
                {section.section}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border/50 bg-white"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-[#0f172a] hover:text-[#3D2DFF]">
                      {item.q}
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#1e293b]/30 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed text-[#475569]">
                        {item.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-14 rounded-2xl border border-[#3D2DFF]/20 bg-[#3D2DFF]/5 p-8 text-center">
          <h3 className="mb-2 text-base font-semibold text-[#0f172a]">
            Still have a question?
          </h3>
          <p className="mb-5 text-sm text-[#475569]">
            We&apos;re happy to help. Reach out via the contact form and
            we&apos;ll get back to you within 24 hours.
          </p>
          <Button
            asChild
            className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
          >
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
