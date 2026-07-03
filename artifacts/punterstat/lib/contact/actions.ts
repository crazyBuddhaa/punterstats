"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email/resend";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
};

/** Escape characters that are meaningful in HTML to prevent content injection in email bodies. */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof raw;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const { name, email, subject, message } = parsed.data;

  // Escape all user-supplied strings before embedding in HTML.
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.com";

  // Send to support inbox and user confirmation in parallel.
  const [inboxResult] = await Promise.all([
    sendEmail({
      to: "hello@punterstat.com",
      subject: `[Contact] ${safeSubject}`,
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;padding:32px;max-width:560px;">
<h2 style="color:#0f172a;margin:0 0 16px">New contact form submission</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:80px;">Name</td><td style="padding:8px 0;font-size:13px;color:#0f172a;">${safeName}</td></tr>
  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${safeEmail}" style="color:#3D2DFF;">${safeEmail}</a></td></tr>
  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Subject</td><td style="padding:8px 0;font-size:13px;color:#0f172a;">${safeSubject}</td></tr>
</table>
<div style="background:#f8fafc;border-radius:10px;padding:16px;font-size:13px;color:#334155;line-height:1.7;white-space:pre-wrap;">${safeMessage}</div>
</body></html>`,
    }),
    sendEmail({
      to: email,
      subject: "We received your message — PunterStat",
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr><td style="background:#0f172a;padding:24px 40px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">PunterStat</p>
          <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">Knowledge Before Decision</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Message received, ${safeName}.</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
            Thanks for reaching out. We&apos;ll review your message and get back to you within 24 hours.
          </p>
          <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0f172a;">Your subject:</p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${safeSubject}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#94a3b8;">
            In the meantime, our <a href="${appUrl}/faq" style="color:#3D2DFF;">FAQ</a> may have an immediate answer.
          </p>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">&#169; ${new Date().getFullYear()} PunterStat &mdash; Educational platform only.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }),
  ]);

  if (!inboxResult.success) {
    console.error("[Contact] Inbox delivery failed:", inboxResult.error);
  }

  return { success: true };
}
