import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/sections/landing-page";

export const metadata: Metadata = {
  title: "PunterStat — Know the True Odds Before You Stake",
  description:
    "Check your bet slips for hidden margin, track singles and accumulators in ₦, diagnose leaks with your Betting Report Card, and master probability across 400+ lessons. No tips. No bookmaker affiliation.",
  openGraph: {
    title: "PunterStat — Know the True Odds Before You Stake",
    description:
      "Bet Slip Checker, ₦ Bet Tracker, Betting Report Card, Match Breakdown, Historical Football Stats and 400+ structured lessons. No tips or bookmaker links.",
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
