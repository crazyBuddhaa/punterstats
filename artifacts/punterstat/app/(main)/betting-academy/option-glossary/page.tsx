import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookMarked } from "lucide-react";
import { CategoryFilter } from "@/components/option-glossary/category-filter";
import { getBetCategories, getAllEntries, getEntryCount } from "@/lib/option-glossary/queries";

export const metadata: Metadata = {
  title: "Option Glossary — Betting Academy",
  description:
    "Plain-English explanations of every major bet type — match result, goals markets, handicaps, correct score, and player props. Each entry includes a worked example, volatility note, and common misreadings.",
};

export default async function OptionGlossaryPage() {
  const [categories, entries, totalCount] = await Promise.all([
    getBetCategories(),
    getAllEntries(),
    getEntryCount(),
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-14 sm:py-18">
        <div className="container mx-auto max-w-3xl text-center">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <Link href="/betting-academy" className="hover:text-white/70 transition-colors">
              Betting Academy
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">Option Glossary</span>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <BookMarked className="h-3.5 w-3.5" />
            Option Glossary
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Every bet type, explained properly
          </h1>
          <p className="mt-4 text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Plain-English breakdowns of {totalCount > 0 ? totalCount : "all major"} bet
            types — what they mean, how they settle, what they cost in volatility,
            and where bettors most often misread them.
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-emerald-500/70">
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

      {/* Glossary */}
      <section className="container mx-auto max-w-4xl px-4 py-12">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookMarked className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">Glossary coming soon</h2>
            <p className="text-sm text-[#1e293b]/50">
              Entries are being prepared. Run migration 030 in Supabase to populate them.
            </p>
          </div>
        ) : (
          <CategoryFilter categories={categories} entries={entries} />
        )}
      </section>

      {/* Disclaimer */}
      <section className="border-t border-border/60 bg-white px-4 py-8">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xs text-[#1e293b]/40 leading-relaxed">
            All content is for educational purposes only. PunterStat explains how
            betting markets work — we do not provide betting tips, encourage
            gambling, or process any real-money transactions.
          </p>
        </div>
      </section>
    </div>
  );
}
