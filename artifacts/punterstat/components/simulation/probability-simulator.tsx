"use client";

import { useState, useCallback } from "react";
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
import { AlertCircle, BarChart2, TrendingDown, TrendingUp } from "lucide-react";

interface SimPoint {
  bet: number;
  balance: number;
}

interface RunResult {
  points: SimPoint[];
  finalBalance: number;
}

interface SimResults {
  runs: RunResult[];
  median: number;
  mean: number;
  ruinRate: number;
  profitRate: number;
  p10: number;
  p90: number;
  balanceHistory: { bet: number; median: number; p10: number; p90: number }[];
}

const RUNS = 200;
const STARTING = 10_000;

function runSimulation(
  decimalOdds: number,
  winPct: number,
  numBets: number,
  stakePerBet: number
): SimResults {
  const winProb = winPct / 100;
  const allRuns: RunResult[] = [];

  for (let r = 0; r < RUNS; r++) {
    let balance = STARTING;
    const points: SimPoint[] = [{ bet: 0, balance: STARTING }];

    for (let b = 1; b <= numBets; b++) {
      if (balance <= 0) {
        points.push({ bet: b, balance: 0 });
        continue;
      }
      const actualStake = Math.min(stakePerBet, balance);
      const win = Math.random() < winProb;
      balance = win
        ? parseFloat((balance + (decimalOdds - 1) * actualStake).toFixed(2))
        : parseFloat((balance - actualStake).toFixed(2));
      balance = Math.max(0, balance);
      points.push({ bet: b, balance });
    }

    allRuns.push({ points, finalBalance: balance });
  }

  const finals = allRuns.map((r) => r.finalBalance).sort((a, b) => a - b);
  const median = finals[Math.floor(RUNS / 2)];
  const mean = finals.reduce((s, v) => s + v, 0) / RUNS;
  const ruinRate = (finals.filter((v) => v <= 0).length / RUNS) * 100;
  const profitRate = (finals.filter((v) => v > STARTING).length / RUNS) * 100;
  const p10 = finals[Math.floor(RUNS * 0.1)];
  const p90 = finals[Math.floor(RUNS * 0.9)];

  const balanceHistory = Array.from({ length: numBets + 1 }, (_, i) => {
    const vals = allRuns
      .map((r) => r.points[i]?.balance ?? r.finalBalance)
      .sort((a, b) => a - b);
    return {
      bet: i,
      median: vals[Math.floor(RUNS / 2)],
      p10: vals[Math.floor(RUNS * 0.1)],
      p90: vals[Math.floor(RUNS * 0.9)],
    };
  });

  return { runs: allRuns, median, mean, ruinRate, profitRate, p10, p90, balanceHistory };
}

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

