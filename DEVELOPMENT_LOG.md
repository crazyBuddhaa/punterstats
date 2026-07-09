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

**Courses rewritten (232 lessons total):**

*Odds & Markets (57 lessons):*
- Understanding Odds Formats, How Bookmaker Margins Work, Odds Comparison & Line Shopping, Live & In-Play Odds, Exchange Betting & Lay Markets, Building Your Own Lines

*Probability & Value (56 lessons):*
- Implied Probability Explained, Finding Value Bets, Expected Value in Practice, Mathematics of Variance, Market Inefficiencies Deep Dive, Building a Predictive Edge

*Bet Types (60 lessons):*
- Singles/Doubles/Accumulators, Handicap & Asian Handicap, Over/Under Totals, Outright & Futures, Live In-Play Bet Types, Player Props & Specials

*Bankroll Management (59 lessons):*
- Bankroll Fundamentals, Staking Strategies, Risk Management & Ruin Theory, Psychology of Stake Sizing, Portfolio & Bankroll Allocation, Professional Bankroll Operations

---

### Product Features

#### ✅ Stage 1 — Analytics Event Tracking (Migration 049)
**Commit:** `24b757f` · **Date:** 2026-07-08

Lightweight product analytics event table and helper, wired to all key user actions.

**Migration file:** `supabase/migrations/049_analytics_events.sql` — `analytics_events` table with `user_id`, `event_type` enum, `metadata` JSONB, RLS (users see own rows, service role writes).

**`AnalyticsEvent` enum values:** `lesson_completed`, `simulator_run`, `match_analysis_saved`, `value_comparison_viewed`

**Instrumented call sites:**
- `lib/betting-academy/actions.ts` → `lesson_completed`
- `lib/sports-university/actions.ts` → `lesson_completed`
- `lib/simulation/actions.ts` → `simulator_run`
- `lib/match-breakdown/actions.ts` → `match_analysis_saved`
- `app/api/spot-the-value/route.ts` → `value_comparison_viewed` (anon-safe: passes `null` userId)

**Files changed:**
- `supabase/migrations/049_analytics_events.sql`
- `lib/analytics/tracker.ts` — `trackEvent(userId, event, metadata?)`, swallows errors to prevent blocking user actions

---

#### ✅ Stage 2 — Calibration Dashboard (Brier Score Trend)
**Commit:** `9268739` · **Date:** 2026-07-08

New `/dashboard/calibration` page giving users feedback on whether their betting judgement is improving over time.

**What it shows:**
- Stat cards: resolved prediction count, accuracy (% where top-probability outcome matched result), overall Brier score
- Brier score trend: earlier-half vs recent-half comparison, `improving` / `declining` / `flat` copy block with directional icon
- Visual trend chart: CSS bar chart of rolling Brier score across 5-prediction groups
- Tracked predictions table: all predictions with home/draw/away probabilities, match date, resolve button for pending entries

**Files changed:**
- `app/dashboard/calibration/page.tsx` — full server-rendered page
- `lib/calibration/scorer.ts` — `scoreCalibration()` (multi-class Brier score, accuracy, calibration curve), `scoreCalibrationTrend()` (improving/flat/declining from half-split comparison)

**Known gap:** `scoreCalibration()` returns a `calibrationCurve[]` array (5 confidence buckets, predicted avg vs actual frequency) but this is not yet rendered on the page. Planned in Stage 1 of the remaining work.

---

#### ✅ Stage 3 — Admin Data Health Panel (Migration 050)
**Commit:** `d92b678` · **Date:** 2026-07-08

New `/admin/data-health` page for operational visibility into sync jobs, API quotas, and data freshness.

**What it shows:**
- Last R2 sync run: trigger, start time, leagues synced, matches/odds upserted, error count, OK/warn status pill
- Cache freshness: odds cache and fixtures cache age vs 6-hour stale threshold, colour-coded pills
- API quota per provider: request count and remaining calls (green > 150, amber 50–150, red < 50)
- Overdue prediction resolutions: warns if > 20 predictions are pending resolve
- Recent sync run history table with per-run error counts

**Migration file:** `supabase/migrations/050_api_quota_remaining.sql` — `api_quota_remaining` table persisting The Odds API `x-requests-remaining` / `x-requests-used` response headers per provider window.

**Files changed:**
- `app/admin/data-health/page.tsx` — full server-rendered page
- `lib/admin/queries.ts` — `getDataHealthSummary()` returning `AdminStats` (sync runs, quota, cache freshness, overdue predictions)

---

## Remaining Work

The following stages are scoped and sequenced. Stages with no dependencies can be started immediately in parallel.

---

### 📋 Stage 1 — Calibration Curve Visualisation
**Effort:** Small · **Migration:** None · **Depends on:** Nothing

