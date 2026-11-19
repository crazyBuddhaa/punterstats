import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookMarked } from "lucide-react";
import { CategoryFilter } from "@/components/option-glossary/category-filter";
import { getUserProfile } from "@/lib/auth/helpers";
import { getBetCategories, getAllEntries, getEntryCount } from "@/lib/option-glossary/queries";

export const metadata: Metadata = {
  title: "Option Glossary — Betting Academy",
  description:
    "Plain-English explanations of every major bet type — match result, goals markets, handicaps, correct score, and player props. Each entry includes a worked example, volatility note, and common misreadings.",
};

export default async function OptionGlossaryPage() {
  const [profile, categories, entries, totalCount] = await Promise.all([
    getUserProfile(),
    getBetCategories(),
    getAllEntries(),
    getEntryCount(),
  ]);

  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {/* Hero & marketing strip — shown only for signed-out visitors */}
      {!isLoggedIn && (
        <>
          <section className="border-b border-slate-200/80 bg-white px-4 py-12 sm:py-16">
            <div className="container mx-auto max-w-3xl text-center">
              {/* Breadcrumb */}
              <nav className="mb-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Link href="/betting-academy" className="transition-colors hover:text-slate-900">
                  Betting Academy
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-900">Option Glossary</span>
              </nav>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
                <BookMarked className="h-3.5 w-3.5" />
                Option Glossary
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Every bet type, explained properly
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Plain-English breakdowns of {totalCount > 0 ? totalCount : "all major"} bet
                types — what they mean, how they settle, what they cost in volatility,
                and where bettors most often misread them.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-teal-700">
                {totalCount} entries · 5 categories
              </p>
            </div>
          </section>

          {/* What makes this different */}
          <section className="border-b border-border/60 bg-white px-4 py-6">
            <div className="container mx-auto max-w-6xl">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Plain-English explanation",
                    desc: "What the market actually means, with no assumed knowledge",
                  },
                  {
                    label: "Worked example",
                    desc: "Real numbers showing exactly how settlement works",
                  },
                  {
                    label: "Volatility note",
                    desc: "How often this market wins or loses and why variance matters",
                  },
                  {
                    label: "Common misreadings",
                    desc: "The mistakes most bettors make — the part that makes this literacy, not tips",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                      <p className="text-xs text-[#1e293b]/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Glossary */}
      <section className={isLoggedIn ? "py-2" : "container mx-auto max-w-4xl px-4 py-12"}>
        {isLoggedIn && (
          <div className="mb-6">
            <nav className="mb-2 flex items-center gap-1.5 text-xs text-[#1e293b]/50">
              <Link href="/betting-academy" className="hover:text-[#0f172a] transition-colors">
                Betting Academy
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-[#0f172a]">Option Glossary</span>
            </nav>
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Option Glossary</h1>
              {totalCount > 0 && (
                <span className="shrink-0 text-xs text-[#1e293b]/50">
                  {totalCount} entries
                </span>
              )}
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookMarked className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">Glossary coming soon</h2>
            <p className="text-sm text-[#1e293b]/50">
              Glossary entries are being prepared. Check back shortly.
            </p>
          </div>
        ) : (
          <CategoryFilter categories={categories} entries={entries} />
        )}
      </section>

      {/* Disclaimer */}
      {!isLoggedIn && (
        <section className="border-t border-border/60 bg-white px-4 py-8">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-xs text-[#1e293b]/40 leading-relaxed">
              18+ only. PunterStat explains how betting markets work and does not
              take bets. Please gamble responsibly.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
