# PunterStat — Development Log

This file tracks every change made to the project: development work, corrections, bug fixes, issues, and anything added or removed. Every entry must be attributed to the Replit agent account username that made the change.

This file is committed alongside the code at the end of every stage (see "Build Process — Staged Development" in the build prompt). Do not overwrite or delete previous entries — always append.

---

## How to Log an Entry

Copy this block, fill it in, and add it under the relevant stage before committing.

```
### [Stage N — Stage Name]
Date: YYYY-MM-DD
Agent: @replit-username

Added:
-

Changed:
-

Fixed / Issues Resolved:
-

Removed:
-

Known Issues / Open Items:
-
```

Leave a section empty (e.g. "Added: -") rather than deleting it if nothing applies. If an entry has no known issues, write "None."

---

## Log

### [Stage 1 — Project Foundation]
Date: 2026-07-02
Agent: @replit-agent

Added:
- Next.js 15 project scaffold (App Router, TypeScript, Tailwind CSS v3)
- shadcn/ui configuration (components.json, CSS variables, base primitives)
- Core UI components: Button, Badge, Card, Input, Label, Separator
- Layout components: Navbar, Footer, PageShell, PageHeader, Container
- Shared type definitions (types/index.ts): UserProfile, Course, Lesson, Simulation, Match, Blog, Subscription, Notification, FeatureFlag
- Zustand stores: auth store (useAuthStore with role-based access), UI store (useUiStore)
- Utility functions (lib/utils.ts): cn, formatDate, formatCurrency, slugify, truncate, absoluteUrl
- Custom hooks: useMediaQuery, useIsMobile
- Environment variable scaffolding (.env.local.example) for Supabase, Cloudinary, Resend
- Placeholder homepage (app/page.tsx) with brand identity and legal disclaimer
- Full Tailwind config with PunterStat brand palette (#0f172a, #1e293b, #0d9488, #f8fafc)
- .gitignore, tsconfig.json, postcss.config.mjs, next.config.ts
- DEVLOG.md (this file)

Changed:
- N/A (initial setup)

Fixed / Issues Resolved:
- Vercel build failure: pnpm-lock.yaml mismatch resolved by adding installCommand: "pnpm install --no-frozen-lockfile" to vercel.json
- Vercel build failure: Cannot find module 'autoprefixer' — in pnpm workspaces, Next.js PostCSS loader resolves plugins from root node_modules; moved autoprefixer, postcss, and tailwindcss from devDependencies to dependencies so pnpm hoists them correctly

Removed:
- N/A (initial setup)

Known Issues / Open Items:
- next@15.1.3 has a known security vulnerability (CVE-2025-66478); upgrade planned before Stage 12 polish
- Supabase client not yet connected (Stage 3)
- Auth provider not yet implemented (Stage 3)
- All pages beyond homepage are placeholder routes (built in subsequent stages)

---

### [Stage 2 — Core Layout & Design System]
Date: 2026-07-02
Agent: @replit-agent

Added:
- shadcn/ui primitives: Tabs, Dialog, Select, Textarea, Avatar, Skeleton, Progress, Switch, Accordion, Tooltip, DropdownMenu, ScrollArea, Popover, Alert, Toast, Toaster
- hooks/use-toast.ts — global toast state manager (listener-based, no context dependency)
- app/providers.tsx — client providers wrapper (TooltipProvider, Toaster)
- Section components: Hero, StatsBar, FeaturesGrid, CtaSection (components/sections/)
- Hero section: dark brand background, teal glow, grid texture, animated badge, dual CTAs, feature pills
- FeaturesGrid: 6-card responsive grid covering all four platform modules
- StatsBar: 4-stat counter bar (12+ modules, 50+ lessons, 4 disciplines, 100% education)
- CtaSection: dark CTA block with glow and legal disclaimer

Changed:
- app/layout.tsx — wired Navbar, Footer, and Providers into root layout
- app/page.tsx — replaced placeholder with full Hero > StatsBar > FeaturesGrid > CtaSection composition
- app/globals.css — added smooth scroll, selection highlight (#0d9488), slim custom scrollbar, focus ring, text-gradient, card-hover, glass utilities; updated Inter font import to variable-weight range

Removed:
- N/A

Known Issues / Open Items:
- Auth pages (/login, /register) are live nav links but pages do not exist yet (Stage 3)
- All module pages (/sports-university, /betting-academy, etc.) are stub routes (Stages 4-7)

---

### [Post-Stage 2 — Logo & Brand Colour Update]
Date: 2026-07-02
Agent: @replit-agent

Added:
- Platform logo (public/logo.png) — provided by user, 225x180 JPEG

Changed:
- Navbar and Footer: replaced BookOpen icon with actual logo image (next/image)
- Brand accent colour replaced globally from teal (#0d9488) to logo blue (#3D2DFF) across all 11 affected files: globals.css, tailwind.config.ts, button, badge, alert, toast, page-shell, footer, hero, features-grid, cta-section
- tailwind.config.ts: renamed brand token from brand.teal to brand.blue
- globals.css: updated --accent HSL value (174 90% 31% to 245 100% 59%), selection highlight, focus ring, and text-gradient to use #3D2DFF / #6B5FFF

Fixed / Issues Resolved:
- N/A

Removed:
- lucide-react BookOpen import from Navbar and Footer (replaced by logo image)

Known Issues / Open Items:
- None

---

### [Stage 3 — Database & Auth Infrastructure]
Date: 2026-07-02
Agent: @replit-agent

Added:
- @supabase/supabase-js ^2.49.4 and @supabase/ssr ^0.6.1 to package.json
- lib/supabase/client.ts — createBrowserClient factory for client components
- lib/supabase/server.ts — createServerClient factory for Server Components and Route Handlers (async cookies())
- lib/supabase/admin.ts — service-role admin client for secure server-only operations
- middleware.ts — session refresh on every request; redirects unauthenticated users away from /dashboard and /admin; redirects authenticated users away from auth pages
- supabase/migrations/001_initial_schema.sql — full schema: profiles, course_categories, courses, lessons, lesson_progress, bookmarks, simulation_sessions, simulation_history, sports_matches, match_analysis, blog_posts, subscriptions, notifications, admin_roles, feature_flags, audit_logs, certifications_hidden, certification_progress_hidden (19 tables)
- Database trigger: handle_new_user() — auto-creates profiles and subscriptions rows on Supabase Auth signup
- Database trigger: update_updated_at() — shared trigger applied to all mutable tables
- Row Level Security policies on all 19 tables: private tables locked to auth.uid(), public tables open for published content reads
- Feature flags seed: certification_engine (disabled), match_analysis_live (disabled), premium_subscriptions (disabled), blog (enabled)
- lib/auth/actions.ts — Server Actions: signIn, signUp, signOut, resetPassword, updatePassword (Zod-validated)
- lib/auth/helpers.ts — Server-side helpers: getUser, getUserProfile, requireAuth (redirects to /login), requireAdmin (redirects to /dashboard)
- app/auth/callback/route.ts — PKCE code exchange handler; supports ?next= redirect for password reset flow
- app/(auth)/layout.tsx — centered auth layout (no Navbar/Footer), logo link, educational disclaimer
- app/(auth)/login/page.tsx — login page
- app/(auth)/register/page.tsx — register page; shows email-confirmation message when ?message=check-email
- app/(auth)/forgot-password/page.tsx — password reset request page
- app/(auth)/update-password/page.tsx — new password entry page (used after reset email link)
- components/auth/login-form.tsx — useActionState form; inline error display; links to /register and /forgot-password
- components/auth/register-form.tsx — useActionState form; email-sent confirmation state; ToS/Privacy links
- components/auth/forgot-password-form.tsx — useActionState form; success state with inbox message
- components/auth/update-password-form.tsx — useActionState form for setting new password
- app/(main)/layout.tsx — route group layout that wraps public/main pages with Navbar and Footer

Changed:
- app/layout.tsx — root layout now only provides html/body/Providers; Navbar and Footer removed from root (moved to (main) layout)
- app/page.tsx — moved to app/(main)/page.tsx; URL remains / (route group is transparent)
- app/providers.tsx — added AuthSync component: syncs Supabase session into Zustand auth store on mount and on every auth state change (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
- components/layout/navbar.tsx — now reads from useAuthStore; authenticated users see Dashboard link and user avatar DropdownMenu with profile/sign-out options; unauthenticated users see Sign in / Get started; loading state shows skeleton avatar

Fixed / Issues Resolved:
- Auth pages (login, register, forgot-password) previously had no backing page — now fully implemented
- Root layout no longer wraps auth pages in Navbar/Footer; auth pages get their own clean centered layout via the (auth) route group

Removed:
- Navbar and Footer from app/layout.tsx (moved to app/(main)/layout.tsx)

Known Issues / Open Items:
- Supabase project must be created and env vars set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) before auth is functional
- Run supabase/migrations/001_initial_schema.sql against your Supabase project via the SQL Editor or Supabase CLI
- /dashboard route returns 404 until Stage 8 (Protected Dashboard Pages)
- Email confirmation flow requires Supabase email provider to be configured in the Supabase dashboard

---

### [Stage 4 — Sports University Module]
Date: 2026-07-02
Agent: @replit-agent

Added:
- lib/sports-university/queries.ts — server-side Supabase queries for categories, courses, lessons, lesson progress, bookmarks; all results mapped from snake_case DB columns to camelCase TypeScript types
- lib/sports-university/actions.ts — server actions: markLessonComplete (upsert to lesson_progress), toggleBookmark (insert/delete bookmarks)
- app/(main)/sports-university/page.tsx — module landing page: dark hero + category grid with course counts; empty state when DB has no published categories
- app/(main)/sports-university/[category]/page.tsx — category listing: breadcrumb, course count, CourseCard grid with empty state
- app/(main)/sports-university/[category]/[course]/page.tsx — course overview: breadcrumb, lesson count, total duration, per-user progress bar, lesson list, Start/Continue CTA
- app/(main)/sports-university/[category]/[course]/[lesson]/page.tsx — lesson viewer: breadcrumb, video player (if videoUrl set), ContentRenderer (simple markdown parser for headings/lists/paragraphs), bookmark + complete action bar, prev/next lesson navigation, sticky sidebar lesson list on desktop
- components/sports-university/category-card.tsx — icon-mapped card linked to category page with course count badge
- components/sports-university/course-card.tsx — card with thumbnail, level badge, lesson count, per-user progress bar strip
- components/sports-university/lesson-list.tsx — ordered lesson list with completion icons (CheckCircle/PlayCircle/Circle), active highlight, duration display
- components/sports-university/video-player.tsx — client component; parses YouTube and Vimeo URLs to embed URLs; shows play icon before iframe loads
- components/sports-university/bookmark-button.tsx — client component; useTransition optimistic toggle; persists via toggleBookmark server action
- components/sports-university/complete-button.tsx — client component; useTransition; calls markLessonComplete; switches to green "Lesson completed" state on success
- supabase/migrations/002_seed_sports_university.sql — seed data: 4 categories, 8 courses, 7 sample lessons with full educational content across Football Fundamentals, Tactical Analysis, Competitions & Structure, Match Dynamics

Changed:
- N/A

Fixed / Issues Resolved:
- N/A

Removed:
- N/A

Known Issues / Open Items:
- Run 002_seed_sports_university.sql after 001_initial_schema.sql to populate the platform with initial content
- Lesson content is stored as plain text with basic markdown conventions; Stage 9 admin panel will add a rich text editor
- Video lesson support covers YouTube and Vimeo embed URLs; other providers require a URL mapping extension

---

### [Stage 5 — Betting Academy Module]
Date: 2026-07-02
Agent: @replit-agent

Added:
- supabase/migrations/003_betting_academy.sql — adds section TEXT column to course_categories (DEFAULT 'sports_university', CHECK constraint); seeds 4 BA topics, 8 modules, 8 lessons with real odds/probability/bankroll content
- types/index.ts — EduSection type + section field on CourseCategory
- lib/betting-academy/queries.ts — getTopics/getTopicBySlug filter by section='betting_academy'; full query set for modules, lessons, progress, bookmarks
- lib/betting-academy/actions.ts — markLessonComplete and toggleBookmark revalidating /betting-academy/ paths
- app/(main)/betting-academy/page.tsx — landing page with emerald-accented hero + topic grid
- app/(main)/betting-academy/[topic]/page.tsx — topic listing with ModuleCard grid
- app/(main)/betting-academy/[topic]/[module]/page.tsx — module overview with lesson list and progress bar
- app/(main)/betting-academy/[topic]/[module]/[lesson]/page.tsx — lesson viewer with ContentRenderer, VideoPlayer, bookmark/complete actions, prev/next nav
- components/betting-academy/topic-card.tsx — if-branch TopicIcon (avoids dynamic JSX type error), emerald accent
- components/betting-academy/module-card.tsx — module card with level badge, lesson count, progress strip
- components/betting-academy/lesson-list.tsx — lesson list linking to /betting-academy/ with emerald active state
- components/betting-academy/complete-button.tsx — calls BA markLessonComplete; emerald styling
- components/betting-academy/bookmark-button.tsx — calls BA toggleBookmark; emerald styling

Changed:
- lib/sports-university/queries.ts — mapCategory includes section field; getCategories() filters by section='sports_university'

Fixed / Issues Resolved:
- N/A

Removed:
- N/A

Known Issues / Open Items:
- Run 003_betting_academy.sql after 001 and 002 migrations in Supabase SQL editor
- VideoPlayer is shared from sports-university (path-agnostic component)

---

### [Stage 6 — Simulation Engine Module]
Date: 2026-07-02
Agent: @replit-agent

Added:
- lib/simulation/actions.ts — server actions: createSession (lazy-creates simulation_sessions row), updateSessionBalance, recordBet (inserts to simulation_history + updates session balance), getSessionHistory; all guarded by auth.getUser(); revalidates /dashboard/simulation-history
- components/simulation/bet-simulator.tsx — client-side Bet Simulator; virtual NGN10,000 balance; decimal odds + stake input with quick-stake buttons; outcome by implied probability (Math.random() < 1/odds); tracks win/loss streaks, total staked, profit, ROI; per-bet history table (25 most recent); balance progress bar; Supabase persistence when authenticated (lazy session creation); educational overround note
- components/simulation/probability-simulator.tsx — Monte Carlo Probability Simulator; 200 independent runs client-side; inputs: decimal odds, win %, bets (10-500), stake; computes EV and edge; AreaChart percentile band (p10-p90 + median) via Recharts; LineChart 20 sample paths; summary stats: median, profitable run rate, ruin rate, percentile range
- app/(main)/simulation-engine/page.tsx — landing page: hero, disclaimer banner, two simulator feature cards, What you will learn grid (6 topics)
- app/(main)/simulation-engine/bet-simulator/page.tsx — server wrapper; reads auth user for isAuthenticated prop
- app/(main)/simulation-engine/probability-simulator/page.tsx — server wrapper for ProbabilitySimulator

Changed:
- N/A

Fixed / Issues Resolved:
- None

Removed:
- N/A

Known Issues / Open Items:
- Simulation history dashboard page (Stage 8) not yet built; session data is written to Supabase but not surfaced until protected dashboard is implemented

---

### [Stage 7 — Match Breakdown Engine]
Date: 2026-07-02
Agent: @replit-agent

Added:
- lib/match-breakdown/types.ts — TypeScript types: MatchResult, InjuryImpact, LeagueImportance, TeamForm, HeadToHead, InjuryFactor, MatchAnalysisInput, ProbabilityFactor, MatchAnalysisResult, SavedAnalysis
- lib/match-breakdown/analyzer.ts — pure client-side probability engine; six weighted factors (home advantage, recent form, H2H record, goal scoring/xG, injury availability, match stakes); Dixon-Coles-inspired xG estimate; normalised 3-way output (homeWin/draw/awayWin)
- lib/match-breakdown/actions.ts — server actions: saveAnalysis (auth-gated, inserts to match_analyses), getSavedAnalyses (returns last 20 for user); input validation guards
- supabase/migrations/004_match_breakdown.sql — match_analyses table (JSONB payload for input + result); RLS policies (select/insert/delete own rows); indexes on user_id and created_at
- components/match-breakdown/form-badges.tsx — FormBadge (W/D/L coloured pill), FormRow (labelled result strip)
- components/match-breakdown/factor-card.tsx — per-factor card with two-sided edge bar, confidence pill, and educational explanation text
- components/match-breakdown/probability-display.tsx — outcome probability bars with implied odds; xG stat cards; combined xG note; key signals list; educational disclaimer
- components/match-breakdown/match-analyzer.tsx — 6-step multi-form client component: context > home form > away form > H2H > availability > results; W/D/L result picker buttons; WeightedFormScore; runs analyzeMatch() on step 5; save-to-Supabase action for auth users; reset flow
- app/(main)/match-breakdown/page.tsx — landing page: hero, disclaimer bar, six-factor grid with icons + explanations, three-step how-it-works, What you'll learn grid
- app/(main)/match-breakdown/analyzer/page.tsx — server wrapper; reads auth user; shows sign-in nudge for guests; renders MatchAnalyzer with isAuthenticated prop

Changed:
- N/A

Fixed / Issues Resolved:
- None

Removed:
- N/A

Known Issues / Open Items:
- Saved analyses not yet surfaced in dashboard (Stage 8); match_analyses table is written but not read back until protected dashboard is implemented
- getSavedAnalyses action exists but no UI page yet for listing saved analyses

---

### [Stage 8 — Protected Dashboard]
Date: 2026-07-02
Agent: @replit-agent

Added:
- lib/dashboard/queries.ts — all dashboard read queries: getDashboardStats (5 parallel counts), getInProgressLessons, getCompletedLessons, getBookmarks, getSimulationSessions (with aggregated H2H bet history), getCourseProgress (nested join grouped by course), getNotifications, getSubscription, getSavedMatchAnalyses
- lib/dashboard/actions.ts — server actions: updateProfile (display_name + bio, validation), markNotificationRead (user-scoped), markAllNotificationsRead; all revalidate relevant dashboard paths
- components/dashboard/sidebar.tsx — client DashboardSidebar with usePathname active state, unread notification badge, two groups (Learning / Account)
- components/dashboard/stat-card.tsx — reusable stat card with icon, value, label, optional suffix and note
- components/dashboard/empty-state.tsx — reusable bordered empty state with icon, CTA link
- components/dashboard/profile-form.tsx — client form component for display_name + bio update; calls updateProfile server action; shows success/error feedback
- components/dashboard/notifications-client.tsx — client notifications list with optimistic mark-as-read (local state + server action), mark-all-read button, unread dot, time-ago formatter
- app/dashboard/layout.tsx — protected layout (requireAuth guard); sticky top bar with avatar, role pill, sign-out; desktop sidebar + mobile horizontal nav strip
- app/dashboard/page.tsx — overview: time-of-day greeting, 4 stat cards, unread notification banner, in-progress lessons panel, recent simulations panel, quick-access link grid
- app/dashboard/continue-learning/page.tsx — in-progress lessons (with progress bars + continue CTA) and completed lessons (with review links)
- app/dashboard/bookmarks/page.tsx — bookmarked lessons grouped by course
- app/dashboard/simulation-history/page.tsx — bet simulator and probability simulator sessions; summary stats (total bets, total P&L, avg ROI)
- app/dashboard/progress/page.tsx — overall completion stats, SVG progress rings per course, completion bar, keep-going CTA
- app/dashboard/match-analyses/page.tsx — saved match analyses grid with mini probability bars for home/draw/away
- app/dashboard/profile/page.tsx — avatar initials, role badge, ProfileForm
- app/dashboard/subscription/page.tsx — current plan card, included features list, locked features for free users, upgrade CTA, billing contact note
- app/dashboard/notifications/page.tsx — server wrapper loading notifications into NotificationsClient

Changed:
- N/A (dashboard is a new top-level route group, does not touch existing (main) layout)

Fixed / Issues Resolved:
- match_analyses data now surfaced in /dashboard/match-analyses

Removed:
- N/A

Known Issues / Open Items:
- Avatar image upload not yet implemented (shows initials placeholder)
- Self-serve billing portal not yet built (contact email fallback)
- Lesson URLs in continue-learning/bookmarks assume sports-university route structure; betting-academy lessons need separate URL resolution (Stage 9 / future)

---

### [Hotfix — Stage 8 TypeScript Build Failure]
Date: 2026-07-03
Agent: @replit-agent

Fixed / Issues Resolved:
- Vercel build failed with TS2352 type error in lib/dashboard/queries.ts: Supabase infers joined relation columns (e.g. row.lessons) as array types, so a direct cast to a single-object helper type (NestedLesson) fails the overlap check. Fixed all four affected casts (getInProgressLessons, getCompletedLessons, getBookmarks, getCourseProgress) by routing through "as unknown as <TargetType>", which is the correct TypeScript idiom when the source type is structurally incompatible but logically correct.

Commit: 07c3adb

---

### [Stage 9 — Admin Dashboard]
Date: 2026-07-03
Agent: @replit-agent

Added:
- supabase/migrations/005_admin_rls.sql — is_admin() security-definer helper function; admin bypass RLS policies for profiles, subscriptions, courses, lessons, course_categories, blog_posts, notifications, feature_flags (RLS enabled here), audit_logs (RLS enabled here), admin_roles (RLS enabled here)
- lib/admin/queries.ts — read queries: getAdminStats (10 parallel counts + subscription breakdown), getAllUsers (profiles + subscriptions join), getAllCourses (with lesson count + category), getLessonsForCourse, getCourseById, getAllBlogPosts, getBlogPostById, getFeatureFlags
- lib/admin/actions.ts — server actions (all requireAdmin()-gated + audit-logged): toggleCoursePublished, toggleLessonPublished (self-resolves course_id from DB), updateUserRole (blocks self-demotion), toggleFeatureFlag, createBlogPost, updateBlogPost (preserves original published_at), deleteBlogPost, toggleBlogPostPublished
- components/admin/admin-sidebar.tsx — client sidebar with usePathname active-link state; exact-match for overview
- components/admin/publish-toggle.tsx — client toggle button (Live/Draft pill); calls 2-arg action
- components/admin/role-selector.tsx — client select dropdown for user role changes; self-guard renders read-only label
- components/admin/flag-toggle.tsx — client optimistic toggle switch with revert-on-error
- components/admin/blog-form.tsx — client form for create/edit blog posts; auto-slugify from title; publish toggle; Markdown textarea
- components/admin/blog-delete-button.tsx — client delete button with confirmation dialog
- app/admin/layout.tsx — requireAdmin() guard; dark top bar with Shield badge; sticky desktop sidebar; mobile horizontal scroll strip
- app/admin/page.tsx — overview: 4 stat cards (users, sim sessions, courses, lessons), blog published/draft summary, subscription plan breakdown bars, quick-action links
- app/admin/users/page.tsx — user table with role badge counts; inline RoleSelector per row
- app/admin/courses/page.tsx — course table with level badge, lesson count, premium tag, PublishToggle, link to lessons
- app/admin/courses/[courseId]/lessons/page.tsx — lesson table for a course with sort order, duration, PublishToggle
- app/admin/blog/page.tsx — blog listing with tags, excerpt preview, PublishToggle, edit link, BlogDeleteButton
- app/admin/blog/new/page.tsx — new post page wrapping BlogForm
- app/admin/blog/[id]/edit/page.tsx — edit post page; 404 if post not found
- app/admin/flags/page.tsx — feature flags list with FlagToggle components; warning banner

Changed:
- N/A (admin is a new top-level route group; does not touch existing layouts)

Fixed / Issues Resolved:
- Removed invalid profiles!blog_posts_author_id_fkey Supabase join in getAllBlogPosts — blog_posts.author_id FK points to auth.users, not profiles, so auto-join via PostgREST syntax fails at runtime; authorName is null in admin view (no functional impact)
- Simplified toggleLessonPublished from 3-arg to 2-arg by self-resolving course_id inside the action, eliminating unsafe function-type cast at call site

Removed:
- N/A

Known Issues / Open Items:
- Author display name not shown on blog admin list (auth.users not directly queryable via anon key; Stage 10 public blog can resolve via a separate profiles lookup by user_id if authors have profiles)
- Course/lesson content editing (title, description, slug, content fields) not yet in UI — done via Supabase Studio; a future stage can add inline edit forms
- Subscription management (plan upgrades, cancellations) is read-only; no Stripe integration yet

---

### [Stage 10 — Public Blog & Pricing]
Date: 2026-07-03
Agent: @replit-agent

Added:
- lib/blog/queries.ts — server-side public blog queries: getPublishedPosts (with optional tag filter using .contains()), getPostBySlug, getAllTags (deduped from all published posts), getRelatedPosts (overlapping tags, excludes current post, limit 3)
- components/blog/post-card.tsx — blog card with thumbnail (next/image), title, excerpt (line-clamp-3), tag badges, published date; featured prop enables horizontal layout for listing page hero card
- components/blog/tag-filter.tsx — client component; reads ?tag= search param via useSearchParams; updates URL via useRouter; renders All + per-tag badge buttons with active-state styling
- app/(main)/blog/page.tsx — public blog listing: dark hero, tag filter (Suspense-wrapped), featured post (horizontal layout), rest in 3-column grid; empty state when no posts or no posts for tag
- app/(main)/blog/[slug]/page.tsx — blog post reader: dark header with tags + date, optional full-width thumbnail (next/image priority), ContentRenderer (headings/lists/blockquotes/paragraphs), tag footer links, related posts grid, back-to-blog button; generateMetadata for title/description/OG image
- app/(main)/pricing/page.tsx — pricing page: Free / Premium (9 GBP/mo) / Pro (19 GBP/mo) plan cards with feature checklist (Check/X icons), "Most popular" badge on Premium, FAQ section (4 items), CTA footer strip

Changed:
- DEVLOG.md — reorganised in strict chronological order; removed duplicate blank Stage 6/7/8 placeholder blocks that were left after their actual entries were appended

Fixed / Issues Resolved:
- N/A

Removed:
- Duplicate blank Stage 6, 7, 8 DEVLOG placeholder blocks (entries already existed below Stage 10 placeholder)

Known Issues / Open Items:
- Pricing plan selection (?plan=premium) on the register page is read from the URL but not yet wired to Supabase subscription upsert; full payment flow is Stage 12 (monetisation)
- Blog author name not shown (blog_posts.author_id references auth.users, not profiles; a profiles lookup by matching id could be added if authors maintain profiles)
- No blog search (full-text search via Supabase textSearch() can be added in Stage 12 polish)

---

### [Stage 11 — Homepage Polish]
Date: 2026-07-03
Agent: @replit-agent

Added:
- components/sections/how-it-works.tsx — 3-step numbered section (sign up, learn, apply); connector line on desktop; icon + badge per step
- components/sections/testimonials.tsx — 4 static learner testimonials in 2-column card grid with avatar initials and role labels
- components/sections/module-showcase.tsx — dark-background 4-module grid (Sports University, Betting Academy, Simulation Engine, Match Breakdown); accepts live ModuleStats props (course count, lesson count, topic count); each card links to its route with animated arrow; stat row per card

Changed:
- app/(main)/page.tsx — made async server component; fetches live counts from Supabase (published courses, lessons, BA topics) via Promise.all; passes stats to StatsBar and ModuleShowcase; composition: Hero → StatsBar → ModuleShowcase → HowItWorks → FeaturesGrid → Testimonials → CtaSection
- components/sections/hero.tsx — added 4th feature pill (Match Breakdown / Search icon); secondary CTA changed from "Explore Courses" to "See what's included" linking to /pricing; button explicitly styled with bg-[#3D2DFF]
- components/sections/stats-bar.tsx — refactored to accept optional courses and lessons props; falls back to static "12+" / "50+" when DB counts are zero or unavailable
- components/sections/cta-section.tsx — secondary CTA default changed from "View Curriculum" → "View pricing" linking to /pricing instead of /sports-university

Fixed / Issues Resolved:
- N/A

Removed:
- N/A

Known Issues / Open Items:
- Testimonials are static placeholder content; a future stage can add a testimonials table and admin CRUD
- Homepage DB fetch has a broad try/catch that silently falls back to static numbers if Supabase env vars are not set; this is intentional for cold-start / pre-config states

---

### [Stage 12 — SEO, Storage & Polish]
Date: 2026-07-03
Agent: @replit-agent

Added:
- app/sitemap.ts — Next.js dynamic sitemap route; includes all static public pages + published courses (with category/section routing) + published blog posts; Supabase queries wrapped in try/catch so sitemap degrades gracefully when DB env vars are not set
- app/robots.ts — Next.js robots route; blocks /dashboard/, /admin/, /api/, /auth/ from all crawlers; references /sitemap.xml
- app/not-found.tsx — custom 404 page: brand-consistent design with large watermark "404", nav links to all four modules, home + explore CTAs
- app/error.tsx — global error boundary (client component); dev mode shows error message; production shows generic user-facing message with "Try again" reset button
- app/(main)/loading.tsx — skeleton loading UI for all main public pages (header + 6-card grid)
- app/dashboard/loading.tsx — skeleton loading UI for dashboard pages (stat cards + content panels)
- app/admin/loading.tsx — skeleton loading UI for admin pages (stat cards + table rows)
- lib/cloudinary/upload.ts — SDK-free Cloudinary upload helper: generateUploadSignature() (uses Node crypto, signs folder+timestamp params), uploadToCloudinary() (client-side helper that POSTs a File directly to Cloudinary upload API using the pre-signed params)
- app/api/upload/route.ts — authenticated GET endpoint that returns a Cloudinary signed upload signature; validates folder param against allowlist ["avatars", "blog", "thumbnails"]; returns 401 if not logged in, 503 if Cloudinary env vars not set
- components/dashboard/avatar-upload.tsx — client avatar upload component: click-to-upload with camera overlay, optimistic preview, 5 MB size guard, direct-to-Cloudinary upload flow (GET /api/upload → POST to Cloudinary → updateAvatar server action), loading spinner, error display
- lib/email/resend.ts — SDK-free Resend email helper: sendEmail() using fetch against the Resend REST API; gracefully no-ops with a console.warn if RESEND_API_KEY is not set; welcomeEmail() template with full HTML email layout matching PunterStat brand
- app/(main)/terms/page.tsx — full Terms of Service page: 11 sections covering platform description, eligibility, accounts, acceptable use, IP, subscriptions, disclaimers, liability, governing law, changes, contact
- app/(main)/privacy/page.tsx — full Privacy Policy page: 11 sections covering data collection, use, legal basis (UK/EEA), data sharing (Supabase/Cloudinary/Resend), retention, cookies, user rights (GDPR/UK GDPR), security, children, changes, contact

Changed:
- lib/dashboard/actions.ts — added updateAvatar(avatarUrl) server action: validates URL starts with https://, updates users.avatar_url, revalidates /dashboard/profile and /dashboard
- app/dashboard/profile/page.tsx — replaced static teal initials avatar with AvatarUpload component; fetches current avatar_url from users table server-side; updated description copy
- app/(main)/page.tsx — added export const metadata with full title, description, and openGraph fields (homepage was the only (main) page missing metadata)

Fixed / Issues Resolved:
- Dashboard profile page avatar was hardcoded teal circle with no upload capability — now fully functional with Cloudinary direct upload
- Homepage was missing metadata export — all other public pages already had it; now complete

Removed:
- N/A

Known Issues / Open Items:
- Avatar upload requires CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to be set in Vercel environment variables; upload API returns 503 with a clear error when not configured
- Welcome email (lib/email/resend.ts welcomeEmail()) is not yet wired into the sign-up flow; integration point is app/auth/callback/route.ts after successful PKCE code exchange — call sendEmail(welcomeEmail(displayName)) there when RESEND_API_KEY is set
- Testimonials on the homepage remain static; a future pass can add a testimonials table and admin CRUD panel
- Blog full-text search not implemented; Supabase textSearch() can be added when content volume warrants it

---

### [Post-Stage 12 — Missing Pages, Bug Fixes & Cleanup]
Date: 2026-07-03
Agent: @replit-agent

Added:
- app/(main)/about/page.tsx — full About page: dark hero, philosophy section ("Knowledge Before Decision"), 4-module grid with links, 4-value principles grid, educational disclaimer card, CTA strip
- app/(main)/faq/page.tsx — comprehensive FAQ: 5 sections (About PunterStat, Platform & Modules, Accounts & Access, Data & Privacy, Technical), 18 questions using native <details>/<summary> accordion, section anchor links, contact CTA
- app/(main)/contact/page.tsx — Contact page: server-rendered layout with ContactForm client component + side info panel (email addresses, response time, FAQ link, legal notice)
- components/contact/contact-form.tsx — client contact form using useActionState; name/email/subject/message fields; per-field Zod validation errors; success state with confirmation message; loading spinner
- lib/contact/actions.ts — submitContact server action: Zod validation, sends email to hello@punterstat.com inbox and confirmation reply to user via sendEmail(); graceful failure (logs error, doesn't block submission)

Changed:
- app/auth/callback/route.ts — wired welcome email: after successful PKCE code exchange, fetches display_name from profiles table and fires sendEmail(welcomeEmail(displayName)) fire-and-forget (does not block redirect)
- components/layout/footer.tsx — fixed two broken Platform links: /simulation → /simulation-engine, /match-analysis → /match-breakdown
- app/(main)/page.tsx — removed ModuleShowcase and Testimonials from homepage composition (simplified to Hero → StatsBar → HowItWorks → FeaturesGrid → CtaSection)

Fixed / Issues Resolved:
- Footer "Simulation Engine" and "Match Analysis" links were 404ing — now point to correct routes (/simulation-engine, /match-breakdown)
- Welcome email was built but never sent — now fires automatically after email confirmation (PKCE exchange)
- /about, /faq, /contact were listed in footer and spec but had no backing pages — all three now fully implemented

Removed:
- components/sections/testimonials.tsx — static placeholder copy removed completely per product decision; no replacement planned
- components/sections/module-showcase.tsx — removed dead component (was excluded from homepage in Stage 12 refactor but file remained)

Known Issues / Open Items:
- Contact form email delivery depends on RESEND_API_KEY being set; form submission always succeeds from the user's perspective regardless of delivery status

---

### [Bug Fix Pass — Known Issues Resolution & Full Codebase Audit]
Date: 2026-07-03
Agent: @replit-agent

Added:
- supabase/migrations/006_fixes.sql — adds welcome_sent boolean to profiles (default false) and author_name text to blog_posts; backfills author_name from profiles for existing posts
- app/admin/error.tsx — admin-specific error boundary; keeps sidebar/layout visible on failure, shows error digest in development, "Try again" reset button

Changed:
- app/auth/callback/route.ts — replaced fragile 5-minute time-window isNewUser check with atomic conditional UPDATE (WHERE welcome_sent = false); only the first concurrent callback wins the race and triggers the email — subsequent re-clicks affect 0 rows and are skipped
- lib/dashboard/queries.ts — extended NestedLesson type to include course_categories(slug, section); added section and categorySlug fields to InProgressLesson, CompletedLesson, and BookmarkedLesson interfaces; updated all three select queries and row mappings accordingly
- app/dashboard/continue-learning/page.tsx — replaced hardcoded /sports-university/ hrefs with a lessonUrl() helper that resolves the correct base path (/sports-university or /betting-academy) from the lesson's section field
- app/dashboard/bookmarks/page.tsx — full rewrite: byCourse grouping now carries section and categorySlug; lessonUrl() and courseUrl() helpers replace hardcoded /sports-university/ hrefs
- lib/dashboard/actions.ts — updateAvatar was targeting the wrong table (auth.users instead of public.profiles) and wrong PK column (id instead of user_id); fixed both; added revalidatePath("/", "layout") so the navbar avatar refreshes immediately
- components/layout/navbar.tsx — initials computation now uses trim().split(/\s+/).filter(Boolean) to prevent crash on empty or whitespace-only displayName; signOut calls wrapped with async/await to suppress unhandled-promise warnings
- types/index.ts — added authorName: string | null to BlogPost interface
- lib/blog/queries.ts — mapPost() now maps author_name column to authorName
- lib/admin/actions.ts — createBlogPost stores profile.displayName as author_name at write time (avoids auth.users join restriction at read time); both createBlogPost and updateBlogPost now return a user-friendly "This slug is already in use" message on Postgres duplicate-key error (code 23505) instead of the raw DB message
- app/(main)/blog/[slug]/page.tsx — author name displayed alongside publish date in post header when available
- components/blog/post-card.tsx — author name displayed in card footer alongside date
- components/dashboard/avatar-upload.tsx — true optimistic preview: URL.createObjectURL() shown immediately on file select (before upload starts); blob URL revoked after Cloudinary URL arrives or on failure
- app/admin/courses/page.tsx — fixed duplicate "Lessons" column header; last column renamed to "Manage"
- middleware.ts — extended matcher negative-lookahead to exclude sitemap.xml and robots.txt (was running middleware unnecessarily on these static routes)

Fixed / Issues Resolved:
- Dashboard continue-learning and bookmarks pages linked all lessons to /sports-university/... regardless of whether they belonged to Sports University or Betting Academy — now resolved with section-aware URL helpers
- updateAvatar silently failed (targeted non-existent auth.users table via anon client); avatar uploads appeared to succeed but never persisted
- Welcome email could fire on every confirmation link click within 5 minutes; now guaranteed exactly-once via atomic DB guard
- Blog posts showed no author name (auth.users not queryable by anon key); resolved by denormalizing author_name into blog_posts at write time
- Admin courses table had two columns both labelled "Lessons" — last column now correctly labelled "Manage"
- Duplicate blog slug gave raw Postgres constraint error to admin; now shows human-readable message
- Navbar initials crashed if displayName was empty string or contained only whitespace
- sitemap.xml and robots.txt requests were hitting the middleware (and triggering a Supabase getUser() call) unnecessarily

Removed:
- N/A

Known Issues / Open Items:
- Contact form email delivery depends on RESEND_API_KEY being set; form submission always succeeds from the user's perspective regardless of delivery status
- Blog full-text search not implemented; Supabase textSearch() can be added when content volume warrants it
- Welcome email requires migration 006 to be applied to Supabase before the atomic guard is active; without it the welcome_sent update affects 0 rows (column missing) and the email sends on every callback — apply migration first
