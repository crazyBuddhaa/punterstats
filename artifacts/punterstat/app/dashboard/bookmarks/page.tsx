import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, ExternalLink } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getBookmarks, type BookmarkedLesson } from "@/lib/dashboard/queries";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Saved Lessons — Dashboard — PunterStat" };

function lessonUrl(item: Pick<BookmarkedLesson, "section" | "categorySlug" | "courseSlug" | "lessonSlug">): string {
  const base = item.section === "betting_academy" ? "/betting-academy" : "/sports-university";
  return `${base}/${item.categorySlug}/${item.courseSlug}/${item.lessonSlug}`;
}

function courseUrl(item: Pick<BookmarkedLesson, "section" | "categorySlug" | "courseSlug">): string {
  const base = item.section === "betting_academy" ? "/betting-academy" : "/sports-university";
  return `${base}/${item.categorySlug}/${item.courseSlug}`;
}

export default async function BookmarksPage() {
  const profile = await requireAuth();
  const bookmarks = await getBookmarks(profile.userId);

  // Group by course
  const byCourse: Record<
    string,
    { courseTitle: string; courseSlug: string; categorySlug: string; section: string; items: typeof bookmarks }
  > = {};
  for (const b of bookmarks) {
    if (!byCourse[b.courseId]) {
      byCourse[b.courseId] = {
        courseTitle: b.courseTitle,
        courseSlug: b.courseSlug,
        categorySlug: b.categorySlug,
        section: b.section,
        items: [],
      };
    }
    byCourse[b.courseId].items.push(b);
  }
  const groups = Object.values(byCourse);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Saved Lessons</h1>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            {bookmarks.length} lesson{bookmarks.length !== 1 ? "s" : ""} bookmarked across{" "}
            {groups.length} course{groups.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved lessons yet"
          description="Bookmark lessons while studying to find them here quickly later."
          actionLabel="Browse Sports University"
          actionHref="/sports-university"
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.courseSlug}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-[#0f172a]">{group.courseTitle}</h2>
                <Link
                  href={courseUrl(group)}
                  className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Open course <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
                {group.items.map((item) => (
                  <div
                    key={item.bookmarkId}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Bookmark className="h-4 w-4 shrink-0 text-indigo-500" />
                      <p className="truncate text-sm font-medium text-[#0f172a]">
                        {item.lessonTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden text-xs text-[#1e293b]/40 sm:block">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Link
                        href={lessonUrl(item)}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                      >
                        Go to lesson →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
