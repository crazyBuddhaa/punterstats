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

### [Stage 3 — Database & Auth Infrastructure]
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

### [Stage 4 — Sports University Module]
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

### [Stage 5 — Betting Literacy Academy Module]
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
