import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUploadSignature } from "@/lib/cloudinary/sign";
import type { UploadFolder } from "@/lib/cloudinary/types";

// Folders any authenticated user may upload to
const USER_FOLDERS: UploadFolder[] = ["avatars"];

// Folders that require admin role
const ADMIN_FOLDERS: UploadFolder[] = ["blog", "thumbnails"];

const ALL_FOLDERS: UploadFolder[] = [...USER_FOLDERS, ...ADMIN_FOLDERS];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folder = request.nextUrl.searchParams.get("folder") as UploadFolder | null;
  if (!folder || !ALL_FOLDERS.includes(folder)) {
    return NextResponse.json(
      { error: `Invalid folder. Must be one of: ${ALL_FOLDERS.join(", ")}` },
      { status: 400 }
    );
  }

  // Admin-only folders require role check
  if (ADMIN_FOLDERS.includes(folder)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: admin role required for this upload folder" },
        { status: 403 }
      );
    }
  }

  if (
    !process.env.CLOUDINARY_API_SECRET ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
  }

  const sig = generateUploadSignature(folder);
  return NextResponse.json(sig);
}
