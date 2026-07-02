# PunterStat

**Sports intelligence and education platform.**

> Knowledge Before Decision

PunterStat teaches users how sports systems work, how probability works, how betting mathematics works, and how analytical thinking helps decision making.

**PunterStat is NOT a betting website.** It does not process real-money transactions, provide betting tips, or facilitate gambling of any kind.

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
| Auth | Supabase Auth |
| Media | Cloudinary |
| Email | Resend |
| Charts | Recharts |
| Deployment | Vercel |

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
# Edit .env.local with your Supabase, Cloudinary, and Resend credentials

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
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |

---

## Project Structure

```
artifacts/punterstat/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── layout/             # Navbar, Footer, PageShell
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (cn, formatDate, etc.)
├── store/                  # Zustand stores (auth, ui)
├── types/                  # Shared TypeScript types
├── .env.local.example      # Environment variable template
├── components.json         # shadcn/ui config
├── tailwind.config.ts      # Tailwind config with brand palette
└── next.config.ts          # Next.js config
```

---

## Build Stages

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | Project Foundation | ✅ Complete |
| 2 | Core Layout & Design System | 🔜 |
| 3 | Database & Auth Infrastructure | 🔜 |
| 4 | Sports University Module | 🔜 |
| 5 | Betting Literacy Academy Module | 🔜 |
| 6 | Simulation Engine Module | 🔜 |
| 7 | Match Breakdown Engine Module | 🔜 |
| 8 | Protected Dashboard Pages | 🔜 |
| 9 | Admin Dashboard | 🔜 |
| 10 | Public Pages & Blog | 🔜 |
| 11 | Homepage | 🔜 |
| 12 | SEO, Storage & Polish | 🔜 |

---

## Legal

PunterStat is strictly an educational platform. All content is for informational and educational purposes only. We do not endorse, facilitate, or promote gambling.
