import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { weeklyReportEmail } from "@/lib/email/templates";
import { computeReportCard } from "@/lib/report-card/metrics";
import type { BetStatus, JournalBet } from "@/lib/bet-assist/journal";

const BATCH_SIZE = 10;
const OVERALL_TIMEOUT_MS = 25_000;
const PER_USER_TIMEOUT_MS = 8_000;

function rowToJournalBet(r: Record<string, unknown>): JournalBet {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  const rawLegs = num(r.leg_count);
  return {
    id: r.id as string,
    placedAt: r.placed_at as string,
    sport: r.sport as string,
    eventName: r.event_name as string,
    market: r.market as string,
    selection: r.selection as string,
    bookmaker: (r.bookmaker as string | null) ?? null,
    odds: Number(r.odds),
    stake: Number(r.stake),
    yourProb: num(r.your_prob),
    closingOdds: num(r.closing_odds),
    status: r.status as BetStatus,
    cashoutAmount: num(r.cashout_amount),
    notes: (r.notes as string | null) ?? null,
    settledAt: (r.settled_at as string | null) ?? null,
    legCount: rawLegs !== null && rawLegs >= 1 ? Math.round(rawLegs) : 1,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout (${ms}ms): ${label}`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export interface WeeklyReportJobResult {
  startedAt: string;
  completedAt: string;
  eligibleUsers: number;
  sent: number;
  failed: number;
  timedOut: boolean;
}

/**
 * Finds users with weekly_report = true and at least 1 bet in the last 14 days,
 * computes their last-7-days vs previous-7-days Report Card, and dispatches
 * the weekly summary email via Resend in batches with per-user timeout + try/catch.
 */
export async function runWeeklyReportJob(): Promise<WeeklyReportJobResult> {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const sevenDaysAgoIso = new Date(startedAtMs - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgoIso = new Date(startedAtMs - 14 * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminClient();

  // 1. Find users with at least 1 bet in the last 14 days
  const { data: recentRows, error: recentErr } = await admin
    .from("bet_journal")
    .select("user_id")
    .gte("placed_at", fourteenDaysAgoIso);

  if (recentErr) {
    throw new Error(`Failed to query recent bet_journal rows: ${recentErr.message}`);
  }

  const activeUserIds = [...new Set((recentRows ?? []).map((r) => r.user_id as string))];
  if (activeUserIds.length === 0) {
    return {
      startedAt,
      completedAt: new Date().toISOString(),
      eligibleUsers: 0,
      sent: 0,
      failed: 0,
      timedOut: false,
    };
  }

  // 2. Ensure email_preferences rows exist for active users (default weekly_report = true)
  await admin
    .from("email_preferences")
    .upsert(
      activeUserIds.map((id) => ({ user_id: id })),
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  // 3. Filter to users with weekly_report = true
  const { data: prefs, error: prefsErr } = await admin
    .from("email_preferences")
    .select("user_id, unsubscribe_token, weekly_report")
    .in("user_id", activeUserIds)
    .eq("weekly_report", true);

  if (prefsErr) {
    throw new Error(`Failed to query email_preferences: ${prefsErr.message}`);
  }

  const eligiblePrefs = prefs ?? [];
  let sent = 0;
  let failed = 0;
  let timedOut = false;

  for (let i = 0; i < eligiblePrefs.length; i += BATCH_SIZE) {
    if (Date.now() - startedAtMs >= OVERALL_TIMEOUT_MS) {
      timedOut = true;
      break;
    }

    const batch = eligiblePrefs.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (pref) => {
        const userId = pref.user_id as string;
        const unsubscribeToken = pref.unsubscribe_token as string;

        try {
          await withTimeout(
            (async () => {
              const [userRes, profileRes, betsRes] = await Promise.all([
                admin.auth.admin.getUserById(userId),
                admin
                  .from("profiles")
                  .select("display_name")
                  .eq("user_id", userId)
                  .maybeSingle(),
                admin
                  .from("bet_journal")
                  .select("*")
                  .eq("user_id", userId)
                  .order("placed_at", { ascending: false })
                  .limit(1000),
              ]);

              const email = userRes.data?.user?.email;
              if (!email) return;

              const displayName =
                (profileRes.data?.display_name as string | null) ??
                email.split("@")[0] ??
                "there";

              const allBets = (betsRes.data ?? []).map(rowToJournalBet);
              const last7Bets = allBets.filter(
                (b) => (b.settledAt ?? b.placedAt) >= sevenDaysAgoIso,
              );
              const prev7Bets = allBets.filter((b) => {
                const ts = b.settledAt ?? b.placedAt;
                return ts >= fourteenDaysAgoIso && ts < sevenDaysAgoIso;
              });

              const cardLast7 = computeReportCard(last7Bets);
              const cardPrev7 = computeReportCard(prev7Bets);
              const cardOverall = computeReportCard(allBets);
              const topLeak = cardLast7.leaks[0] ?? cardOverall.leaks[0] ?? null;

              const template = weeklyReportEmail({
                displayName,
                settledLast7: cardLast7.settledBets,
                roiLast7: cardLast7.roi,
                profitLast7: cardLast7.profit,
                strikeRateLast7: cardLast7.strikeRate,
                settledPrev7: cardPrev7.settledBets,
                roiPrev7: cardPrev7.roi,
                topLeak: topLeak
                  ? {
                      message: topLeak.message,
                      lessonTitle: topLeak.lessonTitle,
                      lessonHref: topLeak.lessonHref,
                    }
                  : null,
                unsubscribeToken,
              });

              const sendRes = await sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
                text: template.text,
              });

              if (sendRes.success) {
                sent += 1;
              } else {
                failed += 1;
              }
            })(),
            PER_USER_TIMEOUT_MS,
            `weekly-report:${userId}`,
          );
        } catch (userErr) {
          failed += 1;
          console.error(
            `[cron/weekly-report] user ${userId} failed:`,
            userErr instanceof Error ? userErr.message : String(userErr),
          );
        }
      }),
    );
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    eligibleUsers: eligiblePrefs.length,
    sent,
    failed,
    timedOut,
  };
}
