"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { GlossaryEntry } from "./glossary-entry";
import type { BetCategory, BetTypeEntry } from "@/lib/option-glossary/types";

const CATEGORY_ICONS: Record<string, string> = {
  "match-result":  "⚽",
  "goals-markets": "🎯",
  "handicaps":     "⚖️",
  "correct-score": "🔢",
  "player-props":  "👤",
};

interface CategoryFilterProps {
  categories: BetCategory[];
  entries: BetTypeEntry[];
}

export function CategoryFilter({ categories, entries }: CategoryFilterProps) {
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = entries;
    if (activeSlug !== "all") {
      list = list.filter((e) => e.category?.slug === activeSlug);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.explanation.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, activeSlug, query]);

  // Group filtered entries by category for display
  const grouped = useMemo(() => {
    if (activeSlug !== "all") {
      return [{ category: categories.find((c) => c.slug === activeSlug)!, entries: filtered }];
    }
    return categories
      .map((cat) => ({
        category: cat,
        entries: filtered.filter((e) => e.category?.slug === cat.slug),
      }))
      .filter((g) => g.entries.length > 0);
  }, [filtered, activeSlug, categories]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e293b]/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bet types…"
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Category pills */}
      <div
        role="group"
        aria-label="Filter by category"
        className="mb-8 flex flex-wrap gap-2"
      >
        <button
          onClick={() => setActiveSlug("all")}
          aria-pressed={activeSlug === "all"}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeSlug === "all"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-border text-[#1e293b]/60 hover:border-emerald-300 hover:text-emerald-700"
          }`}
        >
          All ({entries.length})
        </button>
        {categories.map((cat) => {
          const count = entries.filter((e) => e.category?.slug === cat.slug).length;
          const icon = CATEGORY_ICONS[cat.slug] ?? "📋";
          return (
            <button
              key={cat.slug}
              onClick={() => setActiveSlug(cat.slug)}
              aria-pressed={activeSlug === cat.slug}
              disabled={count === 0}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-30 ${
                activeSlug === cat.slug
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-border text-[#1e293b]/60 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-semibold text-[#0f172a]">No entries match your search</p>
          <p className="mt-1 text-sm text-[#1e293b]/50">Try a different term or clear the filter.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ category, entries: groupEntries }) => (
            <section key={category?.slug ?? "all"}>
              {activeSlug === "all" && category && (
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0f172a]">
                  <span>{CATEGORY_ICONS[category.slug] ?? "📋"}</span>
                  {category.name}
                  <span className="ml-1 text-sm font-normal text-[#1e293b]/40">
                    — {groupEntries.length} {groupEntries.length === 1 ? "entry" : "entries"}
                  </span>
                </h2>
              )}
              <div className="space-y-3">
                {groupEntries.map((entry) => (
                  <GlossaryEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
