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

### Content — Football Fundamentals

#### ✅ Stage 1: Football Fundamentals — All Positions & Roles, Formations, Tactical Systems, Competitions, Home Advantage (Migration 041)
**Commit:** _(pending push)_ · **Date:** 2026-07-08

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

## Content Expansion — Planned Stages

### 📋 Stage 2: Basketball & Tennis Key Takeaways (Migration 042)
**Target file:** `supabase/migrations/042_basketball_tennis_key_takeaways.sql`
**Scope:** 19 lessons from migration 026
- Basketball: guard positions, forward positions, center, positionless basketball, motion offense, isolation/post-up, transition offense, zone defense, switching defense, help defense, assists/turnovers, steals/blocks, PER metric, on/off splits
- Tennis: return of serve, patterns of play, net play/serve-volley, momentum/pressure points, clutch performance

---

### 📋 Stage 3: Betting Academy — Understanding Odds Formats (Migration 043)
**Target file:** `supabase/migrations/043_odds_formats_key_takeaways.sql`
**Scope:** 16 lessons from migration 016 — markdown → HTML upgrade + Key Takeaway
- converting-between-odds-formats
- reading-odds-boards-quickly
- odds-across-different-sports
- spread-and-totals-odds
- exchange-odds-vs-bookmaker-odds
- pricing-discrepancies-across-bookmakers
- how-bookmakers-set-odds
- what-is-the-overround (overlaps 040 — check for duplicate)
- calculating-the-margin-step-by-step
- why-margins-vary-by-market
- true-odds-vs-offered-price
- comparing-margins-across-bookmakers
- margin-and-long-run-roi
- de-vigging-fair-odds
- sharp-vs-soft-margin-profiles
- margin-aware-market-selection

---

### 📋 Stage 4: Betting Academy — Odds & Markets New Modules (Migration 044)
**Target file:** `supabase/migrations/044_odds_markets_new_modules_key_takeaways.sql`
**Scope:** 40 lessons from migration 017 — markdown → HTML upgrade + Key Takeaway
- Line shopping module (8 lessons)
- Live & in-play module (8 lessons)
- Exchange betting module (8 lessons)
- Building your own lines module (8 lessons)
- Advanced market reading module (8 lessons)

---

### 📋 Stage 5: Betting Academy — Probability & Value Expansion (Migration 045)
**Target file:** `supabase/migrations/045_probability_value_key_takeaways.sql`
**Scope:** 18 + 40 = 58 lessons from migrations 018 + 019 — markdown → HTML + Key Takeaway
- Implied probability: full module expansion
- Finding value bets: all modules
- Value bet identification frameworks
- Model-based probability vs market probability

---

### 📋 Stage 6: Betting Academy — Bet Types (Migration 046)
**Target file:** `supabase/migrations/046_bet_types_key_takeaways.sql`
**Scope:** 20 + 40 = 60 lessons from migrations 020 + 021
- Singles, doubles, accumulators
- Handicap & Asian handicap
- Spread & totals
- Each-way betting (if applicable)
- System bets

---

### 📋 Stage 7: Betting Academy — Bankroll Management (Migration 047)
**Target file:** `supabase/migrations/047_bankroll_key_takeaways.sql`
**Scope:** 19 + 40 = 59 lessons from migrations 022 + 023
- Flat staking, proportional staking
- Kelly Criterion and fractional Kelly
- Risk-of-ruin calculations
- Record keeping and performance review

---

### 📋 Stage 8: Betting Academy — Psychology (Migration 048)
**Target file:** `supabase/migrations/048_psychology_key_takeaways.sql`
**Scope:** 16 + 40 = 56 lessons from migrations 033 + 034
- Cognitive biases: confirmation bias, loss aversion
- Tilt, chasing, when to stop
- Record keeping mindset
- Long-run thinking

---

### 📋 Stage 9: Betting Academy — Statistical Thinking (Migration 049)
**Target file:** `supabase/migrations/049_statistical_thinking_key_takeaways.sql`
**Scope:** 16 + 40 = 56 lessons from migrations 035 + 036
- Sample size and variance
- Regression to the mean (entire module)
- Distribution theory
- Model building pipeline
- Model evaluation

---

## New Content — Planned

### 📋 Stage 10: New Course — xG & Football Data Analytics (Migration 050)
**Category:** Football Fundamentals (new course)
**Target:** 1 new course, 3 modules, ~15 lessons
- What xG measures and what it misses
- xG by league, team, and player
- Using xGA to evaluate defensive systems
- PSxG and goalkeeper evaluation
- xA (expected assists) and chance creation
- Data sources: Opta, StatsBomb, Understat
- Building a simple xG-based match predictor
- Using the PunterStat historical dataset

---

### 📋 Stage 11: New Course — Value Betting in Practice (Migration 051)
**Category:** Betting Academy
**Target:** 1 new course, 2 modules, ~12 lessons
- From probability to price: the full workflow
- Identifying soft lines before they sharpen
- Closing Line Value as your KPI
- Building a basic value-bet tracker
- The mathematics of edge over 500 bets

---

### 📋 Stage 12: New Course — Reading Football Match Data (Migration 052)
**Category:** Football Fundamentals (new course)
**Target:** 1 new course, 3 modules, ~12 lessons
- How to read a basic match stats sheet
- Shots, SoT, and what they tell you
- Possession and its limits as a metric
- PPDA, high turnovers, and pressing efficiency
- Using the PunterStat dataset for match analysis
- A complete worked example: one match, full breakdown

---

## Technical Debt & Infrastructure

### 💡 Supabase Auth Hook — Full Custom Email via Resend
Instead of configuring SMTP in the Supabase dashboard, implement a `send_email` HTTP Auth Hook endpoint (`app/api/webhooks/supabase/send-email/route.ts`) that Supabase calls for every auth email. This would route all auth emails through Resend's API with full custom templates, without any dashboard configuration. Requires Supabase Pro (or Team) plan.

### 💡 Lesson Content Format Normalisation
Migrations 016–024 used Markdown-format content; 025+ switched to HTML. The lesson viewer component handles both, but a normalisation migration that converts all markdown-format lessons to HTML would simplify the rendering layer and allow consistent styling.

### 💡 Dataset Integration in Lessons
Several planned lesson expansions reference PunterStat's Cloudflare R2 historical dataset (top-5 European leagues, 2001/02 onward). Explore embedding live computed stats (e.g., "average goals per game in 2023/24 Premier League") as server-fetched values in lesson metadata or as interactive components.

---

*Last updated: 2026-07-08 — Stage 1 push*
