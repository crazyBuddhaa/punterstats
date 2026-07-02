import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import { ModuleCard } from "@/components/betting-academy/module-card";
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
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const modules = await getModulesByTopic(topic.id);

  const modulesWithMeta = await Promise.all(
    modules.map(async (mod) => ({
      mod,
      lessonCount: await getLessonCount(mod.id),
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="bg-[#0f172a] px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/betting-academy" className="hover:text-white/70 transition-colors">
              Betting Academy
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">{topic.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{topic.name}</h1>
          {topic.description && (
            <p className="mt-2 text-sm text-white/60 max-w-xl leading-relaxed">{topic.description}</p>
          )}
          <p className="mt-3 text-xs text-white/30">
            {modules.length} {modules.length === 1 ? "module" : "modules"}
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-10">
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
