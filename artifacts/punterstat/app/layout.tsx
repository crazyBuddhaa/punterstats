import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/app/providers";

// Runs before any React code (including the Supabase browser client) can
// touch the page. If an OAuth/email `code` or implicit `access_token` is
// still sitting in the URL on a page that isn't already /auth/callback —
// which happens if a redirect URL isn't on Supabase's allow-list and it
// falls back to the Site URL — forward it to the server-side callback route
// instead of letting it sit there unprocessed. That route is the only place
// that exchanges the code, sends the welcome email, and redirects into the
// app; skipping it silently authenticates the user with no redirect and no
// email, which is the bug this guards against.
const REDIRECT_LEFTOVER_AUTH_PARAMS = `
(function () {
  try {
    var path = window.location.pathname;
    if (path === "/auth/callback" || path === "/login") return;
    var search = window.location.search;
    var hash = window.location.hash;
    var hasCode = /(?:^|[?&])code=/.test(search);
    var hasAccessToken = /(?:^|[#&])access_token=/.test(hash);
    if (hasCode) {
      window.location.replace("/auth/callback" + search);
    } else if (hasAccessToken) {
      // Implicit-flow tokens arrive in the hash fragment, which the server
      // never sees — hand off via query string instead so the callback
      // route can still process it.
      var params = new URLSearchParams(hash.slice(1));
      window.location.replace("/auth/callback?" + params.toString());
    }
  } catch (e) {
    // Never let this guard itself break page load.
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "PunterStat — Sports Intelligence & Education Platform",
    template: "%s | PunterStat",
  },
  description:
    "PunterStat is a sports intelligence and education platform. We teach sports systems, probability, and analytical thinking. Knowledge Before Decision.",
  keywords: [
    "sports education",
    "sports intelligence",
    "probability literacy",
    "betting mathematics",
    "sports analytics",
    "sports university",
  ],
  authors: [{ name: "PunterStat" }],
  creator: "PunterStat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site",
    title: "PunterStat — Sports Intelligence & Education Platform",
    description:
      "Knowledge Before Decision. Learn how sports systems and probability work.",
    siteName: "PunterStat",
  },
  twitter: {
    card: "summary_large_image",
    title: "PunterStat — Sports Intelligence & Education Platform",
    description:
      "Knowledge Before Decision. Learn how sports systems and probability work.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Script
          id="redirect-leftover-auth-params"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: REDIRECT_LEFTOVER_AUTH_PARAMS }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
