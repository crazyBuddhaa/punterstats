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
      // Send welcome email only on first sign-in (new user confirmation)
      // next defaults to /dashboard; password reset uses next=/update-password
      const isNewUser = next === "/dashboard" && data?.user?.email_confirmed_at !== null;
      if (isNewUser && data?.user?.email) {
        // Try to get display name from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .single();

        const displayName = profile?.display_name ?? data.user.email.split("@")[0];
        const template = welcomeEmail(displayName);

        // Fire-and-forget — don't block redirect on email delivery
        sendEmail({ to: data.user.email, ...template }).catch((err) =>
          console.error("[Welcome email] Failed:", err)
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