`scoreCalibration()` already returns a `calibrationCurve[]` array of 5 confidence buckets (0–20 %, 20–40 %, 40–60 %, 60–80 %, 80–100 %), each with `predictedAvg` and `actualFrequency`. This data is fetched on the calibration page but never rendered.

**What to build:**
- Reliability diagram section on `/dashboard/calibration` — five buckets, predicted avg vs actual outcome frequency
- Reference line or explanatory note about what the diagonal means (well-calibrated = tracks the diagonal)
- Only render when `summary.sampleSize >= 10`
- Use the CSS bar chart pattern already on the page, or a small Recharts `BarChart`

**File to touch:** `app/dashboard/calibration/page.tsx`

---

### 📋 Stage 2 — Psychology Key Takeaways (Migration 051)
**Effort:** Medium · **Migration:** 051 · **Depends on:** Nothing

Migrations 033 and 034 seeded 56 Betting Psychology lessons without Key Takeaway sections. The migration number slot (048) that would have carried this content was consumed by payment infrastructure.

**Scope:** 56 lessons across Cognitive Biases in Betting, Emotional Control & Tilt, Record Keeping Mindset, Long-Run Thinking

**What to build:** `supabase/migrations/051_betting_psychology_key_takeaways.sql` — UPDATE statements appending `<h2>Key Takeaway</h2>` HTML closing blocks, matching the quality of migrations 041–047.

---

### 📋 Stage 3 — Statistical Thinking Key Takeaways (Migration 052)
**Effort:** Medium · **Migration:** 052 · **Depends on:** Nothing

Migrations 035 and 036 seeded 56 Statistical Thinking lessons without Key Takeaway sections, same pattern as Stage 2.

**Scope:** 56 lessons across Sample Size & Variance, Regression to the Mean, Distribution Theory, Model Building Pipeline, Model Evaluation.

**What to build:** `supabase/migrations/052_statistical_thinking_key_takeaways.sql`

---

### 📋 Stage 4 — Learning Path Recommendations
**Effort:** Medium · **Migration:** None · **Depends on:** Stages 1–3 of the suggested features (all done)

Rule-based "Next up" card on the user dashboard. All signal data is available — analytics events (049), calibration scores, progress records, bookmarks.

**Rules:**
- Brier score > 0.75 + < 50 % Betting Academy complete → recommend highest-level uncompleted relevant lesson
- `simulator_run` count = 0, bankroll/staking lesson completed → recommend Bet Simulator
- `match_analysis_saved` count = 0, past lesson 5 in any course → recommend Match Breakdown
- `value_comparison_viewed` count = 0, odds/markets lesson completed → recommend Spot The Value
- Default fallback: next uncompleted lesson in most recently active course

**What to build:**
- `lib/dashboard/recommendations.ts` — `getRecommendation(userId)` querying progress + events + calibration, returning `{ type, title, href, reason } | null`
- `components/dashboard/recommendation-card.tsx` — "Next up" card with CTA link
- Wire into `app/dashboard/page.tsx` — server-side fetch, rendered at top of dashboard

---

### 📋 Stage 5 — Interactive Lesson Data Blocks
**Effort:** Large · **Migration:** None · **Depends on:** Nothing (but enables Stages 6–8)

Embed live-computed stats from the R2/Supabase historical dataset inside lesson HTML. A content convention replaces static text like "home teams win roughly 45 % of matches" with a block that fetches and renders the actual figure.

**Convention (HTML placeholder, consistent with existing lesson format):**
```html
<div data-block="stat" data-factor="home_win_rate" data-league="E0" data-seasons="5"></div>
```

**What to build:**

*Part A — API route:*
- `app/api/lesson-blocks/[factor]/route.ts` — accepts `league` and `seasons` params, queries `historical_matches`, returns pre-aggregated stats
- Initial factors: `home_win_rate`, `avg_goals`, `btts_rate`, `over25_rate`

*Part B — Renderer:*
- `components/lessons/lesson-content.tsx` — parses lesson HTML, finds `data-block` elements, fetches stats client-side (SWR), replaces placeholders with formatted values and inline mini-charts
- Replace raw `dangerouslySetInnerHTML` in both Sports University and Betting Academy lesson pages with this component

*Part C — Pilot:*
- Add one `data-block` element to the Football Fundamentals home advantage lesson as proof-of-concept

---

### 📋 Stage 6 — New Course: xG & Football Data Analytics (Migration 053)
**Effort:** Large · **Migration:** 053 · **Depends on:** Stage 5 (optional, for data block embedding)

New course under Sports University / Football Fundamentals. 3 modules, ~15 lessons.

