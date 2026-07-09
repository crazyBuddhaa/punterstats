import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cookies (including the PKCE code_verifier) must be shared between
      // apex and www hosts — without an explicit domain they default to
      // host-only, so a flow that starts on one host and completes on the
      // other loses the verifier and fails with "PKCE code verifier not
      // found" / "invalid flow state". See lib/supabase/client.ts for the
      // matching browser-side setting.
      cookieOptions: {
        domain:
          process.env.NODE_ENV === "production" ? ".punterstat.site" : undefined,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // Called from a Server Component — mutations are a no-op here.
            // Middleware handles session refresh instead.
          }
        },
      },
    }
  );
}
