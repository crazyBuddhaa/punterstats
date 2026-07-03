import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, BarChart3, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModuleStats {
  suCourses: number;
  suLessons: number;
  baTopics: number;
  baLessons: number;
}

const modules = (stats: ModuleStats) => [
  {
    icon: GraduationCap,
    title: "Sports University",
    tagline: "How sports actually work",
    description:
      "Rules, tactics, team systems, and historical patterns. Build a genuine understanding of football, basketball, tennis, and beyond.",
    href: "/sports-university",
    accent: "blue" as const,
    stats: [
      { label: "Courses", value: stats.suCourses || "8+" },
      { label: "Lessons", value: stats.suLessons || "50+" },
    ],
    badge: "Free",
  },
  {
    icon: BookOpen,
    title: "Betting Academy",
    tagline: "The maths behind the markets",
    description:
      "Implied probability, expected value, the overround, and bankroll concepts. Literacy first — always.",
    href: "/betting-academy",
    accent: "emerald" as const,
    stats: [
      { label: "Topics", value: stats.baTopics || "4+" },
      { label: "Lessons", value: stats.baLessons || "30+" },
    ],
    badge: "Free",
  },
  {
    icon: BarChart3,
    title: "Simulation Engine",
    tagline: "Test without risk",
    description:
      "Run a virtual Bet Simulator or 200-iteration Monte Carlo probability model. See variance, ruin rates, and EV in real time.",
    href: "/simulation-engine",
    accent: "blue" as const,
    stats: [
      { label: "Simulators", value: 2 },
      { label: "Data points/run", value: "200" },
    ],
    badge: "Interactive",
  },
  {
    icon: Search,
    title: "Match Breakdown",
    tagline: "Read a game analytically",
    description:
      "A 6-factor probability analyzer covering form, head-to-head, xG model, injury availability, and match stakes.",
    href: "/match-breakdown",
    accent: "blue" as const,
    stats: [
      { label: "Factors analysed", value: 6 },
      { label: "Output", value: "3-way %" },
    ],
    badge: "Analytical",
  },
];

interface Props {
  stats: ModuleStats;
}

export function ModuleShowcase({ stats }: Props) {
  const items = modules(stats);
  return (
    <section className="bg-[#0f172a] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            Four modules
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything in one platform
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/50">
            Structured learning, interactive tools, and analytical frameworks — built together.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/4 p-6 transition-all duration-200 hover:border-[#3D2DFF]/40 hover:bg-white/6"
            >
              {/* Top row */}
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D2DFF]/15">
                  <mod.icon className="h-5 w-5 text-[#3D2DFF]" />
                </div>
                <Badge
                  variant="outline"
                  className="border-white/15 text-white/40 text-xs"
                >
                  {mod.badge}
                </Badge>
              </div>

              {/* Text */}
              <h3 className="mb-1 text-base font-semibold text-white">{mod.title}</h3>
              <p className="mb-2 text-xs font-medium text-[#3D2DFF]">{mod.tagline}</p>
              <p className="flex-1 text-sm leading-relaxed text-white/50">{mod.description}</p>

              {/* Stats row */}
              <div className="mt-5 flex items-center gap-5 border-t border-white/8 pt-4">
                {mod.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[11px] text-white/35">{s.label}</p>
                  </div>
                ))}
                <div className="ml-auto">
                  <ArrowRight className="h-4 w-4 text-white/25 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#3D2DFF]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
