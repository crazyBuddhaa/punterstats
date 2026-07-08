"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const STATS: StatItem[] = [
  { value: 33,      suffix: "",    label: "Seasons of data",       description: "1993/94 – 2025/26" },
  { value: 400,     suffix: "+",   label: "Published lessons",     description: "Across 4 core modules" },
  { value: 20,      suffix: "",    label: "Bookmakers tracked",    description: "Per match, per season" },
  { value: 180000,  suffix: "+",   label: "Historical matches",    description: "Top-5 leagues + EFL" },
  { value: 5,       suffix: "",    label: "European leagues",      description: "Premier League to La Liga" },
];

function CountUp({ target, suffix, trigger }: { target: number; suffix: string; trigger: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    const duration = 1400;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [trigger, target]);

  const display =
    target >= 1000
      ? `${(count / 1000).toFixed(count >= target ? 0 : 1)}k`
      : count.toString();

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

interface StatsBarProps {
  className?: string;
  courses?: number;
  lessons?: number;
}

export function StatsBar({ className }: StatsBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={cn(
        "border-y border-[#3D2DFF]/10 bg-[#0a0f1e] py-10 sm:py-14",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center text-center",
                /* hide last item on 2-col mobile so grid stays even */
                i === STATS.length - 1 && "col-span-2 sm:col-span-1"
              )}
            >
              <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <CountUp target={stat.value} suffix={stat.suffix} trigger={triggered} />
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white/70">{stat.label}</p>
              <p className="mt-0.5 text-xs text-white/30">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
