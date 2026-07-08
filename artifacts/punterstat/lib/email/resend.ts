"use server";

// ─────────────────────────────────────────────────────────────
// Resend email client — raw fetch, no SDK dependency required.
// ─────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Override the from address. Defaults to RESEND_FROM_EMAIL env var. */
  from?: string;
  replyTo?: string;
}

export type EmailResult =
  | { success: true; id: string }
  | { success: false; error: string };

const DEFAULT_FROM = "PunterStat <noreply@punterstat.site>";

/**
 * Send a transactional email via the Resend REST API.
 * Fire-and-forget callers should `.catch(console.error)` rather than awaiting.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not set — skipping email send.");
    return { success: false, error: "Email not configured" };
  }

  const fromAddress =
    from ?? process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const data = (await res.json()) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!res.ok) {
      const msg = data.message ?? `Resend error ${res.status}`;
      console.error("[Resend] API error:", msg);
      return { success: false, error: msg };
    }

    return { success: true, id: data.id ?? "" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.error("[Resend] fetch error:", msg);
    return { success: false, error: msg };
  }
}
