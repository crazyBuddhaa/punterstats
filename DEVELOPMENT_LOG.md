# PunterStat — Development Log

> **Purpose:** Running record of all completed, in-progress, and planned development work.
> **Update policy:** Update this file with every push to `main`. Log the commit hash, date, and a brief summary.

---

## Legend
| Status | Meaning |
|--------|---------|
| ✅ Done | Pushed to `main`, migration applied |
| 🔄 In Progress | Currently being implemented |
| 📋 Planned | Scoped and staged, not yet started |
| 💡 Idea | Considered but not formally scoped |

---

## Completed Work

### Infrastructure & Auth

#### ✅ Auth Redirect — Authenticated Users on Landing Page
**Commit:** `f0b183c` · **Date:** 2026-07-08

Fixed authenticated users landing on the guest-facing homepage with guest CTAs.

**Files changed:**
- `middleware.ts` — redirect `/` → `/dashboard` for sessions
- `app/(main)/page.tsx` — `isAuthenticated` resolved server-side
- `components/sections/hero.tsx` — session-aware CTA (Dashboard vs Register)
- `components/sections/cta-section.tsx` — same session-aware logic
- `components/layout/navbar.tsx` — logo href `/dashboard` when authenticated

---

#### ✅ Resend Email Integration — Branded Transactional Templates
**Commit:** `d3854ab` · **Date:** 2026-07-08

Full email system setup: Resend API client, branded HTML template suite, welcome email wired to signup, Supabase dashboard templates.

**Files changed:**
- `lib/email/resend.ts` — cleaner client with array recipients, from/replyTo overrides
- `lib/email/templates.ts` — full suite: `welcomeEmail`, `confirmSignupEmail`, `resetPasswordEmail`, `magicLinkEmail`; shared shell/button helpers; `escHtml()` sanitiser
- `lib/auth/actions.ts` — `signUp` sends welcome email on both confirmation paths; `Promise.race` 3s timeout
- `supabase/email-templates/confirm-signup.html` — Supabase dashboard template
- `supabase/email-templates/reset-password.html` — Supabase dashboard template
- `supabase/email-templates/magic-link.html` — Supabase dashboard template
- `supabase/email-templates/README.md` — Resend SMTP + template setup guide

**Manual steps required:**
1. Supabase → Project Settings → Auth → SMTP → enable Resend SMTP
2. Supabase → Authentication → Email Templates → paste 3 HTML files

---

#### ✅ Payment Integrations — Stripe, Paystack, Remita (Migration 048)
**Commit:** `6f778e0` · **Date:** 2026-07-08

Added Stripe (global), Paystack (Nigeria), and Remita (Nigeria enterprise) payment providers. Migration 048 added `stripe_subscription_id`, `paystack_subscription_code`, `paystack_customer_code`, `remita_rrr`, and `payment_provider` columns to the `subscriptions` table.

**Files changed:**
- `supabase/migrations/048_payment_providers.sql` — provider columns on subscriptions
- `lib/payments/subscriptions.ts` — `upsertSubscription()` with idempotency guard
- `lib/payments/stripe.ts`, `lib/payments/paystack.ts`, `lib/payments/remita.ts` — provider clients
- `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/paystack/route.ts` — webhook handlers

**Stripe SDK note:** Uses Stripe SDK v22. `apiVersion` must be `"2026-06-24.dahlia"` — `Invoice.subscription` was removed in this version; use `Invoice.parent.subscription_details.subscription` instead.

**Fixes applied post-merge:**
- `44d12dc` — Invoice.subscription removal for Stripe dahlia API
- `f97c23e` — Stripe period fields (dahlia API) + NGN-first pricing page
- `bd1bc5f` — Move PLAN_ROWS out of page.tsx to fix Next.js invalid export error

---

### Content — Football Fundamentals

#### ✅ HTML Seed Rewrite — Lesson Format Baseline (Migration 040)
**Commit:** `2efcb6d` · **Date:** 2026-07-08

Rewrote initial lesson seed content to HTML format, establishing the structural template (h2/p/ul/li/table/strong) all later migrations follow.

**Migration file:** `supabase/migrations/040_rewrite_seed_lessons_html.sql`

---

#### ✅ Football Fundamentals Key Takeaways (Migration 041)
**Commit:** `2efcb6d` · **Date:** 2026-07-08

Added Key Takeaway sections to all 23 Football Fundamentals lessons from migration 025. Content upgraded with real data references (PSxG, PPDA, home win rates, goal-by-minute distributions, revenue figures).

