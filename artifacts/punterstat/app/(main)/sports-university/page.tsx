import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { CategoryCard } from "@/components/sports-university/category-card";
import { getCategories, getCourseCount } from "@/lib/sports-university/queries";

export const metadata: Metadata = {
  title: "Sports University",
  description: "Master how sports really work — from football fundamentals to tactical systems and competition structures.",
};

export default async function SportsUniversityPage() {
  const categories = await getCategories();

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      courseCount: await getCourseCount(cat.id),
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <GraduationCap className="h-3.5 w-3.5" />
            Sports University
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Understand the game at a deeper level
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Structured courses on how football and sports systems truly work — tactics, structures,
            dynamics, and the analytical frameworks behind the game.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {categoriesWithCount.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <GraduationCap className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">Courses coming soon</h2>
            <p className="text-sm text-[#1e293b]/50">
              The first courses are being prepared. Check back shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-8 text-xl font-semibold text-[#0f172a]">
              Browse by topic
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoriesWithCount.map(({ category, courseCount }) => (
                <CategoryCard key={category.id} category={category} courseCount={courseCount} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
