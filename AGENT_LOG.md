# PunterStat — Agent Session Log

This file lives on the `devlog` branch and is **append-only**.
It supplements `DEVLOG.md` (on `main`) with granular notes from agent working sessions — fixes, micro-decisions, and anything not formally staged.

New agents: read this file alongside `DEVLOG.md` for full project context.

---

## Format

```
### YYYY-MM-DD — <Short title>
Agent: @replit-agent

What changed & why:
-

Files touched:
-

Watch out for:
-
```

---

## Log

### 2026-07-03 — Admin mobile layout fix
Agent: @replit-agent

What changed & why:
- Admin dashboard was broken on mobile: the horizontal nav strip and the main content sat **side-by-side** because the outer flex container defaulted to `flex-row` on all screen sizes.
- Fix: added `flex-col` as the default, overridden with `lg:flex-row` on large screens.

Files touched:
- `artifacts/punterstat/app/admin/layout.tsx`

Watch out for:
- The mobile nav strip (`lg:hidden`) and the desktop sidebar (`hidden lg:block`) are siblings inside the same flex container — direction matters.

---

### 2026-07-03 — Admin courses: grouped by module + full CRUD
Agent: @replit-agent

What changed & why:
- Courses page was a flat table with no editing capability. Rewritten to group courses under their module/category headers (Sports University, Betting Academy, etc.). Courses with no category fall into "Uncategorised".
- Added **Create Course** and **Edit Course** modals with: title, slug (auto-derived from title until manually touched), description, module dropdown, level, sort order, premium toggle.
- Added **Add Lesson** and **Edit Lesson** modals on the lessons page with: title, slug, content (markdown), video URL, duration, sort order, publish toggle.
- Each course row shows level badge, premium badge, lesson count, publish toggle, Edit button, and Lessons → link.
- Lessons page gained an **Edit Course** button at the top alongside **Add Lesson**.

Files touched:
- `artifacts/punterstat/app/admin/courses/page.tsx` — now a thin server page; data fetched here, rendering delegated to client component
- `artifacts/punterstat/app/admin/courses/[courseId]/lessons/page.tsx` — same pattern
- `artifacts/punterstat/components/admin/courses-client-page.tsx` — new; grouped course UI with modals
- `artifacts/punterstat/components/admin/lessons-client-page.tsx` — new; lessons table with modals
- `artifacts/punterstat/components/admin/course-form-modal.tsx` — new; create/edit course modal
- `artifacts/punterstat/components/admin/lesson-form-modal.tsx` — new; create/edit lesson modal
- `artifacts/punterstat/lib/admin/queries.ts` — added `getAllCategories()`, `getCourseWithDetails()`; updated `getAllCourses` and `getLessonsForCourse` to return richer fields (description, thumbnailUrl, content, videoUrl, categoryId, sortOrder)
- `artifacts/punterstat/lib/admin/actions.ts` — added `createCourse`, `updateCourse`, `createLesson`, `updateLesson` with validation, slug uniqueness error handling, and audit logging

Watch out for:
- Server actions are all guarded with `requireAdmin()` — this must stay.
- Slug pattern enforced client-side (pattern attr) and server-side (regex check). Duplicate slug returns a user-friendly message, not a raw Postgres error.
- `getCourseWithDetails` returns `AdminCourse & { categoryId }` — the intersection type is intentional; `categoryId` is already in `AdminCourse` after the type update.

---

### 2026-07-03 — Fix Total Users count mismatch (overview vs. users tab)
Agent: @replit-agent

What changed & why:
- Admin overview showed 1 user but the Users tab showed 0.
- Root cause: `getAllUsers` used `profiles.select("..., subscriptions(plan)")` — a PostgREST implicit FK join. But `profiles.user_id` and `subscriptions.user_id` both reference `auth.users.id`; there is **no direct FK between `profiles` and `subscriptions`**, so PostgREST silently returned no rows for the joined table, causing the whole query result to be empty.
- Fix: split into two separate queries (`profiles` + `subscriptions`), then merge by `user_id` in application code using a `Map`.

Files touched:
- `artifacts/punterstat/lib/admin/queries.ts` → `getAllUsers()`

Watch out for:
- This join pattern (two tables sharing the same FK target) will silently fail in PostgREST anywhere else it appears. Always check for direct FK presence before using the `relation(col)` syntax.

---

### 2026-07-03 — Course thumbnail: URL field + image preview
Agent: @replit-agent

