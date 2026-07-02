import { cn } from "@/lib/utils";

const stats = [
  { value: "12+", label: "Course modules" },
  { value: "50+", label: "Probability lessons" },
  { value: "4", label: "Core disciplines" },
  { value: "100%", label: "Education focused" },
];

interface StatsBarProps {
  className?: string;
}

export function StatsBar({ className }: StatsBarProps) {
  return (
    <section
      className={cn(
        "border-y border-[#0f172a]/10 bg-white py-10 sm:py-12",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[#1e293b]/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
