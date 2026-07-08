"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const displayName = (formData.get("display_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  if (!displayName) return { success: false, error: "Display name is required." };
  if (displayName.length > 80)
    return { success: false, error: "Display name too long (max 80 characters)." };
  if (bio && bio.length > 500)
    return { success: false, error: "Bio too long (max 500 characters)." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio: bio || null })
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAvatar(avatarUrl: string): Promise<ActionResult> {
  // Only accept Cloudinary URLs to prevent arbitrary URL injection
  if (
    !avatarUrl ||
    !avatarUrl.startsWith("https://res.cloudinary.com/")
  ) {
    return { success: false, error: "Invalid avatar URL." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
