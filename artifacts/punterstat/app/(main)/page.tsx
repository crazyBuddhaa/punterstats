import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/sections/landing-page";

export const metadata: Metadata = {
  title: "PunterStat — Bet Analysis, Bet Learning & Bet Assist",
  description:
    "Learn the maths of betting, analyse matches with transparent probabilities, and check your slips with calculators and a tracker. We don't take bets and we don't give tips.",
  openGraph: {
    title: "PunterStat — Knowledge Before Decision",
    description:
      "Learn the maths of betting, analyse matches with transparent probabilities, and check your slips with calculators and a tracker. We don't take bets and we don't give tips.",
  },
};
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

  return <LandingPage courses={courses} lessons={lessons} isAuthenticated={isAuthenticated} />;
}
