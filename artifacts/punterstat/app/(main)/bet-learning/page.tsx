import type { Metadata } from "next";
import { BookOpen, GraduationCap, Library, ListChecks, Newspaper, Trophy } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid, type PillarItem } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Learning — Betting Academy & Sports University — PunterStat",
  description:
    "Learn how betting really works: odds and margins, probability and value, bet types, bankroll management, betting psychology and how the sports themselves work.",
};

const ITEMS: PillarItem[] = [
  {
    href: "/betting-academy",
    title: "Betting Academy",
    description: "Odds and markets, probability and value, bet types, bankroll management, psychology and statistical thinking.",
    icon: GraduationCap,
  },
  {
    href: "/sports-university",
    title: "Sports University",
    description: "How football, basketball, tennis and more actually work — tactics, systems and what drives results.",
    icon: BookOpen,
  },
  {
    href: "/betting-academy/option-glossary",
    title: "Betting Markets Glossary",
    description: "Every market explained: 1X2, Asian handicaps, over/under, BTTS, draw no bet and more.",
    icon: ListChecks,
  },
  {
    href: "/league-glossary",
    title: "League Glossary",
    description: "Competitions, formats and teams — know the league before you bet on it.",
    icon: Trophy,
  },
  {
    href: "/blog",
    title: "Blog",
    description: "Guides, analysis and lessons from the data.",
    icon: Newspaper,
  },
  {
    href: "/responsible-gambling",
    title: "Betting Responsibly",
    description: "Bankroll rules, warning signs and where to get support.",
    icon: Library,
  },
];

export default function BetLearningPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={GraduationCap}
        eyebrow="Pillar 2"
        title="Bet Learning"
        description="Structured courses on the maths, markets and mindset behind consistent betting — from what odds mean to finding value and managing a bankroll."
        backHref="/"
        backLabel="Home"
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <PillarGrid items={ITEMS} />
      </div>
    </div>
  );
}
