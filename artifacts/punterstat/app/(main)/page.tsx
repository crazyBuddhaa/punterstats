import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturesGrid />
      <CtaSection />
    </>
  );
}
