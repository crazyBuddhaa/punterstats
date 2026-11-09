import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  CircleGauge,
  LineChart,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  courses: number;
  lessons: number;
  isAuthenticated: boolean;
}

const analysisSignals = [
  { label: "Home win", value: "48%", width: "48%", tone: "bg-[#3D2DFF]" },
  { label: "Draw", value: "27%", width: "27%", tone: "bg-white/50" },
  { label: "Away win", value: "25%", width: "25%", tone: "bg-[#7C70FF]" },
];

const pillars = [
  {
    number: "01",
    icon: BarChart3,
    eyebrow: "BET ANALYSIS",
    title: "See the match beyond the odds.",
    description:
      "Form, head-to-head, model probabilities and market prices in one calm, readable view.",
    href: "/bet-analysis",
    accent: "text-[#3D2DFF]",
  },
  {
    number: "02",
    icon: BrainCircuit,
    eyebrow: "BET LEARNING",
    title: "Build a sharper football brain.",
    description:
      "Practical lessons that turn probability, value and bankroll management into second nature.",
    href: "/bet-learning",
    accent: "text-[#6B5FFF]",
  },
  {
    number: "03",
    icon: Target,
    eyebrow: "BET ASSIST",
    title: "Make the process repeatable.",
    description:
      "Check slips, run calculators and keep an honest record of what actually works for you.",
    href: "/bet-assist",
    accent: "text-[#3D2DFF]",
  },
];

