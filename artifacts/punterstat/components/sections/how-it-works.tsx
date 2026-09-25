import { BarChart3, BookOpen, UserPlus } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create a free account",
    description:
      "Sign up in under a minute. No credit card, no trial period — full access to all educational content immediately.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Learn at your own pace",
    description:
      "Work through Sports University and Betting Academy lessons in any order. Track your progress, bookmark lessons, and pick up where you left off.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Apply what you know",
    description:
      "Use the Bet Simulator and Match Breakdown Engine to test your understanding with real-world scenarios — risk-free, always educational.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-blue">
              {"// Getting started"}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-brand-dark sm:text-[2.6rem] sm:leading-[1.1]">
              From sign-up to thinking like an analyst
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-slate-600">
            Three steps. No tips to follow, no hype to buy into — just a
            structured path through the ideas that matter.
          </p>
        </div>

        <div className="relative mt-14">
          {/* connector (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-8 right-8 top-[52px] hidden h-px bg-gradient-to-r from-brand-blue/0 via-brand-blue/30 to-brand-blue/0 md:block"
          />
          <ol className="relative grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7"
              >
                <span
                  aria-hidden
                  className="tabular pointer-events-none absolute -right-2 -top-6 select-none font-mono text-[7rem] font-semibold leading-none text-slate-100"
                >
                  {step.number}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-ink text-brand-violet shadow-[0_8px_20px_-8px_rgba(61,45,255,0.6)]">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="relative mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-blue">
                  Step {step.number}
                </p>
                <h3 className="relative mt-1 text-lg font-semibold text-brand-dark">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
