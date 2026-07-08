import { createClient } from "@supabase/supabase-js";

// Guard: blow up at module-evaluation time if this file is ever bundled into
// a client (browser) chunk. React Server Components and Route Handlers are
// fine — only Client Components and client-side entry points are blocked.
if (typeof window !== "undefined") {
  throw new Error(
    "[supabase/admin] This module must only be imported in server-side code. " +
    "Never import it from a Client Component or client-side entry point — " +
    "doing so would expose SUPABASE_SERVICE_ROLE_KEY to the browser."
  );
}

/**
 * Admin client — uses the service role key.
 * Only call this in secure server-side contexts (Server Actions, Route Handlers).
 * Never expose to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
