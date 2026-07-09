import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
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

export default nextConfig;
