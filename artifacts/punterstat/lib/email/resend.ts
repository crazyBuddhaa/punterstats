"use server";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

type EmailResult = { success: true; id: string } | { success: false; error: string };

/**
 * Send a transactional email via the Resend REST API.
 * No SDK required — uses fetch directly.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not set — skipping email send.");
    return { success: false, error: "Email not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@punterstat.site";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html, ...(text ? { text } : {}) }),
    });

    const data = await res.json() as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      return { success: false, error: data.message ?? `Resend error ${res.status}` };
    }

    return { success: true, id: data.id ?? "" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// Email templates live in @/lib/email/templates to avoid "use server" conflicts.
// All exports from this file must be async (Next.js 15 Server Actions constraint).