**Lessons covered:**
- Positions & Roles: goalkeeper, centre-backs, full-backs/wing-backs, central midfield, attackers (5 lessons)
- Understanding Formations: 4-4-2, 4-2-3-1, back-three systems (3 lessons — plus 4-3-3 already done in 040)
- Pressing Systems: what pressing means, high press, gegenpressing, mid/low block (4 lessons)
- How Leagues Work: points system, promotion/relegation, European qualification (3 lessons)
- Cup & Knockout Formats: single-leg, two-leg ties, Champions League format (3 lessons)
- Home Advantage: crowd effect, travel fatigue, squad rotation (3 lessons)
- Squad Rotation: why managers rotate, reading the lineup, second-half fatigue (2 lessons)

**Migration file:** `supabase/migrations/041_football_fundamentals_key_takeaways.sql`

---

#### ✅ Basketball & Tennis Key Takeaways (Migration 042)
**Commit:** `331d488` · **Date:** 2026-07-08

Added Key Takeaway sections to all 19 Basketball & Tennis lessons from migration 026.

**Lessons covered:**
- Basketball: guard positions, forward positions, center, positionless basketball, motion offense, isolation/post-up, transition offense, zone defense, switching defense, help defense, assists/turnovers, steals/blocks, PER metric, on/off splits (14 lessons)
- Tennis: scoring system, surface differences, serve/return dynamics, grand slam formats, rankings system (5 lessons)

**Migration file:** `supabase/migrations/042_basketball_tennis_key_takeaways.sql`

---

### Content — Betting Academy

#### ✅ Odds & Markets Key Takeaways (Migration 043)
**Commit:** `331d488` · **Date:** 2026-07-08

Added Key Takeaway sections to 17 Odds & Markets lessons from migration 016 (in Markdown format, matching the existing content format of those lessons at the time).

**Migration file:** `supabase/migrations/043_odds_markets_key_takeaways.sql`

**Note:** Migration 044 later replaced all Odds & Markets content with HTML, superseding these Markdown Key Takeaways.

---

#### ✅ Betting Academy — Full Markdown-to-HTML Rewrite (Migrations 044–047)
**Commit:** `335d361` (original) · `0618541` (refactored into 4 files) · **Date:** 2026-07-08

Rewrote all 232 Betting Academy lessons from migrations 016–023 from Markdown format to full HTML, matching the quality and structure of Football Fundamentals HTML lessons. Each lesson now has rich HTML structure, expanded content with real data references from the PunterStat FDCO historical dataset, and a `<h2>Key Takeaway</h2>` closing section.

Originally shipped as a single migration 044, then refactored into four files for maintainability:

| Migration | Course | Lessons |
|-----------|--------|---------|
| `044_odds_markets_markdown_to_html.sql` | Odds & Markets | 57 |
| `045_probability_value_markdown_to_html.sql` | Probability & Value | 56 |
| `046_bet_types_markdown_to_html.sql` | Bet Types | 60 |
| `047_bankroll_management_markdown_to_html.sql` | Bankroll Management | 59 |

---

### Product Features

#### ✅ Stage 1 — Analytics Event Tracking (Migration 049)
**Commit:** `24b757f` · **Date:** 2026-07-08

Lightweight product analytics event table and helper, wired to all key user actions.

**Migration file:** `supabase/migrations/049_analytics_events.sql`

**`AnalyticsEvent` enum values:** `lesson_completed`, `simulator_run`, `match_analysis_saved`, `value_comparison_viewed`

**Instrumented call sites:**
- `lib/betting-academy/actions.ts` → `lesson_completed`
- `lib/sports-university/actions.ts` → `lesson_completed`
- `lib/simulation/actions.ts` → `simulator_run`
- `lib/match-breakdown/actions.ts` → `match_analysis_saved`
- `app/api/spot-the-value/route.ts` → `value_comparison_viewed`

---

#### ✅ Stage 2 — Calibration Dashboard (Brier Score Trend + Reliability Curve)
**Commit:** `9268739` · **Date:** 2026-07-08

New `/dashboard/calibration` page. Includes stat cards (resolved count, accuracy, Brier score), reliability curve (5 confidence buckets, predicted avg vs actual frequency), Brier score trend (earlier vs recent half comparison, improving/declining/flat copy block, rolling bar chart), and tracked predictions table with resolve button.

**Files changed:**
- `app/dashboard/calibration/page.tsx`
- `lib/calibration/scorer.ts`

---

#### ✅ Stage 3 — Admin Data Health Panel (Migration 050)
**Commit:** `d92b678` · **Date:** 2026-07-08

