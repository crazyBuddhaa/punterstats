"use client";

import { useState } from "react";
import { CategoryCard } from "@/components/sports-university/category-card";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseCategory } from "@/types";

// ── Sport detection ────────────────────────────────────────
// Derives a sport label from a category slug.
// Handles both exact matches ("tennis") and prefixed forms ("tennis-tactics").
// All football categories from the original seed (migration 002) either use
// the "football-" prefix or generic names — anything unrecognised is Football.

type Sport = "Football" | "Basketball" | "Tennis" | "Table Tennis";

function detectSport(slug: string): Sport {
  if (slug === "table-tennis" || slug.startsWith("table-tennis-")) return "Table Tennis";
  if (slug === "basketball"   || slug.startsWith("basketball-"))   return "Basketball";
  if (slug === "tennis"       || slug.startsWith("tennis-"))       return "Tennis";
  return "Football";
}

// ── Canonical sport order ──────────────────────────────────
// Always show pills in this order regardless of which sports have content.
const SPORTS: Sport[] = ["Football", "Basketball", "Tennis", "Table Tennis"];

const SPORT_EMOJI: Record<Sport, string> = {
  Football:       "⚽",
  Basketball:     "🏀",
  Tennis:         "🎾",
  "Table Tennis": "🏓",
};

// ── Types ──────────────────────────────────────────────────
interface CategoryWithCount {
  category: CourseCategory;
  courseCount: number;
}

interface Props {
  categoriesWithCount: CategoryWithCount[];
}

// ── Component ──────────────────────────────────────────────
export function SportFilter({ categoriesWithCount }: Props) {
  const [activeSport, setActiveSport] = useState<Sport | "All">("All");

  // Count per sport for badges
  function countForSport(sport: Sport): number {
    return categoriesWithCount.filter(
      ({ category }) => detectSport(category.slug) === sport
    ).length;
  }

  const visible =
    activeSport === "All"
      ? categoriesWithCount
      : categoriesWithCount.filter(
          ({ category }) => detectSport(category.slug) === activeSport
        );

  if (categoriesWithCount.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <GraduationCap className="mb-4 h-12 w-12 text-[#1e293b]/20" />
        <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">Courses coming soon</h2>
        <p className="text-sm text-[#1e293b]/50">
          The first courses are being prepared. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by sport">
        {/* "All" pill */}
        {(["All"] as const).map(() => {
          const isActive = activeSport === "All";
          return (
            <button
              key="All"
              onClick={() => setActiveSport("All")}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "border-[#3D2DFF] bg-[#3D2DFF] text-white shadow-sm"
                  : "border-border bg-white text-[#1e293b]/70 hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]"
              )}
            >
              All
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#f1f5f9] text-[#64748b]"
                )}
              >
                {categoriesWithCount.length}
              </span>
            </button>
          );
        })}

        {/* One pill per sport in canonical order */}
        {SPORTS.map((sport) => {
          const isActive = activeSport === sport;
          const count = countForSport(sport);

          return (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "border-[#3D2DFF] bg-[#3D2DFF] text-white shadow-sm"
                  : "border-border bg-white text-[#1e293b]/70 hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]",
                count === 0 && "opacity-40 cursor-default"
              )}
              disabled={count === 0}
            >
              <span className="text-base leading-none" aria-hidden>
                {SPORT_EMOJI[sport]}
              </span>
              {sport}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#f1f5f9] text-[#64748b]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section heading */}
      <h2 className="mb-6 text-xl font-semibold text-[#0f172a]">
        {activeSport === "All" ? "Browse by topic" : `${activeSport} topics`}
      </h2>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map(({ category, courseCount }) => (
          <CategoryCard key={category.id} category={category} courseCount={courseCount} />
        ))}
      </div>
    </>
  );
}
