// ─────────────────────────────────────────────────────────────
// PunterStat — Transactional email templates
// Pure helpers — no "use server", no secrets read here.
// Import alongside sendEmail from @/lib/email/resend.
// ─────────────────────────────────────────────────────────────

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ── HTML escape helper ────────────────────────────────────────
/** Escape user-supplied strings before embedding in email HTML. */
function escHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ── Shared brand constants ────────────────────────────────────
const BRAND = {
  dark: "#0f172a",
  accent: "#3D2DFF",
  muted: "#94a3b8",
  body: "#475569",
  surface: "#f8fafc",
  border: "#e2e8f0",
  divider: "#f1f5f9",
} as const;

const year = new Date().getFullYear();

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";
}

// ── Layout shell ─────────────────────────────────────────────
function shell(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>PunterStat</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:${BRAND.surface};padding:40px 16px;">
    <tr><td align="center">

      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
             style="max-width:560px;width:100%;background:#fff;border-radius:16px;
                    border:1px solid ${BRAND.border};overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.dark};padding:24px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <img src="${appUrl()}/logo.png" width="32" height="32" alt="PunterStat"
                       style="display:block;width:32px;height:32px;border-radius:6px;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.4px;">
                    PunterStat
                  </p>
                  <p style="margin:2px 0 0;font-size:11px;color:${BRAND.muted};letter-spacing:0.3px;text-transform:uppercase;">
                    Knowledge Before Decision
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            ${innerHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 40px;border-top:1px solid ${BRAND.divider};">
            <p style="margin:0;font-size:11px;color:${BRAND.muted};line-height:1.6;">
              &copy; ${year} PunterStat &mdash; Educational platform only. We do not offer
              betting tips or facilitate gambling of any kind.
              &nbsp;&middot;&nbsp;
              <a href="${appUrl()}/unsubscribe"
                 style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── CTA button helper ─────────────────────────────────────────
function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr>
    <td style="background:${BRAND.accent};border-radius:10px;padding:13px 28px;">
      <a href="${href}"
         style="color:#fff;font-size:15px;font-weight:600;text-decoration:none;
                white-space:nowrap;">${label}</a>
    </td>
  </tr>
</table>`;
}

// ── Notice box helper ─────────────────────────────────────────
function noticeBox(html: string): string {
  return `<div style="background:${BRAND.surface};border-radius:8px;padding:14px 16px;
              font-size:12px;color:${BRAND.muted};line-height:1.7;">
  ${html}
</div>`;
}

// ─────────────────────────────────────────────────────────────
// 1. Welcome email  (fired right after sign-up)
// ─────────────────────────────────────────────────────────────
export function welcomeEmail(displayName: string): EmailTemplate {
  const name = escHtml(displayName || "there");
  const url = appUrl();

  const html = shell(`
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:${BRAND.dark};">
      Welcome, ${name}! &#127891;
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:${BRAND.body};line-height:1.6;">
      Your PunterStat account is ready. You now have free access to Sports
      University, the Betting Literacy Academy, and the Simulation Engine.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.muted};line-height:1.6;">
      If you haven&apos;t confirmed your email yet, please check your inbox for
      a separate confirmation link before signing in.
    </p>
    ${ctaButton("Start learning →", `${url}/sports-university`)}
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${BRAND.dark};">
      What you can do now:
    </p>
    <ul style="margin:0 0 28px;padding-left:20px;font-size:13px;
               color:${BRAND.body};line-height:1.9;">
      <li>Take structured courses in Sports University</li>
      <li>Learn probability &amp; odds in Betting Academy</li>
      <li>Practice risk management in the Simulation Engine</li>
      <li>Analyse matches with the 6-factor Breakdown Engine</li>
    </ul>
    ${noticeBox(`<strong style="color:${BRAND.dark};">Educational platform notice:</strong>
      PunterStat does not offer betting tips, process real-money transactions,
      or facilitate gambling of any kind. All simulations use virtual currency
      for educational purposes only.`)}
  `);

  return {
    subject: "Welcome to PunterStat — Knowledge Before Decision",
    html,
    text: [
      `Hi ${name},`,
      "",
      "Welcome to PunterStat! Your account is ready.",
      "",
      "If you haven't confirmed your email yet, check your inbox for a separate",
      "confirmation link before signing in.",
      "",
      `Start learning: ${url}/sports-university`,
      "",
      "What you can do:",
      "• Structured courses in Sports University",
      "• Probability & odds in Betting Academy",
      "• Risk management in the Simulation Engine",
      "• Match analysis with the Breakdown Engine",
      "",
      "— The PunterStat Team",
      "",
      "PunterStat is an educational platform. We teach how sports and probability",
      "work — not betting tips.",
    ].join("\n"),
  };
}

// ─────────────────────────────────────────────────────────────
// 2. Email confirmation  (paste HTML into Supabase dashboard
//    OR call directly if you handle the hook yourself)
// ─────────────────────────────────────────────────────────────
export function confirmSignupEmail(confirmUrl: string): EmailTemplate {
  const url = appUrl();

  const html = shell(`
    <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:${BRAND.dark};">
      Confirm your email address
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.body};line-height:1.6;">
      You&apos;re almost in. Click the button below to verify your email address
      and activate your PunterStat account.
    </p>
    ${ctaButton("Confirm email address", confirmUrl)}
    <p style="margin:0 0 20px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      This link expires in <strong style="color:${BRAND.dark};">24 hours</strong>.
      If you didn&apos;t create a PunterStat account you can safely ignore this email.
    </p>
    <p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};">
      Button not working? Copy and paste this URL into your browser:
    </p>
    <p style="margin:0;font-size:11px;color:${BRAND.accent};word-break:break-all;">
      ${confirmUrl}
    </p>
  `);

  return {
    subject: "Confirm your PunterStat email address",
    html,
    text: [
      "Confirm your PunterStat email address",
      "",
      "You're almost in. Visit the link below to verify your email and activate",
      "your account:",
      "",
      confirmUrl,
      "",
      "This link expires in 24 hours.",
      "If you didn't create a PunterStat account, ignore this email.",
      "",
      `— The PunterStat Team · ${url}`,
    ].join("\n"),
  };
}

// ─────────────────────────────────────────────────────────────
// 3. Password reset
// ─────────────────────────────────────────────────────────────
export function resetPasswordEmail(resetUrl: string): EmailTemplate {
  const url = appUrl();

  const html = shell(`
    <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:${BRAND.dark};">
      Reset your password
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.body};line-height:1.6;">
      We received a request to reset the password for your PunterStat account.
      Click the button below to choose a new password.
    </p>
    ${ctaButton("Reset password", resetUrl)}
    <p style="margin:0 0 20px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      This link expires in <strong style="color:${BRAND.dark};">1 hour</strong>.
      If you didn&apos;t request a password reset, you can safely ignore this email
      — your password will not change.
    </p>
    <p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};">
      Button not working? Copy and paste this URL into your browser:
    </p>
    <p style="margin:0;font-size:11px;color:${BRAND.accent};word-break:break-all;">
      ${resetUrl}
    </p>
  `);

  return {
    subject: "Reset your PunterStat password",
    html,
    text: [
      "Reset your PunterStat password",
      "",
      "We received a request to reset the password for your account.",
      "Visit the link below to choose a new password:",
      "",
      resetUrl,
      "",
      "This link expires in 1 hour.",
      "If you didn't request this, ignore this email — your password won't change.",
      "",
      `— The PunterStat Team · ${url}`,
    ].join("\n"),
  };
}

// ─────────────────────────────────────────────────────────────
// 4. Magic link sign-in
// ─────────────────────────────────────────────────────────────
export function magicLinkEmail(magicUrl: string): EmailTemplate {
  const url = appUrl();

  const html = shell(`
    <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:${BRAND.dark};">
      Your sign-in link
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.body};line-height:1.6;">
      Click the button below to sign in to PunterStat. No password needed.
    </p>
    ${ctaButton("Sign in to PunterStat", magicUrl)}
    <p style="margin:0 0 20px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      This link expires in <strong style="color:${BRAND.dark};">1 hour</strong>
      and can only be used once. If you didn&apos;t request this, you can safely
      ignore this email.
    </p>
    <p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};">
      Button not working? Copy and paste this URL into your browser:
    </p>
    <p style="margin:0;font-size:11px;color:${BRAND.accent};word-break:break-all;">
      ${magicUrl}
    </p>
  `);

  return {
    subject: "Your PunterStat sign-in link",
    html,
    text: [
      "Your PunterStat sign-in link",
      "",
      "Click the link below to sign in — no password needed:",
      "",
      magicUrl,
      "",
      "This link expires in 1 hour and can only be used once.",
      "If you didn't request this, ignore this email.",
      "",
      `— The PunterStat Team · ${url}`,
    ].join("\n"),
  };
}
