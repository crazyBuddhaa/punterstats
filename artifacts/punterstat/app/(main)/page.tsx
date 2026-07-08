import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { DataShowcase } from "@/components/sections/data-showcase";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CtaSection } from "@/components/sections/cta-section";

export const metadata: Metadata = {
  title: "PunterStat — Sports Intelligence & Education Platform",
  description:
    "Master sports probability, betting mathematics, and analytical thinking. 400+ structured lessons, real historical data (33 seasons, 20 bookmakers), and interactive tools — built for serious sports thinkers.",
  openGraph: {
    title: "PunterStat — Think Analytically. Bet Responsibly.",
    description:
      "A complete sports intelligence platform: Sports University, Betting Academy, Simulation Engine, Match Breakdown, and 33 seasons of historical data. Knowledge Before Decision.",
    images: ["/hero-visual.jpg"],
  },
};

async function getIsAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

export default async function Home() {
  const isAuthenticated = await getIsAuthenticated();

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <StatsBar />
      <FeaturesGrid />
      <DataShowcase />
      <HowItWorks />
      <CtaSection isAuthenticated={isAuthenticated} />
    </>
  );
}
