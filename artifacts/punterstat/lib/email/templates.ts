// Pure template helpers — no "use server" needed (no async, no secrets read here).
// Import these alongside sendEmail from @/lib/email/resend.

type EmailTemplate = { subject: string; html: string; text: string };

export function welcomeEmail(displayName: string): EmailTemplate {
  const name = displayName || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.com";

  return {
    subject: "Welcome to PunterStat — Knowledge Before Decision",
    text: `Hi ${name},\n\nWelcome to PunterStat! Your account is ready.\n\nStart learning at: ${appUrl}/sports-university\n\nRemember: PunterStat is an educational platform. We teach how sports and probability work — not betting tips.\n\n— The PunterStat Team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:28px 40px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;">PunterStat</p>
          <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Knowledge Before Decision</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#0f172a;">Welcome, ${name}! 🎓</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
            Your PunterStat account is ready. You now have free access to Sports University, the Betting Literacy Academy, and the Simulation Engine.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="background:#3D2DFF;border-radius:10px;padding:12px 28px;">
              <a href="${appUrl}/sports-university" style="color:#fff;font-size:15px;font-weight:600;text-decoration:none;">Start learning →</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.6;">
            <strong style="color:#0f172a;">What you can do now:</strong>
          </p>
          <ul style="margin:0 0 28px;padding-left:20px;font-size:13px;color:#475569;line-height:1.8;">
            <li>Take structured courses in Sports University</li>
            <li>Learn probability and odds in Betting Academy</li>
            <li>Practice risk management in the Simulation Engine</li>
            <li>Analyse matches with the 6-factor Breakdown Engine</li>
          </ul>
          <p style="margin:0;font-size:12px;color:#94a3b8;padding:16px;background:#f8fafc;border-radius:8px;line-height:1.6;">
            <strong>Educational platform notice:</strong> PunterStat does not offer betting tips, process real-money transactions, or facilitate gambling of any kind. All simulations use virtual currency for educational purposes only.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            © ${new Date().getFullYear()} PunterStat · <a href="${appUrl}/unsubscribe" style="color:#94a3b8;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
