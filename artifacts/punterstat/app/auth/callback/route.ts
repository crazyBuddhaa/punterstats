import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Send welcome email exactly once per user using an atomic conditional
      // UPDATE. The UPDATE targets only rows where welcome_sent IS false, so
      // only the first concurrent callback wins and returns a row. Subsequent
      // calls (link re-clicks, parallel requests) affect 0 rows and skip email.
      if (data?.user?.email) {
        const { data: updated } = await supabase
          .from("profiles")
          .update({ welcome_sent: true })
          .eq("user_id", data.user.id)
          .eq("welcome_sent", false)
          .select("display_name");

        // updated.length === 1 means we won the race; 0 means already sent.
        if (updated && updated.length > 0) {
          const displayName =
            updated[0].display_name ?? data.user.email.split("@")[0];

          // Fire-and-forget — do not block the redirect on email delivery.
          sendEmail({ to: data.user.email, ...welcomeEmail(displayName) }).catch(
            (err) => console.error("[Welcome email] Delivery failed:", err)
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
