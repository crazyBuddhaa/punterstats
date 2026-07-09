import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cookies (including the PKCE code_verifier) must be shared between
      // apex and www hosts — without an explicit domain they default to
      // host-only, so a flow that starts on one host and completes on the
      // other loses the verifier and fails with "PKCE code verifier not
      // found" / "invalid flow state". See lib/supabase/server.ts for the
      // matching server-side setting.
      cookieOptions: {
        domain:
          process.env.NODE_ENV === "production" ? ".punterstat.site" : undefined,
      },
      auth: {
        // OAuth/email codes must always be exchanged server-side by
        // app/auth/callback/route.ts, which also fires the welcome email and
        // redirects to /dashboard. If this were left on (the default), the
        // browser client would silently consume a leftover `?code=`/
        // `#access_token=` on ANY page it finds itself on — e.g. after a
        // misconfigured redirect URL lands the user back on "/" — creating a
        // session with no redirect and no welcome email. The root layout's
        // inline script (see app/layout.tsx) forwards any such leftover
        // param to /auth/callback before this client ever initializes.
        detectSessionInUrl: false,
      },
    }
  );
}
