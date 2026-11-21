import { NextRequest, NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { capturePendingClosingOdds } from "@/lib/bet-assist/closing-odds";
import { autoSettlePendingBets } from "@/lib/bet-assist/journal-actions";

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const closingOdds = await capturePendingClosingOdds(100);
  const result = await autoSettlePendingBets(true);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, closingOdds }, { status: 500 });
  }
  return NextResponse.json({ ...result, closingOdds });
}
