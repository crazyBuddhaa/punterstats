# PunterStat

Sports intelligence and education platform — [punterstat.site](https://punterstat.site).

This is a small pnpm workspace:

| Path | What it is |
|------|------------|
| [`artifacts/punterstat`](artifacts/punterstat) | The Next.js app (deployed to Vercel). See its [README](artifacts/punterstat/README.md). |
| [`scripts`](scripts) | One-off data tools: `seed-r2` (archive football CSVs to Cloudflare R2) and `ingest-r2` (load R2 data into Supabase). |
| [`DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) | Record of completed and planned work. |

```bash
pnpm install
pnpm dev          # run the app
pnpm typecheck    # typecheck the app and scripts
```

Before adding a Supabase migration, run `git fetch` and check the latest number in
`artifacts/punterstat/supabase/migrations/` — numbers have collided before.