New `/admin/data-health` page. Shows last R2 sync run, cache freshness (odds + fixtures), API quota per provider (colour-coded), overdue prediction resolution count, and recent sync run history.

**Migration file:** `supabase/migrations/050_api_quota_remaining.sql` — persists Odds API `x-requests-remaining` headers per provider window.

**Files changed:**
- `app/admin/data-health/page.tsx`
- `lib/admin/queries.ts`

---

#### ✅ Stage 4 — Learning Path Recommendations
**Commit:** _(pending push)_ · **Date:** 2026-07-09

Rule-based "Next up" recommendation card on the user dashboard. Pulls from analytics events, calibration scores, and lesson progress. Returns a single prioritised recommendation using five rules applied in order.

**Rules (priority order):**
1. Brier score > 0.65, ≥ 5 resolved predictions, < 10 lessons completed → recommend Betting Academy probability content
2. Zero simulator runs, ≥ 5 lessons completed → recommend Simulation Engine
3. Zero match analyses saved, ≥ 3 lessons completed → recommend Match Breakdown
4. Never visited Spot The Value, ≥ 8 lessons completed → recommend it
5. Fallback → resume most recently active in-progress lesson (builds correct URL for both Betting Academy and Sports University paths)

**Files added:**
- `lib/dashboard/recommendations.ts` — `getRecommendation(userId)` pure async function
- `components/dashboard/recommendation-card.tsx` — "Next up" card with icon, title, description, reason, and CTA link

**Files changed:**
- `app/dashboard/page.tsx` — `getRecommendation` added to `Promise.all`, `RecommendationCard` rendered after stat cards

---

#### ✅ Stage 5 — Interactive Lesson Data Blocks (Infrastructure)
**Commit:** _(pending push)_ · **Date:** 2026-07-09

Infrastructure for embedding live-computed stats from the historical dataset inside lesson HTML. No lessons have been annotated with data-block markers yet — this is the framework; adding markers to specific lessons is a separate step.

**Convention (HTML placeholder in lesson content):**
```html
<div data-block="stat" data-factor="home_win_rate" data-league="E0" data-seasons="5"></div>
```

**Supported factors:** `home_win_rate` | `avg_goals` | `btts_rate` | `over25_rate`

**How it works:**
- `LessonContent` (server component) parses lesson HTML for `data-block` markers using regex
- For lessons with no markers (all current lessons), rendering is identical to the previous `dangerouslySetInnerHTML` approach — zero DB queries, zero overhead
- When a marker is found, `getBlockStat()` queries `historical_matches` server-side and renders an inline teal stat card
- `home_win_rate` and `btts_rate` use efficient COUNT-only Supabase queries (no row transfer); `avg_goals` and `over25_rate` fetch goal columns only with a 200,000-row limit

**Files added:**
- `lib/lessons/data-blocks.ts` — `getBlockStat({ factor, league, seasons? })` with league display name mapping
- `components/lessons/lesson-content.tsx` — server component; `variant` prop preserves Betting Academy (emerald) vs Sports University (indigo) link colours
- `app/api/lesson-blocks/[factor]/route.ts` — public GET route for client-side access; 1-hour cache header

**Files changed:**
- `app/(main)/betting-academy/[topic]/[module]/[lesson]/page.tsx` — removed 46 lines of inline `decodeHtmlEntities` + `LessonContent`; imports shared component with `variant="betting-academy"`
- `app/(main)/sports-university/[category]/[course]/[lesson]/page.tsx` — same with `variant="sports-university"`

---

## Remaining Work

The following stages are scoped and sequenced. Stages with no dependencies can be started immediately in parallel.

---

### ✅ Stage 1 — Annotate Pilot Lesson with a Data Block
**Commit:** _(pending)_ · **Migration:** 051 · **Date:** 2026-07-09

Inserted a live `home_win_rate` data block into the "Crowd Effect & Home Advantage" lesson (`crowd-effect-home-advantage`, course: `home-advantage-unpacked`), immediately before the Key Takeaway section — right where the lesson narrative references top-five European league home win rates. This is the first live data-block annotation in the codebase, proving the end-to-end `LessonContent` server-component pipeline.

**Migration file:** `supabase/migrations/051_home_advantage_data_block_pilot.sql`

---

### 📋 Stage 2 — Psychology Key Takeaways (Migration 052)
**Effort:** Medium · **Migration:** 052 · **Depends on:** Nothing

