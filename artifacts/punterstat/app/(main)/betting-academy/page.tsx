import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { TopicCard } from "@/components/betting-academy/topic-card";
import { getTopics, getModuleCount } from "@/lib/betting-academy/queries";

export const metadata: Metadata = {
  title: "Betting Academy",
  description: "Learn how betting markets work — odds, probability, value, bet types, and bankroll management.",
};

export default async function BettingAcademyPage() {
  const topics = await getTopics();

  const topicsWithCount = await Promise.all(
    topics.map(async (topic) => ({
      topic,
      moduleCount: await getModuleCount(topic.id),
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <GraduationCap className="h-3.5 w-3.5" />
            Betting Academy
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Understand how betting markets work
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Structured education on odds, probability, value identification, bet types, and bankroll management.
            No gambling encouragement — just the mechanics, explained clearly.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {topicsWithCount.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <GraduationCap className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">Modules coming soon</h2>
            <p className="text-sm text-[#1e293b]/50">
              The first modules are being prepared. Check back shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-8 text-xl font-semibold text-[#0f172a]">Browse by topic</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topicsWithCount.map(({ topic, moduleCount }) => (
                <TopicCard key={topic.id} topic={topic} moduleCount={moduleCount} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
