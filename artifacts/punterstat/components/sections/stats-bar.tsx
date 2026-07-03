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
    { value: "100%", label: "Education focused" },
  ];

  return (
    <section className={cn("border-y border-[#0f172a]/10 bg-white py-10 sm:py-12", className)}>
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
