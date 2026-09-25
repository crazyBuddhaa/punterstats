import { cn } from "@/lib/utils";

interface StatsBarProps {
  className?: string;
  courses?: number;
  lessons?: number;
}

export function StatsBar({ className, courses, lessons }: StatsBarProps) {
  const stats = [
    { value: courses ? `${courses}+` : "12+", label: "Published courses" },
    { value: lessons ? `${lessons}+` : "50+", label: "In-depth lessons" },
    { value: "4", label: "Core modules" },
    { value: "0", label: "Betting tips. Ever." },
  ];

  return (
    <section
      className={cn("border-y border-white/[0.06] bg-[#0D1426]", className)}
    >
      <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col gap-1 py-7 sm:py-9",
              // vertical rules between columns
              i % 2 === 1 && "border-l border-white/[0.06] pl-6 sm:pl-8",
              i > 0 && "lg:border-l lg:border-white/[0.06] lg:pl-8",
              i >= 2 && "border-t border-white/[0.06] lg:border-t-0"
            )}
          >
            <dt className="order-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
              {stat.label}
            </dt>
            <dd className="tabular order-1 font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
