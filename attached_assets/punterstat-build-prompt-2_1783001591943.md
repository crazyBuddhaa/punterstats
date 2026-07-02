Build Prompt — PunterStat (Production MVP)

You are a senior full-stack engineer, product architect, startup CTO, and UI/UX designer.

Your task is to build a production-ready web platform called PunterStat.

PunterStat is NOT a betting website.

It is a sports intelligence and sports education platform.

The platform teaches users how sports systems work, how probability works, how betting mathematics works, and how analytical thinking helps decision making.

Core philosophy:

Knowledge Before Decision

The platform must NEVER process real-money betting.

No deposits.

No withdrawals.

No gambling wallet.

No bookmaker integration.

No betting transactions.

This platform teaches people to understand sports and probability.

Think:

- Investopedia for sports intelligence
- Coursera for sports education
- Duolingo for betting literacy

DO NOT build anything similar to betting companies.

Avoid all gambling design patterns.

Avoid casino UI.

Avoid bookmaker-style interfaces.

---

Deployment Requirements

The project MUST be deployable directly via:

- Vercel deployment
- GitHub repository

The code must NOT depend on Replit infrastructure.

Do NOT use:

- Replit database
- Replit auth
- Replit hosting
- Replit secrets manager
- Replit deployment services

Replit is ONLY being used to generate/write code.

All infrastructure must be external.

---

Build Process — Staged Development

Do NOT build the entire platform in a single pass.

Build in discrete, sequential stages. Each stage must:

- Produce working, buildable code — no broken intermediate states
- Be fully functional on its own before moving to the next stage
- End with a git commit and push to the GitHub repository
- Use a clear, conventional commit message describing what was completed

Do not skip ahead or combine stages unless explicitly instructed. Pause for review at the end of each stage before continuing.

Every change — development work, corrections, bug fixes, and anything added or removed — must also be logged in DEVLOG.md, attributed to the Replit agent account username that made it, before the stage is committed and pushed. See DEVLOG.md for the required format.

Stage 1 — Project Foundation

- Initialize Next.js 15 project (App Router, TypeScript, Tailwind)
- Install and configure shadcn/ui, Framer Motion, Zustand, Zod, React Hook Form
- Set up folder structure and environment variable scaffolding
- Confirm the project builds and deploys cleanly to Vercel (placeholder page only)
- Commit: "chore: project foundation and Vercel deployment scaffold"

Stage 2 — Core Layout & Design System

- Build shared layout components: navbar, footer, page shell
- Implement color palette, typography, and spacing system
- Build reusable UI primitives (buttons, cards, inputs) via shadcn/ui
- Commit: "feat: core layout and design system"

Stage 3 — Database & Auth Infrastructure

- Connect Supabase project
- Create full database schema (all tables)
- Configure Supabase Auth (email login, signup, password reset)
- Implement role-based access control (User, Premium User, Admin)
- Commit: "feat: database schema and authentication infrastructure"

Stage 4 — Sports University Module

- Course categories, lesson pages, video lesson support
- Lesson progress tracking, completion tracking, bookmarking
- Commit: "feat: Sports University module"

Stage 5 — Betting Literacy Academy Module

- Structured lessons on odds, probability, EV, bankroll/risk management, betting psychology
- Interactive examples, progress tracking
- Commit: "feat: Betting Literacy Academy module"

Stage 6 — Simulation Engine Module

- Bet Simulator (virtual balance, odds/stake selection, profit/loss tracking)
- Probability Simulator (odds/win%/number of bets, long-term outcome charts via Recharts)
- Commit: "feat: Simulation Engine module"

Stage 7 — Match Breakdown Engine Module

- Team form, historical data, tactical matchup, goal trends, home advantage, momentum, injury impact
- Educational framing only, no betting recommendations
- Commit: "feat: Match Breakdown Engine module"

Stage 8 — Protected Dashboard Pages

- Dashboard, Continue Learning, Saved Lessons, Bookmarks, Simulation History, Learning Progress, Profile Settings, Subscription Management, Notifications
- Commit: "feat: user dashboard and protected pages"

Stage 9 — Admin Dashboard

- Course/lesson/blog management, match analysis publishing, user management, subscription management, platform analytics, feature toggles
- Hidden certification management scaffolding (backend/schema only, no frontend exposure)
- Commit: "feat: admin dashboard"

Stage 10 — Public Pages & Blog

- About, Pricing, FAQ, Contact, Terms of Service, Privacy Policy, blog listing/detail pages
- Commit: "feat: public pages and blog"

Stage 11 — Homepage

- Design and build the homepage per the Homepage Direction section (free creative reign within its constraints)
- Commit: "feat: homepage"

Stage 12 — SEO, Storage & Polish

- Cloudinary upload integration across all media touchpoints
- Dynamic metadata, sitemap.xml, robots.txt, OpenGraph, structured data
- Accessibility pass, performance pass, responsive QA
- Commit: "feat: SEO, media storage, and final polish"

---

Core Tech Stack

Frontend

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

Backend

- Next.js API Routes
- Server Actions

Database

- Supabase PostgreSQL

Authentication

- Supabase Auth

Media Storage

- Cloudinary

Version Control

- GitHub compatible structure

Deployment

- Vercel

Forms

- React Hook Form

Validation

- Zod

State Management

- Zustand

Email Service

- Resend

Charts

- Recharts

Icons

- Lucide React

Image Optimization

- Next/Image + Cloudinary delivery

---

Storage Requirements

Use Cloudinary for ALL uploads.

Do NOT use Supabase Storage.

Cloudinary handles:

Images:

- Course thumbnails
- Blog images
- User avatars
- Lesson images