What changed & why:
- Course cards on the public site already conditionally showed `thumbnailUrl` (falling back to the BookOpen icon), but there was no way to set it from the admin.
- Added `thumbnailUrl` to `AdminCourse` type, both course select queries (`getAllCourses`, `getCourseWithDetails`), and the course form modal.
- Initial implementation: a URL text input with a live `<img>` preview below it.

Files touched:
- `artifacts/punterstat/lib/admin/queries.ts` — `AdminCourse` interface + both select strings
- `artifacts/punterstat/components/admin/course-form-modal.tsx`

Watch out for:
- `createCourse` and `updateCourse` server actions already accepted `thumbnail_url` from `formData` before this change — no action changes were needed.

---

### 2026-07-03 — Course thumbnail: direct Cloudinary upload
Agent: @replit-agent

What changed & why:
- Replaced the URL-paste input with a clickable upload zone that:
  1. Opens a file picker (JPG/PNG/WebP/GIF, max 8 MB)
  2. Shows an instant local blob-URL preview before the upload starts
  3. Fetches a signed upload signature from `/api/upload?folder=thumbnails` (admin-gated server route)
  4. Uploads the file **directly browser → Cloudinary** (nothing passes through our server)
  5. Swaps the blob URL for the real `secure_url` returned by Cloudinary
  6. Stores the URL in a hidden `<input name="thumbnail_url">` so the server action receives it on submit
- Save button is disabled while an upload is in progress.
- A **Remove** button clears the thumbnail back to the book-icon placeholder.
- Recommended size hint added: **1280 × 720 px (16:9)** — displayed but not enforced.

Files touched:
- `artifacts/punterstat/components/admin/course-form-modal.tsx`

Watch out for:
- The `/api/upload?folder=thumbnails` route is guarded by `ADMIN_FOLDERS` in `app/api/upload/route.ts` — non-admin users get a 403.
- The upload uses `uploadToCloudinary()` from `lib/cloudinary/upload.ts` — same helper used by avatar uploads.
- Three env vars must be set in Vercel for uploads to work: `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
- The hidden input technique (not a form field the user interacts with directly) means the URL is always in sync with the upload state — no stale blob URLs can leak to the server action.

---

### 2026-07-03 — Blog full-text search + contact form delivery fix
Agent: @replit-agent

What changed & why:
- **Blog full-text search**: Added Supabase `textSearch()` across title, excerpt, and content. Created migration `007_blog_fts.sql` (stored `fts` tsvector column + GIN index). Updated `getPublishedPosts()` to accept an optional `search` string using websearch mode (natural-language input, no tsquery syntax needed). Added new `BlogSearch` client component that combines a search input (`?q=`) and tag pill filter (`?tag=`) in one UI — both params work independently; clearing one does not reset the other. Blog page now reads both params, passes them to the query, and shows query-aware empty states. Featured post is suppressed when any filter is active.
- **Contact form delivery fix**: Previously `submitContact` always returned `{ success: true }` even if `RESEND_API_KEY` was missing or Resend returned an error. Now the inbox email is awaited first; if delivery fails, the user sees a specific error with a direct email fallback. Confirmation email to the submitter remains fire-and-forget (its failure doesn't affect the response).
- **Open items closed**: Welcome email migration item closed — `006_fixes.sql` already exists in the repo; code already handles missing `welcome_sent` column gracefully (no crash, no email). CVE item closed — confirmed resolved by user.
- **DEVLOG.md** updated on `main` with a new "Post-Stage" entry covering all of the above.

Files touched:
- `artifacts/punterstat/supabase/migrations/007_blog_fts.sql` — new
- `artifacts/punterstat/components/blog/blog-search.tsx` — new
- `artifacts/punterstat/lib/blog/queries.ts` — search param + textSearch
- `artifacts/punterstat/app/(main)/blog/page.tsx` — reads `?q=`, uses BlogSearch
- `artifacts/punterstat/lib/contact/actions.ts` — proper error surfacing
- `DEVLOG.md` — new "Post-Stage" log entry appended

Watch out for:
- Migration `007_blog_fts.sql` must be applied in Supabase (SQL editor or `supabase db push`) before blog search returns results. Until then the search input renders but queries return empty.
- `tag-filter.tsx` is now superseded by `BlogSearch` on the blog page but was not deleted — it's an orphaned file. Safe to remove in a future cleanup pass.
- Contact form now returns an actionable error when `RESEND_API_KEY` is absent; set the key in Vercel environment variables to enable email delivery.
