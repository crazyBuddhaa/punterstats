import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHeader } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the PunterStat sports intelligence and education platform.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "3 July 2026";
const CONTACT = "legal@punterstat.site";

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Terms of Service"
        description={`Last updated: ${LAST_UPDATED}`}
      />

      <div className="mx-auto max-w-3xl pb-20">
        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-[#334155]
          [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#0f172a]
          [&_p]:mb-4 [&_p]:text-[#475569]
          [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-1.5 [&_li]:text-[#475569] [&_li]:list-disc
          [&_a]:text-[#3D2DFF] [&_a]:underline">

          <p>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using PunterStat (the
            &quot;Platform&quot;). By accessing or using our Platform you agree to be bound by these Terms.
          </p>

          <h2>1. About PunterStat</h2>
          <p>
            PunterStat is an <strong>educational</strong> sports intelligence and literacy platform. We provide
            structured learning content on sports systems, probability theory, betting mathematics, and
            analytical thinking. PunterStat is <strong>not</strong> a gambling operator, betting exchange,
            tipster service, or financial advisory service of any kind.
          </p>
          <ul>
            <li>We do not facilitate real-money wagering or transactions.</li>
            <li>We do not provide betting tips, predictions, or recommendations.</li>
            <li>All simulations use virtual currency for educational purposes only.</li>
            <li>Completion of any PunterStat course does not guarantee any financial outcome.</li>
          </ul>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years of age to create an account. By using the Platform you
            represent and warrant that you meet this requirement and that you have the legal
            capacity to enter into a binding agreement.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activity that occurs under your account. You agree to notify us immediately
            of any unauthorised access at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We reserve
            the right to suspend or terminate accounts that violate these Terms.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose.</li>
            <li>Reproduce, sell, or redistribute course content without written permission.</li>
            <li>Attempt to reverse-engineer, scrape, or systematically extract Platform data.</li>
            <li>Upload content that is defamatory, obscene, or infringes third-party rights.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any entity.</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            All content on the Platform — including course materials, articles, simulations, and
            branding — is owned by PunterStat or its licensors and is protected by applicable
            intellectual property laws. You are granted a limited, non-exclusive, non-transferable
            licence to access and use the content for personal, non-commercial educational purposes only.
          </p>

          <h2>6. Subscription & Payments</h2>
          <p>
            Free accounts provide access to all free-tier content. Premium subscriptions unlock
            additional modules and features. Subscription fees are billed in advance on a monthly
            or annual basis. All fees are non-refundable except where required by applicable law.
            We reserve the right to change pricing with 30 days&apos; notice.
          </p>

          <h2>7. Disclaimers</h2>
          <p>
            THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST
            EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            Educational content on PunterStat reflects general knowledge and probability theory.
            It is not financial, legal, or gambling advice. Any application of knowledge gained on
            this Platform is entirely at your own risk.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PUNTERSTAT AND ITS AFFILIATES SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
            ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS
            OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of England and
            Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of
            England and Wales.
          </p>

          <h2>10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify registered users of
            material changes via email. Your continued use of the Platform following any changes
            constitutes your acceptance of the revised Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </div>

        <div className="mt-10 flex gap-6 text-sm">
          <Link href="/privacy" className="text-[#3D2DFF] hover:underline">Privacy Policy</Link>
          <Link href="/" className="text-[#1e293b]/50 hover:text-[#0f172a]">Back to home</Link>
        </div>
      </div>
    </PageShell>
  );
}
