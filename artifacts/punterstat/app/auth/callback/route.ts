import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendEmail, welcomeEmail } from "@/lib/email/resend";

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
      // Send welcome email only to genuinely new users.
      // A new user's account will have been created in the last few minutes
      // (they registered, received the confirmation email, and clicked it).
      // Returning users (password reset, re-auth) have a created_at that is
      // hours or days old, so this check never fires for them.
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      const isNewUser =
        data?.user?.email &&
        data?.user?.created_at &&
        Date.now() - new Date(data.user.created_at).getTime() < FIVE_MINUTES_MS;

      if (isNewUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .single();

        const displayName =
          profile?.display_name ?? data.user.email!.split("@")[0];
        const template = welcomeEmail(displayName);

        // Fire-and-forget — do not block the redirect on email delivery.
        // .catch() ensures the rejected promise is handled and does not
        // surface as an unhandled rejection in the Node.js process.
        sendEmail({ to: data.user.email!, ...template }).catch((err) =>
          console.error("[Welcome email] Delivery failed:", err)
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
