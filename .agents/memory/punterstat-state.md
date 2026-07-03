---
name: PunterStat project state
description: Key decisions and current state of the PunterStat Next.js app (all 12 stages complete)
---

## Repo
- GitHub: https://github.com/crazyBuddhaa/punterstats
- Vercel root directory: `artifacts/punterstat`
- DEVLOG: `/DEVLOG.md` at workspace root (not inside artifacts/punterstat)
- HEAD after Stage 12: `7b7c933`

## All 12 stages complete
Stages 3–12 were all committed by the replit-agent. The project is fully built and deployed.

## Key architectural decisions
- Next.js 15 App Router, pnpm monorepo, Tailwind v3 (not v4)
- Route groups: `(auth)` for login/register (no navbar), `(main)` for public pages (with navbar), `dashboard/` and `admin/` as top-level protected groups
- Supabase for auth + DB; 19 tables with RLS; `createClient()` is async in server context
- `vercel.json` uses `installCommand: "pnpm install --no-frozen-lockfile"` — do not remove

## Cloudinary module split (Stage 12 fix)
- `lib/cloudinary/types.ts` — shared types (UploadFolder, UploadSignature); safe everywhere
- `lib/cloudinary/sign.ts` — server-only (uses Node crypto); import only in API routes/server actions
- `lib/cloudinary/upload.ts` — client-safe (no Node imports); import in client components
- `app/api/upload/route.ts` — avatars: any auth user; blog/thumbnails: admin role required
- `updateAvatar` server action validates URL starts with `https://res.cloudinary.com/`

## Email
- `lib/email/resend.ts` — SDK-free fetch against Resend REST API; no-ops gracefully if RESEND_API_KEY not set
- `welcomeEmail()` template exists but NOT yet wired into sign-up flow
- Integration point: `app/auth/callback/route.ts` after PKCE code exchange

## Why
- Cloudinary module was split because `import crypto from "crypto"` in a file imported by a client component causes Next.js build failure
- Upload folder RBAC was added because blog/thumbnails are admin-managed assets; any-user signing was an auth gap
