import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EvCalculator } from "@/components/sections/ev-calculator";

const steps = [
  {
    label: "Implied probability",
    math: "1 ÷ 2.10 = 47.6%",
    body: "The price says this outcome happens about 48 times in 100.",
  },
  {
    label: "Your estimate",
    math: "p = 52%",
    body: "Your own analysis says it is a little more likely than that.",
  },
  {
    label: "Expected value",
    math: "0.52 × 2.10 − 1 = +9.2%",
    body: "A positive number means the price is generous — on average, over many repeats. Any single result can still go either way.",
  },
];

export function LessonPreview({ className }: { className?: string }) {
  return (
    <section className={cn("bg-white py-20 sm:py-28", className)}>
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-blue">
            {"// A lesson in 30 seconds"}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-brand-dark sm:text-[2.6rem] sm:leading-[1.1]">
            What does odds of 2.10 actually mean?
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            Every price is a probability in disguise. Once you can read it, you
            can compare it with your own view — and see why the long run matters
            more than any single result.
          </p>

          <ol className="mt-9 space-y-6">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 font-mono text-xs font-semibold text-brand-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold text-brand-dark">
                      {s.label}
                    </span>
                    <code className="tabular rounded bg-slate-100 px-2 py-0.5 font-mono text-[13px] text-slate-700">
                      {s.math}
                    </code>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/betting-academy"
            className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            Learn this properly in the Betting Academy
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <EvCalculator className="lg:ml-auto lg:w-full lg:max-w-[480px]" />
      </div>
    </section>
  );
}
