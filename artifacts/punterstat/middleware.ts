import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/match-breakdown/analyzer", "/checkout"];
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/update-password"];

// ── Inbound rate limits for API routes ────────────────────────────────────────
// Limits are per-IP, per sliding window.
// Admin routes (/api/r2/sync, /api/r2/ingest, /api/r2/manifest) are protected
// by requireAdmin() inside the route handler, so they don't need rate limiting
// here. Only public-facing data routes are rate-limited at the middleware layer.
const RATE_LIMITED_API_ROUTES: Array<{
  prefix: string;
  limit: number;
  windowMs: number;
  label: string;
}> = [
  // Odds API: 500 credits/month — tightest limit.
  { prefix: "/api/odds",           limit: 10, windowMs: 60_000, label: "odds"        },
  // Spot The Value calls odds + fixtures.
  { prefix: "/api/spot-the-value", limit: 10, windowMs: 60_000, label: "stv"         },
  // Fixture search: soft 33 req/day quota on footballdata.io.
  { prefix: "/api/fixtures",       limit: 20, windowMs: 60_000, label: "fixtures"    },
  // Calibration reads only from Supabase.
  { prefix: "/api/calibration",    limit: 20, windowMs: 60_000, label: "calibration" },
  // R2 dataset listing: public, lightweight (reads manifest.json from R2).
  { prefix: "/api/r2/datasets",    limit: 30, windowMs: 60_000, label: "r2-datasets" },
  // Cron endpoints: secondary guard in case a handler misses its CRON_SECRET check.
  // Vercel's scheduler sends 1 req/trigger; 5/min leaves room for manual retries.
  { prefix: "/api/cron",           limit:  5, windowMs: 60_000, label: "cron"        },
];

/** True if `pathname` is exactly `prefix` or starts with `prefix/`. */
function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0].trim();
  if (firstHop) return firstHop;
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const rateLimitedRoute = RATE_LIMITED_API_ROUTES.find((r) =>
    matchesPrefix(pathname, r.prefix)
  );

  if (rateLimitedRoute) {
    const ip  = getIp(request);
    const key = `${ip}:${rateLimitedRoute.label}`;
    const result = checkRateLimit(key, {
      limit: rateLimitedRoute.limit,
      windowMs: rateLimitedRoute.windowMs,
    });

    if (!result.success) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((result.resetAt - Date.now()) / 1_000)
      );
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait before retrying." },
        {
          status: 429,
          headers: {
            "Retry-After":          String(retryAfterSec),
            "X-RateLimit-Limit":    String(rateLimitedRoute.limit),
            "X-RateLimit-Remaining":"0",
            "X-RateLimit-Reset":    String(Math.ceil(result.resetAt / 1_000)),
          },
        }
      );
    }

    const response = NextResponse.next({ request });
    response.headers.set("X-RateLimit-Limit",     String(rateLimitedRoute.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset",     String(Math.ceil(result.resetAt / 1_000)));
    return response;
  }

  // ── Supabase session refresh + auth guards ────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages AND the landing page.
  const isLandingPage = pathname === "/";
  if ((isAuthPage || isLandingPage) && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
