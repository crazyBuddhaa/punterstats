"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/types";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics/tracker";

export async function markLessonComplete(
  lessonId: string,
  topicSlug: string,
  moduleSlug: string
): Promise<ApiResponse<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to track your progress." };

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        progress_pct: 100,
      },
      { onConflict: "user_id,lesson_id" }
    );

  if (error) return { success: false, error: error.message };

  await trackEvent(user.id, AnalyticsEvent.LESSON_COMPLETED, {
    lessonId,
    section: "betting_academy",
    topicSlug,
    moduleSlug,
  });

  revalidatePath(`/betting-academy/${topicSlug}/${moduleSlug}`, "layout");
  return { success: true, data: undefined };
}

export async function toggleBookmark(
  lessonId: string,
  isCurrentlyBookmarked: boolean
): Promise<ApiResponse<{ bookmarked: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to save bookmarks." };

  if (isCurrentlyBookmarked) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: user.id, lesson_id: lessonId });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/betting-academy", "layout");
  revalidatePath("/dashboard/bookmarks");
  return { success: true, data: { bookmarked: !isCurrentlyBookmarked } };
}
