import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  suffix?: string;
  note?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-teal-600",
  iconBg = "bg-teal-50",
  suffix,
  note,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className={`inline-flex w-fit rounded-xl p-2.5 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0f172a]">
          {value}
          {suffix && <span className="ml-1 text-base font-normal text-[#1e293b]/50">{suffix}</span>}
        </p>
        <p className="mt-0.5 text-sm text-[#1e293b]/60">{label}</p>
        {note && <p className="mt-1 text-xs text-[#1e293b]/40">{note}</p>}
      </div>
    </div>
  );
}
