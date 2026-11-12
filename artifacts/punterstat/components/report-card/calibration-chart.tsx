"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { CalibrationBucket } from "@/lib/calibration/scorer";

interface CalibrationChartProps {
  buckets: CalibrationBucket[];
}

export default function CalibrationChart({ buckets }: CalibrationChartProps) {
  const data = buckets.map((b) => ({
    bucket: b.bucketLabel,
    predicted: Math.round(b.predictedAvg * 1000) / 10,
    actual: Math.round(b.actualFrequency * 1000) / 10,
    sampleSize: b.sampleSize,
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === "predicted" ? "Your avg estimate" : "Actual hit rate",
            ]}
            labelFormatter={(label, payload) => {
              const n = payload?.[0]?.payload?.sampleSize ?? 0;
              return `Bucket ${label} (n=${n})`;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) =>
              value === "predicted" ? "Your avg estimate (%)" : "Actual hit rate (%)"
            }
          />
          <Bar
            dataKey="actual"
            fill="#0d9488"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3D2DFF"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3D2DFF" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
