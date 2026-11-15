# PunterStat

Learn the maths of betting, analyse matches with transparent probabilities, and check your slips with calculators and a tracker. We don't take bets and we don't give tips — [punterstat.site](https://punterstat.site).

This is a small pnpm workspace:

| Path | What it is |
|------|------------|
| [`artifacts/punterstat`](artifacts/punterstat) | The Next.js 16 app (deployed to Vercel). See its [README](artifacts/punterstat/README.md). |
| [`scripts`](scripts) | One-off data tools: `seed-r2` (archive football CSVs to Cloudflare R2), `ingest-r2` (load R2 data into Supabase), and `check-migrations`. |
| [`DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) | Record of completed and planned work. |

```bash
pnpm install
pnpm dev          # run the app (Next.js 16 + Turbopack)
pnpm typecheck    # typecheck the app and scripts
```

## Development

- **Node.js:** Use Node `22` (pinned in `.nvmrc`; `>=20.9` enforced via `engines.node` in `package.json`).
- **Package manager:** `pnpm` with a locked workspace (`pnpm install --frozen-lockfile`). `pnpm-workspace.yaml` enforces a 1-day `minimumReleaseAge` policy on npm packages.
- **Commands (from repo root):**
  - `pnpm dev` — start the Next.js 16 development server with Turbopack (`http://localhost:3000`)
  - `pnpm typecheck` — run `tsc --noEmit` across `artifacts/punterstat` and `scripts` (reports `2 of 3 workspace projects` because the root workspace package `punterstat-workspace` is an aggregator with no `.ts` source files of its own)
  - `pnpm lint` — run ESLint (`eslint .`) across `artifacts/punterstat`
  - `pnpm test` — run the Vitest unit test suite
  - `pnpm build` — run a production Turbopack build of `artifacts/punterstat`
  - `pnpm check-migrations` — verify `artifacts/punterstat/supabase/migrations` has no duplicate numeric prefixes or unexpected numbering gaps
- **Continuous Integration (`.github/workflows/ci.yml`):** Runs on every push and pull request targeting `main` using Node 22 and `pnpm install --frozen-lockfile`. It executes `check-migrations`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` (generating dummy placeholder values exclusively from keys declared in `artifacts/punterstat/.env.local.example` so any undocumented build-time variable fails loudly).

Before adding a Supabase migration, run `git fetch` and check the latest number in
`artifacts/punterstat/supabase/migrations/` — numbers have collided before.
