import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHeader } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the PunterStat bet analysis, bet learning and bet assist platform.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "3 July 2026";
const CONTACT = "privacy@punterstat.site";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        title="Privacy Policy"
        description={`Last updated: ${LAST_UPDATED}`}
      />

      <div className="mx-auto max-w-3xl pb-20">
        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-[#334155]
          [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#0f172a]
          [&_p]:mb-4 [&_p]:text-[#475569]
          [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-1.5 [&_li]:text-[#475569] [&_li]:list-disc
          [&_a]:text-[#3D2DFF] [&_a]:underline">

          <p>
            This Privacy Policy describes how PunterStat (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects,
            uses, and shares information about you when you use our Platform.
          </p>

          <h2>1. Information We Collect</h2>
          <p><strong>Account information:</strong> When you register, we collect your name and email address.</p>
          <p><strong>Profile information:</strong> You may optionally add a display name, bio, and profile photo.</p>
          <p><strong>Usage data:</strong> We collect information about how you interact with the Platform — pages visited, courses started, lessons completed, and simulation sessions — to improve your learning experience.</p>
          <p><strong>Bet journal &amp; Report Card data:</strong> When you voluntarily log bets in the Bet Tracker or Betting Report Card, we store the event, market, selection, bookmaker name, decimal odds, stake, optional probability estimate, closing odds, settlement outcome, and notes in your private journal. This data is isolated to your account via database row-level security and is used solely to compute your personal analytics (such as ROI confidence intervals, closing-line value, calibration, and leak detection).</p>
          <p><strong>Device &amp; log data:</strong> We automatically collect IP address, browser type, device type, and referral URLs when you access the Platform.</p>
          <p><strong>Payment data:</strong> If you subscribe to a paid plan, payment processing is handled by a third-party provider. We store only your subscription plan, status, and a payment reference — never your full card details.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account.</li>
            <li>To personalise your learning experience and track your progress.</li>
            <li>To compute your personal Betting Report Card and Bet Tracker statistics.</li>
            <li>To send you transactional emails (account confirmation, password reset).</li>
            <li>To send your weekly &ldquo;Your week in numbers&rdquo; Betting Report Card summary email if you have logged at least one bet in the past 14 days and have weekly reports enabled — you can turn this off at any time in <Link href="/dashboard/profile">Profile Settings</Link> or via the one-click unsubscribe link in the email.</li>
            <li>To send educational updates and product news — you can opt out at any time.</li>
            <li>To detect, prevent, and address technical issues and abuse.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2>3. Legal Basis for Processing (UK/EEA Users)</h2>
          <ul>
            <li><strong>Contract performance</strong> — to provide the services you signed up for.</li>
            <li><strong>Legitimate interests</strong> — to improve the Platform and prevent fraud.</li>
            <li><strong>Consent</strong> — for marketing emails, which you can withdraw at any time.</li>
            <li><strong>Legal obligation</strong> — where required by applicable law.</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only:</p>
          <ul>
            <li><strong>With service providers:</strong> Supabase (database &amp; auth), Cloudinary (media hosting), Resend (transactional email). Each is bound by appropriate data processing agreements.</li>
            <li><strong>With law enforcement:</strong> When required by law or to protect rights and safety.</li>
            <li><strong>In a business transfer:</strong> In connection with a merger, acquisition, or sale of assets, with notice to affected users.</li>
          </ul>

          <h2>5. Data Retention &amp; Self-Service Bet Journal Controls</h2>
          <p>
            We retain your account data for as long as your account is active. You can download a complete
            CSV export of your logged bets (&ldquo;Export my bets (CSV)&rdquo;) or permanently erase your entire bet
            journal (&ldquo;Delete all my bets&rdquo;) at any time directly from your{" "}
            <Link href="/dashboard/report-card">Betting Report Card</Link> page. If you request full account
            deletion, we will delete or anonymise your personal data within 30 days, subject to retention
            obligations required by law.
          </p>

          <h2>6. Cookies &amp; Tracking</h2>
          <p>
            We use strictly necessary cookies to maintain your authenticated session. We do not
            use advertising cookies or third-party tracking. You can control cookies through
            your browser settings; disabling session cookies will require you to sign in on
            every visit.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your data (&quot;right to be forgotten&quot;), or delete all logged bets immediately from your Betting Report Card.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Receive your data in a portable format (including instant CSV export of your bet journal).</li>
            <li>Withdraw consent for weekly report or marketing emails at any time (via Profile Settings or the one-click unsubscribe link in every email).</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We will respond within 30 days.
          </p>

          <h2>8. Security</h2>
          <p>
            We implement industry-standard technical and organisational measures to protect your
            data, including encrypted connections (TLS), hashed passwords managed by Supabase Auth,
            and row-level security on all database tables. No method of transmission over the
            internet is 100% secure; we cannot guarantee absolute security.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Platform is intended for users aged 18 and over. We do not knowingly collect
            personal data from anyone under 18. If you believe a minor has provided us with
            their data, contact us and we will promptly delete it.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users
            of material changes via email. Continued use of the Platform after changes are posted
            constitutes your acceptance of the updated policy.
          </p>

          <h2>11. Contact</h2>
          <p>
            For privacy questions or to exercise your rights, contact us at{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </div>

        <div className="mt-10 flex gap-6 text-sm">
          <Link href="/terms" className="text-[#3D2DFF] hover:underline">Terms of Service</Link>
          <Link href="/" className="text-[#1e293b]/50 hover:text-[#0f172a]">Back to home</Link>
        </div>
      </div>
    </PageShell>
  );
}