**Modules:**
- Module 1 — What xG Measures (~5 lessons): xG definition and limitations, xG vs actual goals (over/underperformance), xGA and defensive evaluation, PSxG and goalkeeper evaluation, xA and chance creation
- Module 2 — Reading Football Data (~5 lessons): data sources (Opta, StatsBomb, Understat), possession limits, shots vs shots on target, PPDA and pressing efficiency, worked match example
- Module 3 — Using the PunterStat Dataset (~5 lessons): what the historical dataset contains, filtering by league/season, building an xG-based match predictor, using xG for over/under markets, historical odds vs xG-implied probability

**What to build:** `supabase/migrations/053_xg_football_analytics_course.sql` — course, module, and lesson records with full HTML content + Key Takeaway per lesson.

---

### 📋 Stage 7 — New Course: Value Betting in Practice (Migration 054)
**Effort:** Medium · **Migration:** 054 · **Depends on:** Nothing

New course under Betting Academy. 2 modules, ~12 lessons.

**Modules:**
- Module 1 — The Value Betting Workflow (~6 lessons): probability-to-price workflow, identifying soft lines, closing line value (CLV), using CLV as performance KPI, when the market is wrong vs when you are wrong, building a value-bet tracker
- Module 2 — The Mathematics of Edge (~6 lessons): what edge means mathematically, compounding a small edge over 500 bets, variance obscuring edge short-term, edge vs Kelly stake relationship, when to increase/cut stake, long-run simulation of a known edge (links to Simulation Engine)

**What to build:** `supabase/migrations/054_value_betting_practice_course.sql`

---

### 📋 Stage 8 — New Course: Reading Football Match Data (Migration 055)
**Effort:** Medium · **Migration:** 055 · **Depends on:** Nothing

New course under Sports University / Football Fundamentals. 3 modules, ~12 lessons.

**Modules:**
- Module 1 — Match Stats Basics (~4 lessons): reading a match stats sheet, shots and shots on target, possession limits, corners/fouls/cards as secondary indicators
- Module 2 — Advanced Metrics (~4 lessons): PPDA and pressing efficiency, high turnovers and counter-press success, ELO ratings, combining metrics into a match picture
- Module 3 — Worked Examples (~4 lessons): one full match from raw data, using the PunterStat historical dataset, comparing pre-match expected line vs actual outcome, building a pre-match checklist

**What to build:** `supabase/migrations/055_reading_match_data_course.sql`

---

### 📋 Stage 9 — Lesson Content Format Normalisation (Migration 056)
**Effort:** Small · **Migration:** 056 · **Depends on:** Nothing (clears the way for Stage 5 renderer)

Migrations 016–024 seeded lessons in Markdown. Migrations 025+ use HTML. The lesson viewer handles both, but mixed format complicates styling and blocks the Stage 5 data-block renderer (which operates on HTML only).

Check each affected lesson slug against DB content before writing — migrations 044–047 already rewrote most Betting Academy lessons; this migration targets anything remaining.

**What to build:** `supabase/migrations/056_normalise_lesson_format.sql` — UPDATE statements converting remaining Markdown lessons to HTML.

**After this migration:** the lesson renderer can safely assume all content is HTML.

---

### 📋 Stage 10 — Supabase Auth Hook (Custom Email via Resend)
**Effort:** Small · **Migration:** None · **Depends on:** Supabase Pro plan

Currently auth emails route through Supabase's SMTP relay (configured in the dashboard). A Supabase Auth HTTP Hook would give full control over templates and delivery without dashboard dependency.

**Constraint:** Requires Supabase Pro or Team plan. Do not implement until upgraded.

**What to build:**
- `app/api/webhooks/supabase/send-email/route.ts` — receives the Supabase `send_email` hook payload (`{ user, email_data: { token, token_hash, redirect_to, email_action_type } }`), selects the right template from `lib/email/templates.ts`, sends via Resend
- Configure the HTTP hook in Supabase Dashboard → Authentication → Hooks → Send Email
- Add `SUPABASE_HOOK_SECRET` env var for HMAC signature verification
- Remove the Supabase dashboard SMTP config once the hook is confirmed working

---

## Recommended Execution Order

```
Immediately (no dependencies, quick wins):
  Stage 1  — Calibration curve visual         (frontend only, data already computed)
  Stage 9  — Lesson format normalisation      (SQL migration, clears way for Stage 5)

In parallel (both are SQL content migrations, no code dependencies):
  Stage 2  — Psychology Key Takeaways
  Stage 3  — Statistical Thinking Key Takeaways

After analytics + calibration confirmed working:
  Stage 4  — Learning Path Recommendations

After Stage 9 (format normalised):
  Stage 5  — Interactive Lesson Data Blocks

After Stage 5 piloted:
  Stage 6  — xG & Football Data Analytics course   (can use data blocks)
  Stage 7  — Value Betting in Practice course
  Stage 8  — Reading Football Match Data course

When on Supabase Pro:
  Stage 10 — Auth Hook
```

---

*Last updated: 2026-07-09 — Audited stages 1–3 of suggested features as complete; compiled 10-stage remaining work plan*