Documents:

- PDFs
- Downloadable lesson resources
- Future certificates

Media:

- Videos (future support)

Folder structure:

/punterstat

/punterstat/course-images

/punterstat/blog-images

/punterstat/user-avatars

/punterstat/lesson-assets

/punterstat/downloads

/punterstat/certificates-hidden

Requirements:

- Secure uploads
- Signed uploads
- MIME validation
- File size validation
- Cloudinary CDN delivery
- Automatic compression
- WebP optimization
- AVIF support where possible

Use direct upload architecture:

Browser → Cloudinary

Avoid unnecessary server upload proxy.

---

UI UX Direction

Design language must feel similar to:

- Vercel
- Stripe
- Linear
- Notion
- Coursera
- Framer

Do NOT design similar to:

- Bet365
- SportyBet
- 1xBet

Visual style:

Premium SaaS + Fintech + EdTech aesthetic

Color palette:

Primary:

#0f172a

Secondary:

#1e293b

Accent:

#0d9488

Background:

#f8fafc

Typography:

Inter font

Design rules:

- Minimalist
- Mobile first responsive design
- Large whitespace
- Premium clean interface
- Rounded corners
- Subtle shadows
- Smooth animations
- Fast loading
- Accessibility compliant

The platform must feel educational and intellectual.

Users must feel they are learning, not gambling.

---

Platform Modules

Build complete architecture.

---

Module 1 — Sports University

Educational system.

Topics:

- Football fundamentals
- Tactical formations
- Pressing systems
- League structures
- Tournament systems
- Squad rotation
- Home advantage
- Match tempo
- Sports mechanics

Features:

- Course categories
- Lesson pages
- Video lessons
- Lesson progress tracking
- Lesson completion tracking
- Save lesson/bookmark feature

---

Module 2 — Betting Literacy Academy

Teach:

- Decimal odds
- Fractional odds
- Probability mathematics
- Implied probability
- Expected value
- Bankroll management
- Risk management
- Betting psychology
- Emotional betting mistakes

Features:

- Structured lessons
- Interactive examples
- Progress tracking

---

Module 3 — Simulation Engine

Educational simulation only.

NO REAL MONEY.

Two simulators.

Bet Simulator

Virtual balance:

₦10,000

Allow user to simulate:

- Odds selection
- Stake selection
- Profit/loss tracking
- Win streak tracking
- Mistake tracking

Probability Simulator

User enters:

- Odds
- Win percentage
- Number of bets

Calculate:

- Long term outcome
- Risk exposure
- Profit expectation

Display charts.

Use Recharts.

---

Module 4 — Match Breakdown Engine

Educational sports analysis engine.

Display:

- Team recent form
- Historical match data
- Tactical matchup
- Goal trends
- Home advantage
- Team momentum
- Injury impact

Do NOT say:

"Bet this."

Instead explain:

"Why bookmakers price matches differently."

Pure education.

No betting recommendations.

---

Hidden Future Module

Create architecture only.

Do NOT expose in UI.

Certification Engine

Future support:

- Exams
- Certificates
- Achievement badges

Keep database tables ready.

Keep API structure ready.

Hide all frontend components.

---

Public Pages

Homepage

About

Sports University

Betting Academy

Simulation Engine

Match Analysis

Blog

Pricing

FAQ

Contact

Terms of Service

Privacy Policy

Login

Register

Forgot Password

---

Protected Pages

Dashboard

Continue Learning

Saved Lessons

Bookmarks

Simulation History

Learning Progress

Profile Settings

Subscription Management

Notifications

---

Admin Dashboard

Admin role required.

Features:

- Course management
- Lesson management
- Blog management
- Match analysis publishing
- User management
- Subscription management
- Platform analytics
- Feature toggles
- Hidden certification management

---

Homepage Direction

Full creative and structural freedom on the homepage.

Do not follow a fixed section-by-section layout, headline copy, or CTA wording — design and structure it as you see fit.

The only non-negotiables:

- Reflect the core philosophy: Knowledge Before Decision
- Avoid all gambling/casino design patterns and bookmaker-style UI
- Match the premium SaaS + Fintech + EdTech visual style and color palette already defined
- Make it unmistakably clear PunterStat teaches sports intelligence and probability literacy — it does not sell predictions, process wagers, or facilitate gambling
- Include the legal/educational-use disclaimer somewhere on the page
- Optimize for conversion (drive signups / free trial engagement)

Everything else — section order, hero treatment, copywriting, visual storytelling, number and type of sections — is open.

---

Database Schema

Create full schema.

Tables:

users

profiles

courses

course_categories

lessons

lesson_progress

bookmarks

simulation_sessions

simulation_history

sports_matches

match_analysis

blog_posts

subscriptions

notifications

admin_roles

feature_flags

audit_logs

certifications_hidden

certification_progress_hidden

---

Authentication

Use Supabase Auth.

Support:

- Email login
- Email signup
- Password reset
- Protected routes
- JWT session persistence

Roles:

- User
- Premium User
- Admin

Implement role based access control.

---

SEO

Create:

- Dynamic metadata
- Sitemap.xml
- robots.txt
- OpenGraph metadata
- Structured data for blog pages

Fast loading required.

---

Code Quality Rules

Generate production-level code.

Must run locally.

Must deploy directly on Vercel.

Must work when pushed to GitHub.

Code must be modular.

Use reusable components.

Follow clean architecture principles.

Prioritize scalability.

Use environment variables.

Do not use mock architecture.

Generate real working implementation.

No placeholder logic.

No Replit infrastructure anywhere.

Build as if this is a startup-backed SaaS product.
