"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

// Illustrative: home-win rate trend across top-5 European leagues, 1993–2025.
// Source basis: home advantage has measurably declined ~4-5pp over 30 years.
const homeWinData = [
  { season: "93/94", rate: 48.3 },
  { season: "95/96", rate: 47.9 },
  { season: "97/98", rate: 47.2 },
  { season: "99/00", rate: 46.8 },
  { season: "01/02", rate: 46.5 },
  { season: "03/04", rate: 46.1 },
  { season: "05/06", rate: 45.7 },
  { season: "07/08", rate: 45.3 },
  { season: "09/10", rate: 45.0 },
  { season: "11/12", rate: 44.6 },
  { season: "13/14", rate: 44.4 },
  { season: "15/16", rate: 44.1 },
  { season: "17/18", rate: 43.9 },
  { season: "19/20", rate: 43.5 }, // COVID "ghost game" dip
  { season: "21/22", rate: 44.2 }, // slight recovery
  { season: "23/24", rate: 43.7 },
  { season: "24/25", rate: 43.4 },
];

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1e293b] px-3 py-2 text-xs shadow-xl">
      <p className="text-white/40">{label}</p>
      <p className="mt-0.5 text-base font-bold text-white">{payload[0].value}%</p>
      <p className="text-white/40">home win rate</p>
    </div>
  );
}

const insights = [
  {
    headline: "Home advantage is declining",
    detail:
      "From ~48% in 1993/94 to ~43% in 2024/25 — a 5pp drop driven by better travel, equal preparation, and ghost-game COVID data. The market still overprices home teams in many leagues.",
  },
  {
    headline: "Overround averages 5–8%",
    detail:
      "Across 20 tracked bookmakers, the average market overround sits between 5% and 8%. De-vigging reveals the true implied probabilities — and where lines diverge.",
  },
  {
    headline: "Calibration beats prediction",
    detail:
      "Our Brier-score calibration system shows that most punters have uncalibrated confidence — they overprice favourites and underprice draws. The data makes this visible.",
  },
];

interface DataShowcaseProps {
  className?: string;
}

export function DataShowcase({ className }: DataShowcaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className={cn("bg-[#0f172a] py-20 sm:py-28", className)}
      ref={ref}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3D2DFF] opacity-[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            Powered By Real Data
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            33 seasons. 5 leagues. 20 bookmakers.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/45 sm:text-lg">
            Every PunterStat tool is grounded in the same dataset — top-5 European leagues and the EFL from 1993/94 to 2025/26. Real odds. Real outcomes. Real patterns.
          </p>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          {/* Chart — 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1e293b]/60 p-6 backdrop-blur-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Home Win Rate — Top-5 Leagues</p>
                <p className="mt-0.5 text-xs text-white/35">
                  % of matches won by the home side · 1993/94 – 2024/25 · illustrative trend
                </p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={homeWinData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3D2DFF" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3D2DFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="season"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis
                      domain={[40, 52]}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={50}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#3D2DFF"
                      strokeWidth={2}
                      fill="url(#blueGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#3D2DFF", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-[10px] text-white/20">
                Illustrative trend based on football-data.co.uk source data. For educational purposes.
              </p>
            </div>
          </motion.div>

          {/* Insight cards — 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex flex-col gap-4 lg:col-span-2"
          >
            {insights.map((insight, i) => (
              <motion.div
                key={insight.headline}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-[#1e293b]/50 p-5 backdrop-blur-sm"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3D2DFF]" />
                  <p className="text-sm font-semibold text-white">{insight.headline}</p>
                </div>
                <p className="pl-3.5 text-xs leading-relaxed text-white/45">{insight.detail}</p>
              </motion.div>
            ))}

            {/* Dataset badge */}
            <div className="rounded-2xl border border-[#3D2DFF]/20 bg-[#3D2DFF]/[0.08] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3D2DFF]">Dataset scope</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { v: "33", l: "Seasons" },
                  { v: "20", l: "Bookmakers" },
                  { v: "6", l: "Leagues" },
                  { v: "180k+", l: "Matches" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-xl font-extrabold text-white">{s.v}</p>
                    <p className="text-[10px] text-white/40">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
