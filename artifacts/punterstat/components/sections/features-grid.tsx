import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Search,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: GraduationCap,
    title: "Sports University",
    description:
      "Structured courses covering how sports work — rules, tactics, team systems, and historical patterns across football, basketball, tennis, and more.",
    accent: false,
  },
  {
    icon: BookOpen,
    title: "Betting Literacy Academy",
    description:
      "Learn the mathematics behind odds, expected value, variance, and Kelly criterion. Understand what the numbers mean before you act on them.",
    accent: true,
  },
  {
    icon: BarChart3,
    title: "Probability Simulator",
    description:
      "Interactive tools to run simulations, explore distributions, and see the long-run impact of different decision-making approaches.",
    accent: false,
  },
  {
    icon: Search,
    title: "Match Breakdown Engine",
    description:
      "Deep analytical breakdowns of real matches — formations, pressure maps, key moments — so you can read a game beyond the scoreline.",
    accent: false,
  },
  {
    icon: Zap,
    title: "Adaptive Learning Paths",
    description:
      "Whether you're a complete beginner or an experienced analyst, PunterStat adapts to your knowledge level and builds upward systematically.",
    accent: false,
  },
  {
    icon: Lock,
    title: "No Noise. No Tips.",
    description:
      "We teach frameworks and thinking, not picks. PunterStat is an education platform — we don't tell you what to bet, we teach you how to think.",
    accent: false,
  },
];

interface FeaturesGridProps {
  className?: string;
}

export function FeaturesGrid({ className }: FeaturesGridProps) {
  return (
    <section className={cn("bg-[#f8fafc] py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            What We Teach
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            A complete education in sports intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1e293b]/60">
            Four interconnected modules. One clear purpose: build the analytical
            mind of a sports thinker.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "group rounded-xl border p-6 transition-shadow hover:shadow-md",
                feature.accent
                  ? "border-[#3D2DFF]/30 bg-[#3D2DFF]/5"
                  : "border-[#0f172a]/8 bg-white"
              )}
            >
              <div
                className={cn(
                  "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
                  feature.accent
                    ? "bg-[#3D2DFF] text-white"
                    : "bg-[#0f172a]/6 text-[#3D2DFF]"
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[#0f172a]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#1e293b]/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
