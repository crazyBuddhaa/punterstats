"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getJournal } from "@/lib/bet-assist/journal-actions";
import { betProfit as calcProfit, betReturn as calcReturn, type JournalBet } from "@/lib/bet-assist/journal";

const TRACKER_PATH = "/dashboard/bet-tracker";
const REPORT_CARD_PATH = "/dashboard/report-card";
const PROFILE_PATH = "/dashboard/profile";

export interface CsvExportResult {
  success: boolean;
  csv?: string;
  filename?: string;
  count?: number;
  error?: string;
}

export interface SimpleActionResult {
  success: boolean;
  error?: string;
}

function escapeCsvText(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  // Mitigate spreadsheet formula injection on user-supplied text fields
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatBetsToCsv(bets: JournalBet[]): string {
  const headers = [
    "id",
    "placed_at",
    "settled_at",
    "sport",
    "event_name",
    "market",
    "selection",
    "bookmaker",
    "leg_count",
    "odds",
    "stake",
    "your_prob",
    "closing_odds",
    "status",
    "cashout_amount",
    "return_amount",
    "profit",
    "notes",
  ];

  const rows = bets.map((b) => {
    const ret = b.status === "pending" ? "" : calcReturn(b).toFixed(2);
    const prof = b.status === "pending" ? "" : calcProfit(b).toFixed(2);
    return [
      escapeCsvText(b.id),
      escapeCsvText(b.placedAt),
      escapeCsvText(b.settledAt ?? ""),
      escapeCsvText(b.sport),
      escapeCsvText(b.eventName),
      escapeCsvText(b.market),
      escapeCsvText(b.selection),
      escapeCsvText(b.bookmaker ?? ""),
      String(b.legCount ?? 1),
      b.odds.toFixed(3),
      b.stake.toFixed(2),
      b.yourProb !== null ? b.yourProb.toFixed(4) : "",
      b.closingOdds !== null ? b.closingOdds.toFixed(3) : "",
      escapeCsvText(b.status),
      b.cashoutAmount !== null ? b.cashoutAmount.toFixed(2) : "",
      ret,
      prof,
      escapeCsvText(b.notes ?? ""),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * Exports all bets belonging to the currently signed-in user as a CSV string.
 */
export async function exportBetsCsv(): Promise<CsvExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Sign in to export your bets." };
  }

  const bets = await getJournal();
  const csv = formatBetsToCsv(bets);
  const datePart = new Date().toISOString().slice(0, 10);

  return {
    success: true,
    csv,
    filename: `punterstat-bets-${datePart}.csv`,
    count: bets.length,
  };
}

/**
 * Deletes all bets belonging to the currently signed-in user.
 */
export async function deleteAllBets(): Promise<SimpleActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Sign in to manage your bets." };
  }

  const { error } = await supabase
    .from("bet_journal")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(TRACKER_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}

/**
 * Reads the current user's weekly_report preference from email_preferences.
 * Defaults to true if the row has not been created yet.
 */
export async function getWeeklyReportPreference(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const { data, error } = await supabase
    .from("email_preferences")
    .select("weekly_report")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return true;
  }
  return Boolean(data.weekly_report);
}

/**
 * Updates the current user's weekly_report email preference.
 * Ensures the row exists via the admin client (since RLS restricts INSERT to
 * triggers/service_role) and then performs the user-scoped UPDATE.
 */
export async function updateWeeklyReportPreference(
  weeklyReport: boolean,
): Promise<SimpleActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // Ensure row exists via admin client before user-scoped RLS update
  const admin = createAdminClient();
  await admin
    .from("email_preferences")
    .upsert(
      { user_id: user.id, weekly_report: Boolean(weeklyReport) },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  const { error } = await supabase
    .from("email_preferences")
    .update({ weekly_report: Boolean(weeklyReport) })
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(PROFILE_PATH);
  revalidatePath(REPORT_CARD_PATH);
  return { success: true };
}
