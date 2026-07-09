import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

// This route exchanges a one-time OAuth/email code for a session. It must
// never be cached by the browser, a CDN, or Next.js's data cache — a cached
// redirect (or a cached "still on the previous page" response on a flaky
// mobile connection) would silently strand the user without a session.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreRedirect(url: string) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Sanitise `next` to prevent open-redirect: must be a relative path starting
  // with a single "/" — reject protocol-relative ("//") and absolute URLs.
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";
  const error = searchParams.get("error");

  if (error) {
    console.error("[auth/callback] Provider returned error:", error);
    return noStoreRedirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error("[auth/callback] No `code` param present on callback request");
    return noStoreRedirect(`${origin}/login?error=auth-callback-failed`);
  }

  // Guard the entire exchange so a thrown error (network blip, Supabase API
  // hiccup, etc.) can never leave this request hanging or unrendered — it
  // always resolves to a redirect, and the failure reason is always logged.
  try {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession failed:", exchangeError.message);
      return noStoreRedirect(`${origin}/login?error=auth-callback-failed`);
    }

    // Send welcome email exactly once per user using an atomic conditional
    // UPDATE. The UPDATE targets only rows where welcome_sent IS false, so
    // only the first concurrent callback wins and returns a row. Subsequent
    // calls (link re-clicks, parallel requests, returning logins) affect 0
    // rows and skip email — this is expected, not a bug.
    if (data?.user?.email) {
      try {
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .update({ welcome_sent: true })
          .eq("user_id", data.user.id)
          .eq("welcome_sent", false)
          .select("display_name");

        if (updateError) {
          console.error("[auth/callback] welcome_sent update failed:", updateError.message);
        } else if (updated && updated.length > 0) {
          const displayName =
            updated[0].display_name ?? data.user.email.split("@")[0];

          // Fire-and-forget — do not block the redirect on email delivery.
          sendEmail({ to: data.user.email, ...welcomeEmail(displayName) }).catch(
            (err) => console.error("[auth/callback] Welcome email delivery failed:", err)
          );
        }
      } catch (err) {
        // Never let a welcome-email hiccup block the user from reaching the app.
        console.error("[auth/callback] Unexpected error while sending welcome email:", err);
      }
    }

    return noStoreRedirect(`${origin}${next}`);
  } catch (err) {
    console.error("[auth/callback] Unexpected error during code exchange:", err);
    return noStoreRedirect(`${origin}/login?error=auth-callback-failed`);
  }
}
