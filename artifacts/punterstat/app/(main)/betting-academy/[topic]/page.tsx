import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import { ModuleCard } from "@/components/betting-academy/module-card";
import { getUserProfile } from "@/lib/auth/helpers";
import { getTopicBySlug, getModulesByTopic, getLessonCount } from "@/lib/betting-academy/queries";

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return { title: "Not Found" };
  return { title: topic.name, description: topic.description ?? undefined };
}

export default async function TopicPage({ params }: Props) {
  const { topic: slug } = await params;
  const [profile, topic] = await Promise.all([
    getUserProfile(),
    getTopicBySlug(slug),
  ]);
  if (!topic) notFound();

  const modules = await getModulesByTopic(topic.id);

  const modulesWithMeta = await Promise.all(
    modules.map(async (mod) => ({
      mod,
      lessonCount: await getLessonCount(mod.id),
    }))
  );

  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
        <section className="border-b border-slate-200/80 bg-white px-4 py-10">
          <div className="container mx-auto max-w-6xl">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/betting-academy" className="transition-colors hover:text-slate-900">
                Betting Academy
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-slate-900">{topic.name}</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{topic.name}</h1>
            {topic.description && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{topic.description}</p>
            )}
            <p className="mt-3 text-xs font-medium text-slate-400">
              {modules.length} {modules.length === 1 ? "module" : "modules"}
            </p>
          </div>
        </section>
      )}

      <section className={isLoggedIn ? "py-2" : "container mx-auto max-w-6xl px-4 py-10"}>
        {isLoggedIn && (
          <div className="mb-6">
            <nav className="mb-2 flex items-center gap-1.5 text-xs text-[#1e293b]/50">
              <Link href="/betting-academy" className="hover:text-[#0f172a] transition-colors">
                Betting Academy
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-[#0f172a]">{topic.name}</span>
            </nav>
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">{topic.name}</h1>
              <span className="shrink-0 text-xs text-[#1e293b]/50">
                {modules.length} {modules.length === 1 ? "module" : "modules"}
              </span>
            </div>
          </div>
        )}

        {modulesWithMeta.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">No modules yet</h2>
            <p className="text-sm text-[#1e293b]/50">Modules in this topic are being prepared.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modulesWithMeta.map(({ mod, lessonCount }) => (
              <ModuleCard key={mod.id} module={mod} topicSlug={slug} lessonCount={lessonCount} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
