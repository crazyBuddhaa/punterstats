"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const money = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

function CurveTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-[#1e293b]/50">{label}</p>
      <p className="font-semibold tabular-nums text-[#0f172a]">
        {v >= 0 ? "+" : ""}
        {money(v)}
      </p>
    </div>
  );
}

export default function BetTrackerChart({
  data,
}: {
  data: { label: string; profit: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Tooltip content={<CurveTooltip />} cursor={{ stroke: "#cbd5e1" }} />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#3D2DFF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