export function LandingPage({ courses, lessons, isAuthenticated }: LandingPageProps) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/register";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start for free";

  return (
    <div className="landing-page bg-[#f5f6fc] text-[#080c1d]">
      <section className="relative overflow-hidden bg-[#080c1d] text-[#f5f6fc]">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(61,45,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(61,45,255,.22)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#3D2DFF]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-[620px] w-[620px] rounded-full bg-[#6B5FFF]/15 blur-3xl" />

        <div className="relative mx-auto grid min-h-[700px] max-w-[1440px] items-center gap-12 px-5 pb-20 pt-16 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:px-16 lg:pb-24 lg:pt-24">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#7C70FF]">
              <span className="h-2 w-2 rounded-full bg-[#3D2DFF] shadow-[0_0_16px_rgba(61,45,255,.9)]" />
              Football intelligence, without the noise
            </div>

            <h1 className="max-w-3xl text-[clamp(3.8rem,8vw,8.25rem)] font-black leading-[0.86] tracking-[-0.075em]">
              Read the
              <span className="block text-[#6B5FFF]">game.</span>
              Then decide.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              Learn the maths of betting, analyse matches with transparent probabilities,
              and check your slips with calculators and a tracker. We don&apos;t take bets
              and we don&apos;t give tips.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#3D2DFF] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(61,45,255,0.4)] transition hover:bg-white hover:text-[#080c1d]"
              >
                {primaryLabel}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/bet-assist/slip-checker"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:border-[#6B5FFF]/70 hover:text-[#7C70FF]"
              >
                Explore the tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-5 text-xs text-white/45">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#7C70FF]" /> Free to start
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span>18+ · Gamble responsibly</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:ml-auto">
            <div className="absolute -right-4 -top-10 z-20 hidden rounded-full border border-[#6B5FFF]/40 bg-[#111736] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C70FF] shadow-2xl sm:block">
              Match intelligence / 01
            </div>
            <div className="relative aspect-[0.92] overflow-hidden rounded-[2rem] border border-white/15 bg-[#111736] shadow-[0_30px_90px_rgba(0,0,0,.45)] sm:aspect-[1.08]">
              <Image
                src="/hero-pitch.jpg"
                alt="Footballer controlling a ball on a vivid green pitch"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#080c1d]/90 via-[#080c1d]/20 to-[#3D2DFF]/20" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#080c1d]/85 p-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C70FF]">
                      Tonight&apos;s readout
                    </p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-white">
                      Liverpool <span className="text-white/35">vs</span> Arsenal
                    </p>
                  </div>
                  <span className="rounded-full bg-[#3D2DFF]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9990FF]">
                    Edge found
                  </span>
                </div>
                <div className="space-y-2.5">
                  {analysisSignals.map((signal) => (
                    <div key={signal.label} className="flex items-center gap-3 text-xs">
                      <span className="w-16 shrink-0 text-white/55">{signal.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${signal.tone}`} style={{ width: signal.width }} />
                      </div>
                      <span className="w-8 text-right font-bold text-white">{signal.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-5 hidden h-28 w-28 overflow-hidden rounded-2xl border-4 border-[#080c1d] shadow-2xl sm:block">
              <Image
                src="/football-sketch.jpg"
                alt=""
                fill
                sizes="112px"
                className="object-cover grayscale"
              />
            </div>
            <div className="absolute -left-8 top-16 hidden h-20 w-20 overflow-hidden rounded-2xl border-4 border-[#080c1d] shadow-2xl md:block">
              <Image
                src="/hero-stadium.jpg"
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-3 bottom-12 flex h-16 w-16 rotate-6 items-center justify-center rounded-2xl bg-[#3D2DFF] text-white shadow-xl sm:-right-6">
              <Zap className="h-7 w-7 fill-current" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#3D2DFF]">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-white/15 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10 lg:px-16">
          {[
            { value: courses ? `${courses}+` : "12+", label: "courses to sharpen your thinking" },
            { value: lessons ? `${lessons}+` : "50+", label: "lessons from odds to bankrolls" },
            { value: "01", label: "repeatable workflow from read to record" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-4 py-6 sm:px-8 sm:py-8 first:sm:pl-0 last:sm:pr-0">
              <span className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">{stat.value}</span>
              <span className="max-w-[180px] text-xs font-bold uppercase leading-4 tracking-[0.08em] text-white/75">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="grid items-end gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.28em] text-[#3D2DFF]">
              A better pre-match habit
            </p>
            <h2 className="max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              The edge is in the process.
            </h2>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-lg leading-8 text-[#080c1d]/60">
              No hot takes. No tips. PunterStat gives you a clean way to
              understand a fixture, interrogate a price and keep score over time.
            </p>
            <Link href="/match-breakdown" className="group mt-6 inline-flex items-center gap-2 text-sm font-black text-[#3D2DFF]">
              See match analysis <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#080c1d] p-6 text-white sm:p-9">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-50">
              <Image src="/football-action.jpg" alt="" fill sizes="40vw" className="object-cover object-center mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080c1d] via-[#080c1d]/50 to-transparent" />
            </div>
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C70FF]">
                <CircleGauge className="h-4 w-4" /> Match breakdown
              </div>
              <h3 className="mt-6 text-3xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
                Turn a fixture into a decision map.
              </h3>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
                Compare what the model sees with what the market is offering. Save the
                readout and come back to it when the result is in.
              </p>
              <div className="mt-10 grid max-w-sm grid-cols-3 gap-2">
                {[
                  { label: "Form", value: "W W D W", color: "text-[#7C70FF]" },
                  { label: "Goals", value: "2.8", color: "text-white" },
                  { label: "Value", value: "+6.4%", color: "text-[#38BDF8]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{item.label}</p>
                    <p className={`mt-2 text-sm font-black ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 right-6 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/35 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D2DFF]" /> Example readout
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col justify-between rounded-[2rem] border border-[#080c1d]/10 bg-white p-6 sm:p-9">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3D2DFF]/10 text-[#3D2DFF]">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="mt-7 max-w-xs text-3xl font-black leading-none tracking-[-0.05em]">
                Keep the receipts.
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#080c1d]/55">
                Your bet tracker turns scattered slips into a useful record of strike
                rate, ROI, closing-line value and decision quality.
              </p>
            </div>
            <div className="mt-12">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#080c1d]/40">Sample ROI</span>
                <span className="text-3xl font-black tracking-[-0.06em] text-[#080c1d]">+18.6%</span>
              </div>
              <div className="flex h-20 items-end gap-1.5">
                {[32, 44, 38, 52, 48, 64, 57, 72, 68, 84, 78, 96].map((height, index) => (
                  <div
                    key={height + index}
                    className={`flex-1 rounded-t-sm ${index > 8 ? "bg-[#3D2DFF]" : "bg-[#080c1d]/12"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#080c1d]/35">
                <span>Week 01</span><span>Week 12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#eaedfa]">
        <div className="mx-auto grid max-w-[1440px] items-stretch lg:grid-cols-[.8fr_1.2fr]">
          <div className="flex flex-col justify-center px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.28em] text-[#3D2DFF]">Built for curious punters</p>
            <h2 className="max-w-lg text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              Learn enough to trust your own process.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#080c1d]/60">
              Start with the basics, go deeper into the numbers and apply each idea
              immediately to the matches you follow.
            </p>
            <Link href="/bet-learning" className="group mt-8 inline-flex items-center gap-2 text-sm font-black text-[#3D2DFF]">
              Browse the learning hub <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-[#19214a] lg:min-h-[580px]">
            <Image
              src="/sport-collage.jpg"
              alt="Athletes from football, basketball, tennis and other sports"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center mix-blend-luminosity opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eaedfa] via-transparent to-[#080c1d]/25 lg:w-1/3" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between sm:bottom-10 sm:left-10 sm:right-10">
              <div className="rounded-2xl border border-white/30 bg-[#080c1d]/75 p-4 text-white backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C70FF]">The academy</p>
                <p className="mt-1 text-lg font-black">From hunches to hypotheses.</p>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-[#3D2DFF] text-white shadow-lg sm:flex">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.28em] text-[#3D2DFF]">One platform, three angles</p>
            <h2 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              Use the part of PunterStat you need today.
            </h2>
          </div>
          <Sparkles className="hidden h-12 w-12 text-[#3D2DFF] lg:block" />
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.number}
                href={pillar.href}
                className="group flex min-h-[310px] flex-col rounded-[1.75rem] border border-[#080c1d]/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#3D2DFF]/35 hover:shadow-[0_20px_50px_rgba(61,45,255,.08)] sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-7 w-7 ${pillar.accent}`} />
                  <span className="text-xs font-black tracking-widest text-[#080c1d]/30">{pillar.number}</span>
                </div>
                <p className="mt-12 text-[10px] font-black tracking-[0.22em] text-[#080c1d]/45">{pillar.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-black leading-none tracking-[-0.04em]">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#080c1d]/55">{pillar.description}</p>
                <span className="mt-auto flex items-center gap-2 pt-8 text-sm font-black text-[#3D2DFF]">
                  Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#3D2DFF] px-5 py-24 text-white sm:px-10 sm:py-32 lg:px-16">
        <div className="pointer-events-none absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full border-[70px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[430px] w-[430px] rounded-full border-[1px] border-white/20" />
        <div className="relative mx-auto max-w-[1120px] text-center">
          <TrendingUp className="mx-auto mb-7 h-10 w-10 text-white" />
          <h2 className="mx-auto max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl">
            Don&apos;t chase certainty.
            <span className="block text-white/80">Build clarity.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
            Start with one match, one lesson or one better question. The rest of the
            workflow is ready when you are.
          </p>
          <Link
            href={primaryHref}
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-[#080c1d] transition hover:bg-[#080c1d] hover:text-white"
          >
            {primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
            18+ · We don&apos;t take bets or hold funds · Gamble responsibly
          </p>
        </div>
      </section>
    </div>
  );
}