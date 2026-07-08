# PunterStat

**Sports intelligence and education platform.**

> Knowledge Before Decision

PunterStat teaches users how sports systems work, how probability works, how betting mathematics works, and how analytical thinking helps decision making.

**PunterStat is NOT a betting website.** It does not process real-money transactions, provide betting tips, or facilitate gambling of any kind.

**Live site:** [punterstat.site](https://punterstat.site)
**Support:** [support@punterstat.site](mailto:support@punterstat.site)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email + Google OAuth) |
| Media | Cloudinary |
| Email | Resend |
| Charts | Recharts |
| Deployment | Vercel |
| Data Lake | Cloudflare R2 |
| Live Odds | The Odds API |
| Fixtures | football-data.org / footballdata.io |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/crazyBuddhaa/punterstats.git
cd punterstats/artifacts/punterstat

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase, Cloudinary, Resend, and API credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Vercel Deployment

1. Import the repository on [vercel.com](https://vercel.com)
2. Set the **Root Directory** to `artifacts/punterstat`
3. Add all environment variables from `.env.local.example`
4. Deploy

---

## Environment Variables

See `.env.local.example` for the full list of required environment variables.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Sender address (default: noreply@punterstat.site) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (https://punterstat.site) |
| `ODDS_API_KEY` | The Odds API key for live market data |
| `FOOTBALL_DATA_API_KEY` | football-data.org API key |
| `FOOTBALLDATA_IO_API_KEY` | footballdata.io API key |
| `SPORTRADAR_API_KEY` | Sportradar API key for live data |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (R2) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_R2_BUCKET` | R2 bucket name (punterstat-data) |
| `CRON_SECRET` | Secret token for cron job endpoints |

---

## Project Structure

```
artifacts/punterstat/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, register, forgot-password, update-password
│   ├── (main)/             # Public pages (home, courses, blog, pricing, etc.)
│   ├── admin/              # Admin dashboard (users, courses, blog, flags)
│   ├── api/                # API routes (odds, fixtures, calibration, R2, cron)
│   └── dashboard/          # Protected user dashboard
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Navbar, Footer, PageShell
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Auth form components
│   ├── betting-academy/    # Betting Academy components
│   ├── blog/               # Blog list and post components
│   ├── dashboard/          # Dashboard widgets
│   ├── match-breakdown/    # Match analyser components
│   ├── sections/           # Homepage section components
│   ├── simulation/         # Bet/probability simulator components
│   ├── sports-university/  # Sports University components
│   └── spot-the-value/     # Value finder components
├── hooks/                  # Custom React hooks
├── lib/                    # Server-side utilities and API clients
│   ├── auth/               # Auth helpers and server actions
│   ├── calibration/        # Brier score calculation
│   ├── match-breakdown/    # Poisson probability model
│   ├── odds/               # Odds API client + de-vigging
│   ├── simulation/         # Monte Carlo / Poisson engines
│   ├── sports-data/        # Multi-provider fixture router
│   ├── spot-the-value/     # EV calculator
│   └── supabase/           # Supabase client/server helpers
├── store/                  # Zustand stores (auth, ui)
├── supabase/migrations/    # 40 SQL migration files
├── types/                  # Shared TypeScript types
├── .env.local.example      # Environment variable template
└── vercel.json             # Vercel deployment config
```

---

## Build Stages

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | Project Foundation | ✅ Complete |
| 2 | Core Layout & Design System | ✅ Complete |
| 3 | Database & Auth Infrastructure | ✅ Complete |
| 4 | Sports University Module | ✅ Complete |
| 5 | Betting Literacy Academy Module | ✅ Complete |
| 6 | Simulation Engine Module | ✅ Complete |
| 7 | Match Breakdown Engine Module | ✅ Complete |
| 8 | Protected Dashboard Pages | ✅ Complete |
| 9 | Admin Dashboard | ✅ Complete |
| 10 | Public Pages & Blog | ✅ Complete |
| 11 | Homepage | ✅ Complete |
| 12 | SEO, Storage & Polish | ✅ Complete |
| 13 | Historical Stats & R2 Data Lake | ✅ Complete |
| 14 | Live Odds & Spot the Value | ✅ Complete |
| 15 | Fixes & Hardening (ongoing) | 🔄 In progress |

---

## Legal

PunterStat is strictly an educational platform. All content is for informational and educational purposes only. We do not endorse, facilitate, or promote gambling.
