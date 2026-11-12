"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DistributionResult } from "@/lib/simulation/monte-carlo";

const STARTING = 10_000;
const RUNS = 1000;

function BandTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const p90v = payload.find((p) => p.name === "p90")?.value;
  const medianv = payload.find((p) => p.name === "median")?.value;
  const p10v = payload.find((p) => p.name === "p10")?.value;
  const fmt = (n?: number) =>
    n !== undefined
      ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : "—";
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-[#0f172a]">Bet #{label}</p>
      <p className="text-emerald-600">Best 10%: {fmt(p90v)}</p>
      <p className="font-semibold text-[#0f172a]">Median: {fmt(medianv)}</p>
      <p className="text-red-500">Worst 10%: {fmt(p10v)}</p>
    </div>
  );
}

export default function ProbabilitySimulatorCharts({
  results,
  numBets,
}: {
  results: DistributionResult;
  numBets: number;
}) {
  return (
    <>
      {/* Band chart */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-[#0f172a]">Balance Over Time</h3>
        <p className="mb-5 text-xs text-[#1e293b]/50">
          The shaded band shows the 10th–90th percentile range. The dark line is the median
          outcome across all {RUNS} runs.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={results.balanceHistory}
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="bet"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<BandTooltip />} />
            <ReferenceLine y={STARTING} stroke="#94a3b8" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="p90"
              name="p90"
              stroke="none"
              fill="url(#bandGrad)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="p10"
              name="p10"
              stroke="none"
              fill="#fff"
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="median"
              name="median"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sample runs */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-[#0f172a]">
          Sample Individual Runs (first 20)
        </h3>
        <p className="mb-5 text-xs text-[#1e293b]/50">
          Each line is one independent simulation path. Notice how dramatically outcomes differ
          even with identical parameters — this is variance.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="bet"
              type="number"
              domain={[0, numBets]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
            />
            <ReferenceLine y={STARTING} stroke="#94a3b8" strokeDasharray="4 4" />
            {results.trials.slice(0, 20).map((trial, i) => (
              <Line
                key={i}
                data={trial.points}
                type="monotone"
                dataKey="balance"
                stroke={trial.finalBalance >= STARTING ? "#0d9488" : "#f43f5e"}
                strokeWidth={1}
                strokeOpacity={0.4}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
