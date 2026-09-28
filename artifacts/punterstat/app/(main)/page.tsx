import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/sections/landing-page";

export const metadata: Metadata = {
  title: "PunterStat — Bet Analysis, Bet Learning & Bet Assist",
  description:
    "Analyse football matches with model probabilities, learn how odds and value work, and use data-driven picks, a bet slip checker, betting calculators and a bet tracker.",
  openGraph: {
    title: "PunterStat — Knowledge Before Decision",
    description:
      "Bet analysis, bet learning and bet assist in one place: data-driven picks, slip checker, calculators and tracker.",
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
