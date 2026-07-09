import { createClient } from "@/lib/supabase/server";
import { scoreCalibration } from "@/lib/calibration/scorer";
import type { ResolvedPrediction } from "@/lib/calibration/scorer";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  type: "lesson" | "tool";
  title: string;
  description: string;
  href: string;
  reason: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type NestedLesson = {
  slug: string;
  courses: {
    slug: string;
    course_categories: { slug: string; section: string } | null;
  } | null;
} | null;

function lessonHref(lesson: NonNullable<NestedLesson>): string | null {
  const { slug: lessonSlug, courses } = lesson;
  if (!courses?.course_categories) return null;
  const { slug: courseSlug, course_categories } = courses;
  const catSlug = course_categories.slug;
  const base =
    course_categories.section === "betting_academy"
      ? "/betting-academy"
      : "/sports-university";
  return `${base}/${catSlug}/${courseSlug}/${lessonSlug}`;
}

// ─── Main function ─────────────────────────────────────────────────────────────

/**
 * Rule-based learning recommendation for the dashboard "Next up" card.
 * Pulls from analytics events, calibration scores, and lesson progress.
 * Returns null when there is genuinely no useful suggestion (e.g. brand-new
 * user with zero activity and zero lessons).
 *
 * Rules applied in priority order:
 * 1. Poor calibration + early in curriculum → ground in probability theory
 * 2. No simulator use, enough lessons done → try Simulation Engine
 * 3. No match analysis saved, past lesson 3 → try Match Breakdown
 * 4. Never visited Spot The Value, past lesson 8 → try it
 * 5. Fallback: resume most recently active in-progress lesson
 */
export async function getRecommendation(userId: string): Promise<Recommendation | null> {
  const supabase = await createClient();

  const [eventsRes, resolvedRes, inProgressRes, completedCountRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("event_name")
      .eq("user_id", userId),
    supabase
      .from("prediction_records")
      .select(
        "predicted_home_win_prob, predicted_draw_prob, predicted_away_win_prob, actual_result",
      )
      .eq("user_id", userId)
      .not("actual_result", "is", null),
    supabase
      .from("lesson_progress")
      .select("lessons(slug, courses(slug, course_categories(slug, section)))")
      .eq("user_id", userId)
      .eq("completed", false)
      .gt("progress_pct", 0)
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
  ]);

  const events = eventsRes.data ?? [];
  const completedCount = completedCountRes.count ?? 0;

  const simulatorRunCount = events.filter((e) => e.event_name === "simulator_run").length;
  const matchAnalysisCount = events.filter(
    (e) => e.event_name === "match_analysis_saved",
  ).length;
  const valueViewedCount = events.filter(
    (e) => e.event_name === "value_comparison_viewed",
  ).length;

  // Calibration signal
  const resolved = (resolvedRes.data ?? []).map((row) => ({
    predictedHomeWinProb: Number(row.predicted_home_win_prob),
    predictedDrawProb: Number(row.predicted_draw_prob),
    predictedAwayWinProb: Number(row.predicted_away_win_prob),
    actualResult: row.actual_result as "home_win" | "draw" | "away_win",
  })) satisfies ResolvedPrediction[];

  const calibration = scoreCalibration(resolved);

  // ── Rule 1: High Brier score + early curriculum ───────────────────────────
  if (calibration.sampleSize >= 5 && calibration.brierScore > 0.65 && completedCount < 10) {
    return {
      type: "lesson",
      title: "Probability & Value",
      description: "Build the mathematical foundation for reading odds correctly.",
      href: "/betting-academy",
      reason:
        "Your calibration scores suggest grounding in probability theory would sharpen your predictions.",
    };
  }

  // ── Rule 2: Never used the simulator, enough lessons to benefit from it ───
  if (simulatorRunCount === 0 && completedCount >= 5) {
    return {
      type: "tool",
      title: "Simulation Engine",
      description: "Practice staking strategies and bankroll management without real money.",
      href: "/simulation-engine",
      reason: `You've completed ${completedCount} lesson${completedCount !== 1 ? "s" : ""} — hands-on simulation reinforces theory faster than more reading.`,
    };
  }

  // ── Rule 3: No match analysis, past the first few lessons ────────────────
  if (matchAnalysisCount === 0 && completedCount >= 3) {
    return {
      type: "tool",
      title: "Match Breakdown",
      description: "Generate probability estimates for an upcoming fixture using the Dixon-Coles model.",
      href: "/match-breakdown",
      reason:
        "Applying probability models to a real fixture is the fastest way to make theory click.",
    };
  }

  // ── Rule 4: Never checked live value, covered enough curriculum ───────────
  if (valueViewedCount === 0 && completedCount >= 8) {
    return {
      type: "tool",
      title: "Spot The Value",
      description: "De-vig live odds and compare them against model-implied probabilities.",
      href: "/spot-the-value",
      reason:
        "You're far enough into the curriculum to start evaluating live market prices against the model.",
    };
  }

  // ── Rule 5: Fallback — resume most recently active lesson ─────────────────
  const inProgressRow = inProgressRes.data?.[0];
  if (inProgressRow) {
    const lesson = inProgressRow.lessons as unknown as NestedLesson;
    if (lesson) {
      const href = lessonHref(lesson);
      if (href) {
        return {
          type: "lesson",
          title: "Continue where you left off",
          description: "Pick up your most recently active lesson.",
          href,
          reason:
            "Consistency beats cramming — picking up where you stopped keeps the momentum.",
        };
      }
    }
  }

  return null;
}
