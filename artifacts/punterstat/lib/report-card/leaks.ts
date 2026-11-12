/**
 * Betting Report Card — Leak-to-Lesson mapping.
 *
 * Maps each analytical leak identifier to an existing Betting Academy
 * topic/module/lesson slug triple verified against supabase/migrations/003–036.
 * Never invents slugs.
 */

export type LeakId =
  | "longshot_bias"
  | "accumulator_drain"
  | "chasing_losses"
  | "stake_spikes"
  | "negative_clv"
  | "poor_calibration"
  | "weak_market_segment"
  | "oversized_stakes_underperforming"
  | "missing_closing_odds";

export type LeakSeverity = "high" | "medium" | "low";

export interface LeakLessonMapping {
  id: LeakId;
  title: string;
  topicSlug: string;
  moduleSlug: string;
  /** Individual lesson slug within the module (or null when linking to topic/module). */
  lessonSlug: string;
  /** Full path slug `<topic>/<module>/<lesson>` for compact display/storage. */
  fullSlug: string;
  /** Full Next.js route in Betting Academy. */
  href: string;
  lessonTitle: string;
}

export interface ReportCardLeak {
  id: LeakId;
  severity: LeakSeverity;
  message: string;
  /** Verified lesson slug path (`<topic>/<module>/<lesson>`). */
  lessonSlug: string;
  lessonTitle: string;
  lessonHref: string;
  sampleSize: number;
}

export const LEAK_LESSON_MAP: Record<LeakId, LeakLessonMapping> = {
  longshot_bias: {
    id: "longshot_bias",
    title: "High-odds drag (longshot bias)",
    topicSlug: "probability-and-value",
    moduleSlug: "finding-value-bets",
    lessonSlug: "value-at-different-odds-ranges",
    fullSlug: "probability-and-value/finding-value-bets/value-at-different-odds-ranges",
    href: "/betting-academy/probability-and-value/finding-value-bets/value-at-different-odds-ranges",
    lessonTitle: "Value at Different Odds Ranges",
  },
  accumulator_drain: {
    id: "accumulator_drain",
    title: "Compounded margin in accumulators",
    topicSlug: "bet-types",
    moduleSlug: "singles-doubles-accumulators",
    lessonSlug: "accumulators-mechanics-myths",
    fullSlug: "bet-types/singles-doubles-accumulators/accumulators-mechanics-myths",
    href: "/betting-academy/bet-types/singles-doubles-accumulators/accumulators-mechanics-myths",
    lessonTitle: "Accumulators: Mechanics and Myths",
  },
  chasing_losses: {
    id: "chasing_losses",
    title: "Stake increases after loss streaks",
    topicSlug: "betting-psychology",
    moduleSlug: "discipline-and-record-keeping",
    lessonSlug: "tilt-chasing-and-knowing-when-to-stop",
    fullSlug: "betting-psychology/discipline-and-record-keeping/tilt-chasing-and-knowing-when-to-stop",
    href: "/betting-academy/betting-psychology/discipline-and-record-keeping/tilt-chasing-and-knowing-when-to-stop",
    lessonTitle: "Tilt, Chasing & Knowing When to Stop",
  },
  stake_spikes: {
    id: "stake_spikes",
    title: "Erratic stake spikes (>3x median)",
    topicSlug: "bankroll-management",
    moduleSlug: "staking-strategies",
    lessonSlug: "flat-staking-foundation",
    fullSlug: "bankroll-management/staking-strategies/flat-staking-foundation",
    href: "/betting-academy/bankroll-management/staking-strategies/flat-staking-foundation",
    lessonTitle: "Flat Staking: The Foundation",
  },
  negative_clv: {
    id: "negative_clv",
    title: "Taking prices worse than the closing line",
    topicSlug: "market-dynamics",
    moduleSlug: "sharp-vs-recreational-money",
    lessonSlug: "the-closing-line-and-why-it-matters",
    fullSlug: "market-dynamics/sharp-vs-recreational-money/the-closing-line-and-why-it-matters",
    href: "/betting-academy/market-dynamics/sharp-vs-recreational-money/the-closing-line-and-why-it-matters",
    lessonTitle: "The Closing Line & Why It Matters",
  },
  poor_calibration: {
    id: "poor_calibration",
    title: "Miscalibrated probability estimates",
    topicSlug: "probability-and-value",
    moduleSlug: "implied-probability-explained",
    lessonSlug: "calibrating-probability-estimates",
    fullSlug: "probability-and-value/implied-probability-explained/calibrating-probability-estimates",
    href: "/betting-academy/probability-and-value/implied-probability-explained/calibrating-probability-estimates",
    lessonTitle: "Calibrating Your Probability Estimates",
  },
  weak_market_segment: {
    id: "weak_market_segment",
    title: "Heavy drag in a specific market",
    topicSlug: "odds-and-markets",
    moduleSlug: "how-bookmaker-margins-work",
    lessonSlug: "margin-aware-market-selection",
    fullSlug: "odds-and-markets/how-bookmaker-margins-work/margin-aware-market-selection",
    href: "/betting-academy/odds-and-markets/how-bookmaker-margins-work/margin-aware-market-selection",
    lessonTitle: "Margin-Aware Market Selection",
  },
  oversized_stakes_underperforming: {
    id: "oversized_stakes_underperforming",
    title: "Largest stakes underperforming smaller stakes",
    topicSlug: "bankroll-management",
    moduleSlug: "psychology-of-stake-sizing",
    lessonSlug: "why-humans-bad-at-stake-sizing",
    fullSlug: "bankroll-management/psychology-of-stake-sizing/why-humans-bad-at-stake-sizing",
    href: "/betting-academy/bankroll-management/psychology-of-stake-sizing/why-humans-bad-at-stake-sizing",
    lessonTitle: "Why Humans Are Bad at Stake Sizing",
  },
  missing_closing_odds: {
    id: "missing_closing_odds",
    title: "Closing odds rarely recorded",
    topicSlug: "betting-psychology",
    moduleSlug: "discipline-and-record-keeping",
    lessonSlug: "why-records-change-everything",
    fullSlug: "betting-psychology/discipline-and-record-keeping/why-records-change-everything",
    href: "/betting-academy/betting-psychology/discipline-and-record-keeping/why-records-change-everything",
    lessonTitle: "Why Records Change Everything",
  },
};

export function getLeakLesson(id: LeakId): LeakLessonMapping {
  return LEAK_LESSON_MAP[id];
}

/**
 * Documented curriculum gaps where a leak maps to the closest general lesson
 * rather than a dedicated narrow lesson.
 */
export const LESSON_MAPPING_GAPS: ReadonlyArray<{
  leakId: LeakId;
  mappedTo: string;
  gapNote: string;
}> = [
  {
    leakId: "missing_closing_odds",
    mappedTo: "/betting-academy/betting-psychology/discipline-and-record-keeping/why-records-change-everything",
    gapNote:
      "why-records-change-everything covers logging fundamentals, but does not have a dedicated step-by-step guide on how and when to capture kick-off closing odds for CLV tracking.",
  },
];
