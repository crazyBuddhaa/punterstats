import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "PunterStat — Sports Intelligence & Education Platform",
  description:
    "Master how sports systems, probability, and betting mathematics work. Four structured learning modules: Sports University, Betting Academy, Simulation Engine, and Match Breakdown.",
  openGraph: {
    title: "PunterStat — Knowledge Before Decision",
    description:
      "Learn sports analytics, probability theory, and analytical thinking through structured courses and interactive simulations.",
  },
};
import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { CtaSection } from "@/components/sections/cta-section";

async function getHomepageStats() {
  try {
    const supabase = await createClient();
    const [{ count: courseCount }, { count: lessonCount }] = await Promise.all([
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
    ]);
    return { courses: courseCount ?? 0, lessons: lessonCount ?? 0 };
  } catch {
    return { courses: 0, lessons: 0 };
  }
}

export default async function Home() {
  const stats = await getHomepageStats();

  return (
    <>
      <Hero />
      <StatsBar courses={stats.courses} lessons={stats.lessons} />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection />
    </>
  );
}
