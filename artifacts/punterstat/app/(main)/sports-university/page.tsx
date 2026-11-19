import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { SportFilter } from "@/components/sports-university/sport-filter";
import { getUserProfile } from "@/lib/auth/helpers";
import { getCategories, getCourseCount } from "@/lib/sports-university/queries";

export const metadata: Metadata = {
  title: "Sports University",
  description: "Master how sports really work — from football fundamentals to tactical systems and competition structures.",
};

export default async function SportsUniversityPage() {
  const [profile, categories] = await Promise.all([
    getUserProfile(),
    getCategories(),
  ]);

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      courseCount: await getCourseCount(cat.id),
    }))
  );

  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {/* Hero — shown only for public (signed-out) visitors */}
      {!isLoggedIn && (
        <section className="border-b border-slate-200/80 bg-white px-4 py-14 sm:py-20">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <GraduationCap className="h-3.5 w-3.5" />
              Sports University
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Understand the game at a deeper level
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">
              Structured courses on how sports systems truly work — tactics, structures,
              dynamics, and the analytical frameworks behind the game.
            </p>
          </div>
        </section>
      )}

      {/* Categories with sport filter */}
      <section
        className={
          isLoggedIn
            ? "py-2"
            : "container mx-auto max-w-6xl px-4 py-12 sm:py-16"
        }
      >
        <SportFilter categoriesWithCount={categoriesWithCount} />
      </section>
    </div>
  );
}
