import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/match-breakdown/analyzer", "/checkout"];
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/update-password"];

// ── Inbound rate limits for API & form routes ──────────────────────────────
// Limits are per-IP, per sliding window (Upstash Redis if configured, else in-memory).
const RATE_LIMITED_API_ROUTES: Array<{
  prefix: string;
  limit: number;
  windowMs: number;
  label: string;
  methods?: string[];
}> = [
  // Odds API: 500 credits/month — tightest limit.
  { prefix: "/api/odds",           limit: 10, windowMs: 60_000, label: "odds"        },
  // Spot The Value calls odds + fixtures.
  { prefix: "/api/spot-the-value", limit: 10, windowMs: 60_000, label: "stv"         },
  // Fixture search: soft 33 req/day quota on footballdata.io.
  { prefix: "/api/fixtures",       limit: 20, windowMs: 60_000, label: "fixtures"    },
  // Calibration reads only from Supabase.
  { prefix: "/api/calibration",    limit: 20, windowMs: 60_000, label: "calibration" },
  // Historical stats queries (H2H, results, seasons, teams).
  { prefix: "/api/historical",     limit: 30, windowMs: 60_000, label: "historical"  },
  // Lesson data-block aggregations.
  { prefix: "/api/lesson-blocks",  limit: 30, windowMs: 60_000, label: "lesson-blk"  },
  // R2 dataset listing and admin R2 routes.
  { prefix: "/api/r2/datasets",    limit: 30, windowMs: 60_000, label: "r2-datasets" },
  { prefix: "/api/r2",             limit: 20, windowMs: 60_000, label: "r2-admin"    },
  // Cron endpoints: secondary guard in case a handler misses its CRON_SECRET check.
  { prefix: "/api/cron",           limit:  5, windowMs: 60_000, label: "cron"        },
  // Cloudinary upload signature endpoint.
  { prefix: "/api/upload",         limit: 15, windowMs: 60_000, label: "upload"      },
  // Payment checkout & billing portal session creation.
  { prefix: "/api/checkout",       limit: 10, windowMs: 60_000, label: "checkout"    },
  { prefix: "/api/portal",         limit: 10, windowMs: 60_000, label: "portal"      },
  // Contact form POSTs (Server Action submissions) and GET floods.
  { prefix: "/contact",            limit:  3, windowMs: 60_000, label: "contact-post", methods: ["POST"] },
  { prefix: "/contact",            limit: 15, windowMs: 60_000, label: "contact-get",  methods: ["GET", "HEAD"] },
  // Auth action POSTs (login, register, forgot-password, update-password).
  { prefix: "/login",              limit: 10, windowMs: 60_000, label: "auth",         methods: ["POST"] },
  { prefix: "/register",           limit:  6, windowMs: 60_000, label: "auth-reg",     methods: ["POST"] },
  { prefix: "/forgot-password",    limit:  5, windowMs: 60_000, label: "auth-rst",     methods: ["POST"] },
  { prefix: "/update-password",    limit:  6, windowMs: 60_000, label: "auth-upd",     methods: ["POST"] },
];

/** Common automated vulnerability scanner paths to drop immediately with 404 before SSR. */
const BOT_SCANNER_PATH_RE =
  /(?:^\/(?:\.env|\.git|wp-admin|wp-login|wp-content|wp-includes|xmlrpc|phpmyadmin|pma|myadmin|laravel|crm|htdocs|vendor|cgi-bin|actuator|telescope|_profiler)|(?:\.php|\.env|\.asp|\.aspx|\.jsp|\.cgi|\.sql|\.bak|\.ini)$)/i;

/** True if `pathname` is exactly `prefix` or starts with `prefix/`. */
function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function getIp(request: NextRequest): string {
  // Prioritize Cloudflare's authoritative client IP header so bots cannot
  // spoof X-Forwarded-For to bypass rate limits.
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  const forwarded = request.headers.get("x-forwarded-for");
  const firstHop = forwarded?.split(",")[0]?.trim();
  if (firstHop) return firstHop;
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function isOriginValidForPost(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const expectedHost = (
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      request.nextUrl.host
    )
      .split(",")[0]
      .trim()
      .toLowerCase();
    return Boolean(originHost && expectedHost && originHost === expectedHost);
  } catch {
    return false;
  }
}

/**
 * Next.js 16 request proxy (runs on the Node.js runtime).
 * Handles fast scanner blocking, forged POST / Server Action rejection,
 * 301 redirects for retired routes, inbound rate limiting,
 * Supabase SSR session refresh, and protected/authenticated route guards.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Drop automated vulnerability scanner paths immediately (<0.05ms CPU)
  if (BOT_SCANNER_PATH_RE.test(pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  // ── 2. Reject forged / headerless Server Action & page POSTs early (<0.05ms CPU)
  // Bots frequently fire raw POST requests without a valid Origin header to /contact
  // or other pages, triggering Next.js Server Action origin exceptions and burning CPU.
  if (
    request.method === "POST" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/unsubscribe/")
  ) {
    if (!isOriginValidForPost(request)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // ── 3. Permanent 301 redirects for removed Picks routes (before auth guards)
  if (
    matchesPrefix(pathname, "/bet-assist/picks") ||
    matchesPrefix(pathname, "/dashboard/picks")
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/bet-assist";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl, 301);
  }

  // ── 4. Rate limiting ────────────────────────────────────────────────────────
  const rateLimitedRoute = RATE_LIMITED_API_ROUTES.find(
    (r) =>
      matchesPrefix(pathname, r.prefix) &&
      (!r.methods || r.methods.includes(request.method))
  );

  if (rateLimitedRoute) {
    const ip  = getIp(request);
    const key = `${ip}:${rateLimitedRoute.label}`;
    const result = await checkRateLimit(key, {
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
            "Cache-Control":         "no-store",
            "Retry-After":           String(retryAfterSec),
            "X-RateLimit-Limit":     String(rateLimitedRoute.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset":     String(Math.ceil(result.resetAt / 1_000)),
          },
        }
      );
    }

    // For pure API routes, return early with rate-limit headers
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.next({ request });
      response.headers.set("X-RateLimit-Limit",     String(rateLimitedRoute.limit));
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
      response.headers.set("X-RateLimit-Reset",     String(Math.ceil(result.resetAt / 1_000)));
      return response;
    }
  }

  // ── 5. Supabase session refresh + auth guards ───────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const isLandingPage = pathname === "/";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      !supabaseAnonKey.includes("placeholder")
  );
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  // Fast path for anonymous visitors (no sb-* cookie): skip creating a Supabase
  // client and making an outbound auth.getUser() network call. This keeps
  // anonymous requests well under the 10ms Cloudflare Workers Free Tier CPU limit.
  if (!hasAuthCookie || !isSupabaseConfigured) {
    if (isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public pages into their dashboard workspace
  if (user) {
    if (isAuthPage || isLandingPage) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }

    if (pathname === "/spot-the-value" || pathname.startsWith("/spot-the-value/")) {
      const stvUrl = request.nextUrl.clone();
      stvUrl.pathname = "/dashboard/spot-the-value";
      return NextResponse.redirect(stvUrl);
    }

    if (pathname === "/bet-assist") {
      const assistUrl = request.nextUrl.clone();
      assistUrl.pathname = "/dashboard/bet-tracker";
      return NextResponse.redirect(assistUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
