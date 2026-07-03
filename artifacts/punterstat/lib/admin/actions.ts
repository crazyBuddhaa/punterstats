"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { revalidatePath } from "next/cache";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ─── Audit helper ─────────────────────────────────────────────────────────────

async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: metadata ?? null,
  });
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function toggleCoursePublished(
  courseId: string,
  published: boolean
): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({ is_published: published })
    .eq("id", courseId);

  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, published ? "publish" : "unpublish", "course", courseId);
  revalidatePath("/admin/courses");
  revalidatePath("/");
  return { success: true };
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function toggleLessonPublished(
  lessonId: string,
  published: boolean
): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Look up course_id so we can revalidate the correct path without needing it passed in
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  const { error } = await supabase
    .from("lessons")
    .update({ is_published: published })
    .eq("id", lessonId);

  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, published ? "publish" : "unpublish", "lesson", lessonId);
  if (lesson?.course_id) revalidatePath(`/admin/courses/${lesson.course_id}/lessons`);
  revalidatePath("/admin/courses");
  return { success: true };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function updateUserRole(
  targetUserId: string,
  role: "user" | "premium" | "admin"
): Promise<ActionResult> {
  const profile = await requireAdmin();
  if (targetUserId === profile.userId)
    return { success: false, error: "You cannot change your own role." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", targetUserId);

  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, "update_role", "user", targetUserId, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export async function toggleFeatureFlag(
  key: string,
  enabled: boolean
): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, enabled ? "enable_flag" : "disable_flag", "feature_flag", undefined, { key });
  revalidatePath("/admin/flags");
  return { success: true };
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function validateBlogInput(data: {
  title: string;
  slug: string;
  content: string;
}): string | null {
  if (!data.title || data.title.length < 3) return "Title must be at least 3 characters.";
  if (data.title.length > 200) return "Title must be 200 characters or fewer.";
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug))
    return "Slug must contain only lowercase letters, numbers, and hyphens.";
  if (data.slug.length > 100) return "Slug must be 100 characters or fewer.";
  if (!data.content || data.content.length < 10) return "Content must be at least 10 characters.";
  return null;
}

export async function createBlogPost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const profile = await requireAdmin();

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() ?? "";
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  const tags = parseTags((formData.get("tags") as string) ?? "");
  const isPublished = formData.get("is_published") === "true";

  const err = validateBlogInput({ title, slug, content });
  if (err) return { success: false, error: err };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author_id: profile.userId,
      author_name: profile.displayName ?? null,
      title,
      slug,
      excerpt,
      content,
      thumbnail_url: thumbnailUrl,
      tags,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" && error.message.includes("slug")) {
      return { success: false, error: "This slug is already in use. Choose a different slug." };
    }
    return { success: false, error: error.message };
  }
  await logAudit(profile.userId, "create", "blog_post", data.id, { title, isPublished });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, data: { id: data.id } };
}

export async function updateBlogPost(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireAdmin();

  const title = (formData.get("title") as string)?.trim() ?? "";
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() ?? "";
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  const tags = parseTags((formData.get("tags") as string) ?? "");
  const isPublished = formData.get("is_published") === "true";

  const err = validateBlogInput({ title, slug, content });
  if (err) return { success: false, error: err };

  const supabase = await createClient();

  // Check existing published_at to avoid overwriting
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at, is_published")
    .eq("id", id)
    .single();

  const publishedAt =
    isPublished && !existing?.published_at
      ? new Date().toISOString()
      : (existing?.published_at ?? null);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      excerpt,
      content,
      thumbnail_url: thumbnailUrl,
      tags,
      is_published: isPublished,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505" && error.message.includes("slug")) {
      return { success: false, error: "This slug is already in use. Choose a different slug." };
    }
    return { success: false, error: error.message };
  }
  await logAudit(profile.userId, "update", "blog_post", id, { title, isPublished });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}/edit`);
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, "delete", "blog_post", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function toggleBlogPostPublished(
  id: string,
  published: boolean
): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .single();

  const publishedAt =
    published && !existing?.published_at ? new Date().toISOString() : (existing?.published_at ?? null);

  const { error } = await supabase
    .from("blog_posts")
    .update({ is_published: published, published_at: publishedAt })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await logAudit(profile.userId, published ? "publish" : "unpublish", "blog_post", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