export function ProbabilitySimulator() {
  const [oddsInput, setOddsInput] = useState("2.00");
  const [winPctInput, setWinPctInput] = useState("45");
  const [numBetsInput, setNumBetsInput] = useState("100");
  const [stakeInput, setStakeInput] = useState("500");
  const [results, setResults] = useState<SimResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const runSim = useCallback(async () => {
    setError(null);
    const odds = parseFloat(oddsInput);
    const winPct = parseFloat(winPctInput);
    const numBets = parseInt(numBetsInput, 10);
    const stake = parseFloat(stakeInput);

    if (isNaN(odds) || odds < 1.01) { setError("Odds must be ≥ 1.01."); return; }
    if (isNaN(winPct) || winPct <= 0 || winPct >= 100) { setError("Win % must be between 1 and 99."); return; }
    if (isNaN(numBets) || numBets < 10 || numBets > 500) { setError("Number of bets must be 10–500."); return; }
    if (isNaN(stake) || stake < 100 || stake > 5000) { setError("Stake must be ₦100–₦5,000."); return; }

    setRunning(true);
    await new Promise((r) => setTimeout(r, 20));
    const res = runSimulation(odds, winPct, numBets, stake);
    setResults(res);
    setRunning(false);
  }, [oddsInput, winPctInput, numBetsInput, stakeInput]);

  const impliedPct =
    parseFloat(oddsInput) > 1 ? (1 / parseFloat(oddsInput)) * 100 : null;

  const edge =
    impliedPct !== null && parseFloat(winPctInput) > 0
      ? parseFloat(winPctInput) - impliedPct
      : null;

  const ev =
    parseFloat(oddsInput) > 1 && parseFloat(winPctInput) > 0
      ? ((parseFloat(winPctInput) / 100) * (parseFloat(oddsInput) - 1) -
          (1 - parseFloat(winPctInput) / 100)) *
        parseFloat(stakeInput)
      : null;

  const fmt = (n: number) =>
    `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-[#0f172a]">Simulation Parameters</h3>
        <p className="mb-5 text-xs text-[#1e293b]/50">
          Enter your assumptions and run {RUNS} Monte Carlo simulations to see the range of
          possible outcomes over time.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Decimal Odds",
              id: "odds",
              value: oddsInput,
              set: setOddsInput,
              hint: impliedPct ? `Implied: ${impliedPct.toFixed(1)}%` : undefined,
              hintColor: undefined,
              step: "0.05",
              min: "1.01",
              max: undefined,
            },
            {
              label: "Your Win % (estimate)",
              id: "win",
              value: winPctInput,
              set: setWinPctInput,
              hint:
                edge !== null
                  ? edge > 0
                    ? `+${edge.toFixed(1)}% edge (positive EV)`
                    : `${edge.toFixed(1)}% edge (negative EV)`
                  : undefined,
              hintColor:
                edge !== null ? (edge > 0 ? "text-emerald-600" : "text-red-500") : undefined,
              step: "1",
              min: "1",
              max: "99",
            },
            {
              label: "Number of Bets",
              id: "bets",
              value: numBetsInput,
              set: setNumBetsInput,
              hint: "10–500",
              hintColor: undefined,
              step: "10",
              min: "10",
              max: "500",
            },
            {
              label: "Stake per Bet (₦)",
              id: "stake",
              value: stakeInput,
              set: setStakeInput,
              hint: "₦100–₦5,000",
              hintColor: undefined,
              step: "100",
              min: "100",
              max: "5000",
            },
          ].map(({ label, id, value, set, hint, hintColor, step, min, max }) => (
            <div key={id}>
              <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">
                {label}
              </label>
              <input
                id={id}
                type="number"
                step={step}
                min={min}
                max={max}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
              />
              {hint && (
                <p className={`mt-1 text-[10px] ${hintColor ?? "text-[#1e293b]/40"}`}>{hint}</p>
              )}
            </div>
          ))}
        </div>

        {ev !== null && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              ev >= 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {ev >= 0 ? (
              <TrendingUp className="h-4 w-4 shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 shrink-0" />
            )}
            <span>
              Expected value per bet:{" "}
              <strong>
                {ev >= 0 ? "+" : ""}₦{ev.toFixed(2)}
              </strong>
              {ev < 0 &&
                " — on average you lose money per bet at these parameters. This is the house edge in action."}
              {ev >= 0 &&
                " — your assumed win rate gives you a positive expected value at these odds."}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={runSim}
          disabled={running}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:opacity-50"
        >
          <BarChart2 className="h-4 w-4" />
          {running ? `Running ${RUNS} simulations…` : `Run ${RUNS} Simulations`}
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Median Final Balance",
                value: fmt(results.median),
                sub: results.median >= STARTING ? "above starting balance" : "below starting balance",
                color: results.median >= STARTING ? "text-emerald-600" : "text-red-500",
              },
              {
                label: "Profitable Runs",
                value: `${results.profitRate.toFixed(1)}%`,
                sub: `of ${RUNS} simulations`,
                color: results.profitRate >= 50 ? "text-emerald-600" : "text-red-500",
              },
              {
                label: "Ruin Rate",
                value: `${results.ruinRate.toFixed(1)}%`,
                sub: "hit ₦0 balance",
                color: results.ruinRate > 20 ? "text-red-500" : "text-[#0f172a]",
              },
              {
                label: "10th Percentile",
                value: fmt(results.p10),
                sub: `90th: ${fmt(results.p90)}`,
                color: "text-[#0f172a]",
              },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">
                  {label}
                </p>
                <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-[#1e293b]/40">{sub}</p>
              </div>
            ))}
          </div>

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
                  domain={[0, parseInt(numBetsInput)]}
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
                {results.runs.slice(0, 20).map((run, i) => (
                  <Line
                    key={i}
                    data={run.points}
                    type="monotone"
                    dataKey="balance"
                    stroke={run.finalBalance >= STARTING ? "#0d9488" : "#f43f5e"}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="mb-1 text-sm font-semibold text-blue-800">What this tells you</p>
            <p className="text-xs leading-relaxed text-blue-700">
              Even when your estimated win rate is higher than implied probability (positive EV),
              variance can produce large losses over short stretches. This is why bankroll
              management and sample size matter. Over {numBetsInput} bets, you can see both ruin
              and significant profit from identical starting conditions — the difference is luck,
              not skill. Understanding this gap between &quot;expected&quot; and &quot;actual&quot;
              is the foundation of disciplined probability thinking.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
