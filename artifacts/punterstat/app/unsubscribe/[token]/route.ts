/**
 * Public one-click unsubscribe route for Weekly Betting Report Card emails.
 *
 * GET /unsubscribe/[token] — no login required.
 * Rate-limited per IP and validates the UUID token before flipping
 * email_preferences.weekly_report = false via the service-role admin client.
 */

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkActionRateLimit } from "@/lib/rate-limit";

const uuidSchema = z.string().uuid();

function htmlPage(title: string, body: string, status = 200): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — PunterStat</title>
</head>
<body style="margin:0;padding:48px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <main style="max-width:460px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center;">
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">${title}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">${body}</p>
    <a href="/dashboard/profile" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Manage email preferences
    </a>
  </main>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const rl = await checkActionRateLimit(
    "unsubscribe-token",
    { limit: 10, windowMs: 60_000 },
    req.headers,
  );
  if (!rl.success) {
    return htmlPage(
      "Too many requests",
      "Please wait a minute and try your unsubscribe link again.",
      429,
    );
  }

  const { token } = await context.params;
  const parsed = uuidSchema.safeParse(token);
  if (!parsed.success) {
    return htmlPage(
      "Invalid unsubscribe link",
      "This unsubscribe link is malformed or incomplete. You can also turn off weekly emails from your Profile Settings.",
      400,
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_preferences")
    .update({ weekly_report: false })
    .eq("unsubscribe_token", parsed.data)
    .select("user_id")
    .maybeSingle();

  if (error || !data) {
    return htmlPage(
      "Unsubscribe link not found",
      "We could not match this token, or your preferences have already been removed. You can manage email settings anytime in your dashboard profile.",
      404,
    );
  }

  return htmlPage(
    "Unsubscribed from weekly reports",
    "You will no longer receive the weekly Betting Report Card email. You can re-enable it anytime in Profile Settings.",
    200,
  );
}
