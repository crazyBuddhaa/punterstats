import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { TopicCard } from "@/components/betting-academy/topic-card";
import { getUserProfile } from "@/lib/auth/helpers";
import { getTopics, getModuleCount } from "@/lib/betting-academy/queries";

export const metadata: Metadata = {
  title: "Betting Academy",
  description: "Learn how betting markets work — odds, probability, value, bet types, and bankroll management.",
};

export default async function BettingAcademyPage() {
  const [profile, topics] = await Promise.all([
    getUserProfile(),
    getTopics(),
  ]);

  const topicsWithCount = await Promise.all(
    topics.map(async (topic) => ({
      topic,
      moduleCount: await getModuleCount(topic.id),
    }))
  );

  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {/* Hero — shown only for public (signed-out) visitors */}
      {!isLoggedIn && (
        <section className="border-b border-slate-200/80 bg-white px-4 py-14 sm:py-20">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <GraduationCap className="h-3.5 w-3.5" />
              Betting Academy
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Understand how betting markets work
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">
              Structured education on odds, probability, value identification, bet types, and bankroll management.
              No gambling encouragement — just the mechanics, explained clearly.
            </p>
          </div>
        </section>
      )}

      {/* Topics */}
      <section
        className={
          isLoggedIn
            ? "py-2"
            : "container mx-auto max-w-6xl px-4 py-12 sm:py-16"
        }
      >
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
