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
- Vercel build failure: `pnpm-lock.yaml` mismatch resolved by adding `installCommand: "pnpm install --no-frozen-lockfile"` to vercel.json
- Vercel build failure: `Cannot find module 'autoprefixer'` — in pnpm workspaces, Next.js PostCSS loader resolves plugins from root node_modules; moved autoprefixer, postcss, and tailwindcss from devDependencies to dependencies so pnpm hoists them correctly

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
- app/page.tsx — replaced placeholder with full Hero → StatsBar → FeaturesGrid → CtaSection composition
- app/globals.css — added smooth scroll, selection highlight (#0d9488), slim custom scrollbar, focus ring, text-gradient, card-hover, glass utilities; updated Inter font import to variable-weight range

Removed:
- N/A

Known Issues / Open Items:
- Auth pages (/login, /register) are live nav links but pages do not exist yet (Stage 3)
- All module pages (/sports-university, /betting-academy, etc.) are stub routes (Stages 4–7)

---

### [Post-Stage 2 — Logo & Brand Colour Update]
Date: 2026-07-02
Agent: @replit-agent

Added:
- Platform logo (public/logo.png) — provided by user, 225×180 JPEG

Changed:
- Navbar and Footer: replaced BookOpen icon with actual logo image (next/image)
- Brand accent colour replaced globally from teal (#0d9488) to logo blue (#3D2DFF) across all 11 affected files: globals.css, tailwind.config.ts, button, badge, alert, toast, page-shell, footer, hero, features-grid, cta-section
- tailwind.config.ts: renamed brand token from `brand.teal` → `brand.blue`
- globals.css: updated --accent HSL value (174 90% 31% → 245 100% 59%), selection highlight, focus ring, and text-gradient to use #3D2DFF / #6B5FFF

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
Date: 
Agent: @

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

---

### [Stage 7 — Match Breakdown Engine Module]
Date: 
Agent: @

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

---

### [Stage 8 — Protected Dashboard Pages]
Date: 
Agent: @

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

---

### [Stage 9 — Admin Dashboard]
Date: 
Agent: @

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

---

### [Stage 10 — Public Pages & Blog]
Date: 
Agent: @

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
- components/match-breakdown/match-analyzer.tsx — 6-step multi-form client component: context → home form → away form → H2H → availability → results; W/D/L result picker buttons; WeightedFormScore; runs analyzeMatch() on step 5; save-to-Supabase action for auth users; reset flow
- app/(main)/match-breakdown/page.tsx — landing page: hero, disclaimer bar, six-factor grid with icons + explanations, three-step how-it-works, "What you'll learn" grid
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
- Vercel build failed with TS2352 type error in lib/dashboard/queries.ts: Supabase infers joined relation columns (e.g. `row.lessons`) as array types, so a direct cast to a single-object helper type (`NestedLesson`) fails the overlap check. Fixed all four affected casts (`getInProgressLessons`, `getCompletedLessons`, `getBookmarks`, `getCourseProgress`) by routing through `as unknown as <TargetType>`, which is the correct TypeScript idiom when the source type is structurally incompatible but logically correct.

Commit: 07c3adb

---

### [Stage 11 — Homepage]
Date: 
Agent: @

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

---

### [Stage 12 — SEO, Storage & Polish]
Date: 
Agent: @

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
