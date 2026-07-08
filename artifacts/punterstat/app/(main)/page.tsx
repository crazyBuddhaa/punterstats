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

async function getHomepageData() {
  try {
    const supabase = await createClient();
    const [{ count: courseCount }, { count: lessonCount }, { data: { user } }] =
      await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.auth.getUser(),
      ]);
    return { courses: courseCount ?? 0, lessons: lessonCount ?? 0, isAuthenticated: !!user };
  } catch {
    return { courses: 0, lessons: 0, isAuthenticated: false };
  }
}

export default async function Home() {
  const { courses, lessons, isAuthenticated } = await getHomepageData();

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <StatsBar courses={courses} lessons={lessons} />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection isAuthenticated={isAuthenticated} />
    </>
  );
}
