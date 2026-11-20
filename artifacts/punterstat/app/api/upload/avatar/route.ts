import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "avatars";

async function ensureAvatarsBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.id === BUCKET || b.name === BUCKET);
  if (!exists) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: Object.keys(ALLOWED_MIME_TYPES),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to upload a display picture." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported format. Please upload a JPG, PNG, WebP, or GIF image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
    }

    const admin = createAdminClient();
    await ensureAvatarsBucket(admin);

    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(filePath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || "Storage upload failed." }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(filePath);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message || "Failed to save profile photo." }, { status: 500 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, url: avatarUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
