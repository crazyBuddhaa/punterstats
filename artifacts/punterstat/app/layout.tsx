import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
