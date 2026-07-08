"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create a free account",
    description:
      "Sign up in under a minute. No credit card, no trial period — full access to all educational content from day one.",
    detail: "Instant access to 400+ lessons across Sports University and Betting Academy.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Learn at your own pace",
    description:
      "Work through courses in any order. Track progress, bookmark lessons, and pick up exactly where you left off across all devices.",
    detail: "Adaptive paths from complete beginner to expert analyst.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Apply what you know",
    description:
      "Use the Simulation Engine and Match Breakdown to test your understanding with real-world data — risk-free, always educational.",
    detail: "Live tools grounded in 33 seasons of historical match data.",
  },
];

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className={cn("border-y border-[#0f172a]/[0.07] bg-white py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            Getting Started
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            Three steps to thinking like an analyst
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1e293b]/55">
            From sign-up to applying probability theory in under a week.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="relative grid gap-12 md:grid-cols-3 md:gap-8"
        >
          {/* Connector line (desktop only) */}
          <div className="absolute left-0 right-0 top-10 hidden h-px md:block">
            <div className="mx-auto h-full max-w-[66%] bg-gradient-to-r from-transparent via-[#3D2DFF]/20 to-transparent" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.13 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon container */}
              <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#3D2DFF]/15 bg-white shadow-md shadow-[#3D2DFF]/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3D2DFF]/[0.07]">
                  <step.icon className="h-5 w-5 text-[#3D2DFF]" />
                </div>
                {/* Step number badge */}
                <span className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#3D2DFF] text-[11px] font-bold text-white shadow-lg shadow-[#3D2DFF]/30">
                  {parseInt(step.number)}
                </span>
              </div>

              <h3 className="mb-2.5 text-base font-bold text-[#0f172a]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#1e293b]/60">{step.description}</p>
              <p className="mt-3 text-xs font-medium text-[#3D2DFF]">{step.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