Migrations 033 and 034 seeded 56 Betting Psychology lessons without Key Takeaway sections. The migration number slot (048) that would have carried this content was consumed by payment infrastructure.

**Scope:** 56 lessons across Cognitive Biases in Betting, Emotional Control Under Pressure, Decision-Making Frameworks, Mental Models for Betting Uncertainty, Professional Bettor Mindset, Discipline and Record-Keeping.

**What to build:** `supabase/migrations/052_betting_psychology_key_takeaways.sql`

---

### 📋 Stage 3 — Statistical Thinking Key Takeaways (Migration 053)
**Effort:** Medium · **Migration:** 053 · **Depends on:** Nothing

Migrations 035 and 036 seeded 56 Statistical Thinking lessons without Key Takeaway sections.

**Scope:** 56 lessons across Sample Size & Variance, Regression to the Mean, Probability Distributions in Sport, Building Predictive Models, Model Evaluation & Calibration, Advanced Quantitative Methods.

**What to build:** `supabase/migrations/053_statistical_thinking_key_takeaways.sql`

---

### 📋 Stage 4 — New Course: xG & Football Data Analytics (Migration 054)
**Effort:** Large · **Migration:** 054 · **Depends on:** Nothing (Stage 5 infrastructure ready for data blocks)

New course under Sports University / Football Fundamentals. 3 modules, ~15 lessons.

**Modules:**
- Module 1 — What xG Measures (~5 lessons)
- Module 2 — Reading Football Data (~5 lessons)
- Module 3 — Using the PunterStat Dataset (~5 lessons)

**What to build:** `supabase/migrations/054_xg_football_analytics_course.sql`

---

### 📋 Stage 5 — New Course: Value Betting in Practice (Migration 055)
**Effort:** Medium · **Migration:** 055 · **Depends on:** Nothing

New course under Betting Academy. 2 modules, ~12 lessons.

**Modules:**
- Module 1 — The Value Betting Workflow (~6 lessons)
- Module 2 — The Mathematics of Edge (~6 lessons)

**What to build:** `supabase/migrations/055_value_betting_practice_course.sql`

---

### 📋 Stage 6 — New Course: Reading Football Match Data (Migration 056)
**Effort:** Medium · **Migration:** 056 · **Depends on:** Nothing

New course under Sports University / Football Fundamentals. 3 modules, ~12 lessons.

**Modules:**
- Module 1 — Match Stats Basics (~4 lessons)
- Module 2 — Advanced Metrics (~4 lessons)
- Module 3 — Worked Examples (~4 lessons)

**What to build:** `supabase/migrations/056_reading_match_data_course.sql`

---

### 📋 Stage 7 — Lesson Content Format Normalisation (Migration 057)
**Effort:** Small · **Migration:** 057 · **Depends on:** Nothing (clears the way for data-block adoption in older lessons)

Migrations 016–024 seeded lessons in Markdown. Migrations 025+ use HTML. The `LessonContent` server component handles both correctly, but normalising format enables data-block markers to be embedded in the older lessons.

**What to build:** `supabase/migrations/057_normalise_lesson_format.sql`

---

### 📋 Stage 8 — Supabase Auth Hook (Custom Email via Resend)
**Effort:** Small · **Migration:** None · **Depends on:** Supabase Pro plan

Currently auth emails route through Supabase's SMTP relay. A Supabase Auth HTTP Hook gives full template control without dashboard dependency.

**Constraint:** Requires Supabase Pro or Team plan. Do not implement until upgraded.

**What to build:**
- `app/api/webhooks/supabase/send-email/route.ts` — receives `send_email` hook payload, selects template from `lib/email/templates.ts`, sends via Resend
- Add `SUPABASE_HOOK_SECRET` env var for HMAC signature verification
- Remove Supabase dashboard SMTP config once confirmed working

---

## Recommended Execution Order

```
No dependencies (can start immediately):
  Stage 1  — Pilot data-block annotation (tiny — one SQL UPDATE)
  Stage 7  — Lesson format normalisation (SQL only)

Content migrations (parallel — no code dependencies):
  Stage 2  — Psychology Key Takeaways
  Stage 3  — Statistical Thinking Key Takeaways

New courses (parallel — no code dependencies):
  Stage 4  — xG & Football Data Analytics
  Stage 5  — Value Betting in Practice
  Stage 6  — Reading Football Match Data

When on Supabase Pro:
  Stage 8  — Auth Hook
```

---

*Last updated: 2026-07-09 — Stages 4 and 5 of the feature plan complete (Learning Path Recommendations + Interactive Lesson Data Blocks infrastructure)*
