"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApiResponse } from "@/types";
import { audit, AuditAction } from "@/lib/audit/logger";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

// ── Schemas ────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ageConfirmed: z.literal("on", {
    errorMap: () => ({ message: "You must confirm you are 18 or older to register." }),
  }),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ── Actions ────────────────────────────────────────────────

export async function signIn(
  _prevState: ApiResponse<void> | null,
  formData: FormData
): Promise<ApiResponse<void>> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    await audit(data.user.id, AuditAction.USER_LOGIN, "auth", data.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  _prevState: ApiResponse<void> | null,
  formData: FormData
): Promise<ApiResponse<void>> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    ageConfirmed: formData.get("ageConfirmed"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Email confirmation required — session not yet created
  if (data.user && !data.session) {
    await audit(data.user.id, AuditAction.USER_REGISTERED, "auth", data.user.id, {
      emailConfirmationRequired: true,
    });

    // Send welcome email before redirect. We await with a safety timeout so a
    // slow Resend response never blocks signup for more than 3 s. Any error is
    // logged and swallowed — a missing welcome email must not abort registration.
    const { subject, html, text } = welcomeEmail(parsed.data.displayName);
    await Promise.race([
      sendEmail({ to: parsed.data.email, subject, html, text }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]).catch((err) => console.error("[Auth] Welcome email failed:", err));

    redirect("/register?message=check-email");
  }

  if (data.user) {
    await audit(data.user.id, AuditAction.USER_REGISTERED, "auth", data.user.id);

    // Auto-confirmed path — same pattern.
    const { subject, html, text } = welcomeEmail(parsed.data.displayName);
    await Promise.race([
      sendEmail({ to: parsed.data.email, subject, html, text }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]).catch((err) => console.error("[Auth] Welcome email failed:", err));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user) {
    await audit(user.id, AuditAction.USER_LOGOUT, "auth", user.id);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(
  _prevState: ApiResponse<void> | null,
  formData: FormData
): Promise<ApiResponse<void>> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Note: password-reset is initiated while the user is logged out, so no
  // userId is available here without an expensive admin lookup. The actual
  // password change is audited in updatePassword() where a session exists.

  return { success: true, data: undefined };
}

export async function updatePassword(
  _prevState: ApiResponse<void> | null,
  formData: FormData
): Promise<ApiResponse<void>> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (user) {
    await audit(user.id, AuditAction.PASSWORD_UPDATED, "auth", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

