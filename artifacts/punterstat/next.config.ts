import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://js.paystack.co https://checkout.paystack.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://getcustomcare.xyz",
  "style-src 'self' 'unsafe-inline' https://paystack.com https://checkout.paystack.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://*.stripe.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://res.cloudinary.com https://api.stripe.com https://checkout.stripe.com https://api.paystack.co https://checkout.paystack.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://getcustomcare.xyz",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://checkout.paystack.com https://standard.paystack.co https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://ep2.adtrafficquality.google",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://checkout.paystack.com",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: CSP_DIRECTIVES,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    // Canonicalize to the apex domain (matches NEXT_PUBLIC_APP_URL). Without
    // this, Vercel serves both punterstat.site and www.punterstat.site live,
    // so a user can start an auth flow on one host and land back on the
    // other — losing the PKCE code_verifier cookie along the way and
    // breaking the OAuth/email confirmation callback.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.punterstat.site" }],
        destination: "https://punterstat.site/:path*",
        permanent: true,
      },
    ];
  },
};

const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      silent: true,
    })
  : nextConfig;
