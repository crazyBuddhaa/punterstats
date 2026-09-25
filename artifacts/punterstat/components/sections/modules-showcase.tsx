import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    index: "01",
    name: "Sports University",
    href: "/sports-university",
    image: "/illustrations/module-university.svg",
    alt: "A 4-3-3 formation on a pitch with arrows showing a high press",
    title: "How the game actually works",
    description:
      "Structured courses on rules, tactics, team systems and historical patterns across football, basketball, tennis and more.",
    topics: ["Formations", "Pressing systems", "League formats"],
  },
  {
    index: "02",
    name: "Betting Academy",
    href: "/betting-academy",
    image: "/illustrations/module-academy.svg",
    alt: "A curve converting decimal odds into implied probability, and a home-draw-away market adding up to 105.6%, showing a 5.6% bookmaker margin",
    title: "The maths behind every price",
    description:
      "Odds, implied probability, bookmaker margin, expected value, variance and the Kelly criterion — what the numbers mean before you act on them.",
    topics: ["Implied probability", "Overround", "Expected value"],
  },
  {
    index: "03",
    name: "Simulation Engine",
    href: "/simulation-engine",
    image: "/illustrations/module-simulator.svg",
    alt: "Forty simulated profit paths for a strategy with +5% expected value, spreading widely around the expected line",
    title: "See the long run, today",
    description:
      "Run thousands of simulated seasons to feel variance, drawdowns and the real long-run impact of different decisions — risk-free.",
    topics: ["Monte Carlo", "Variance", "Bankroll"],
  },
  {
    index: "04",
    name: "Match Breakdown",
    href: "/match-breakdown",
    image: "/illustrations/module-match.svg",
    alt: "A cumulative expected-goals timeline for both teams across 90 minutes, with goals marked",
    title: "Read a match beyond the score",
    description:
      "Break real matches down into expected goals, game state, shot quality and key moments, so you understand why a result happened.",
    topics: ["xG", "Game state", "Shot quality"],
  },
];

const principles = [
  {
    icon: Layers,
    title: "Adaptive learning paths",
    description:
      "Beginner or experienced analyst, lessons build upward systematically from where you are.",
  },
  {
    icon: ShieldCheck,
    title: "No noise. No tips.",
    description:
      "We teach frameworks and thinking, not picks. We never tell you what to bet — we teach you how to think.",
  },
];

interface ModulesShowcaseProps {
  className?: string;
}

export function ModulesShowcase({ className }: ModulesShowcaseProps) {
  return (
    <section
      id="modules"
      className={cn("scroll-mt-20 bg-slate-50 py-20 sm:py-28", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-blue">
            {"// What you'll learn"}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-brand-dark sm:text-[2.6rem] sm:leading-[1.1]">
            Four modules. One way of thinking.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Each module attacks the same question from a different angle: what
            is really likely to happen, and how would you know?
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_24px_48px_-24px_rgba(61,45,255,0.35)]"
            >
              <div className="bg-brand-ink p-3 sm:p-4">
                <Image
                  src={m.image}
                  alt={m.alt}
                  width={480}
                  height={300}
                  unoptimized
                  className="h-auto w-full rounded-xl transition-transform duration-500 group-hover:scale-[1.015]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    <span className="text-brand-blue">{m.index}</span> ·{" "}
                    {m.name}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-brand-dark">
                  {m.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {m.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {m.topics.map((t) => (
                    <li
                      key={t}
                      className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {principles.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
