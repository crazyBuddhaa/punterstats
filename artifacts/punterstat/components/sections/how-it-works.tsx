import { BarChart3, GraduationCap, Target } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BarChart3,
    title: "Analyse the match",
    description:
      "Get model probabilities for win, draw, goals and BTTS, check head-to-head and form, and compare against live odds to see where the value is.",
  },
  {
    number: "02",
    icon: GraduationCap,
    title: "Learn what the numbers mean",
    description:
      "Short, practical courses on odds, margins, expected value, bet types and bankroll management — so every decision has a reason behind it.",
  },
  {
    number: "03",
    icon: Target,
    title: "Bet with an assistant",
    description:
      "Use data-driven picks, check your slip before you place it, size your stake with Kelly, and track every bet to see your real ROI.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white border-y border-border/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            Getting started
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            How PunterStat works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1e293b]/60">
            Three pillars that take you from gut feeling to a repeatable betting process.
          </p>
        </div>

        <div className="relative grid gap-10 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[#3D2DFF]/20 to-transparent md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Number badge */}
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#3D2DFF]/20 bg-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3D2DFF]/8">
                  <step.icon className="h-5 w-5 text-[#3D2DFF]" />
                </div>
                <span className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#3D2DFF] text-[10px] font-bold text-white">
                  {step.number.replace("0", "")}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#0f172a]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#1e293b]/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
