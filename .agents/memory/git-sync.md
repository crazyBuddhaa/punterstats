---
name: Git sync caution
description: The PunterStat repo (crazyBuddhaa/punterstats) has active pushes from other contributors. Always fetch before writing migrations or file numbers collide.
---

## Rule
Before any session that creates migration files or new routes, run `git fetch origin` and check `git log origin/main --oneline -10`. The repo receives content pushes independently.

**Why:** In one session, 5 new commits landed on origin/main (migrations 041–047, new routes) while working locally at 6526432. My migration `041_payment_providers.sql` collided with `041_football_fundamentals_key_takeaways.sql`. Had to rename to 048.

## Lockfile conflict recovery
When `git stash pop` conflicts on `pnpm-lock.yaml`:
1. `git checkout --theirs pnpm-lock.yaml && git add pnpm-lock.yaml`
2. `git stash drop`
3. Re-run `pnpm add <package> -w` in the app directory to reinstall lost packages.

## Push command
```bash
TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN"
git remote set-url origin "https://${TOKEN}@github.com/crazyBuddhaa/punterstats.git"
git push origin main
git remote set-url origin "https://github.com/crazyBuddhaa/punterstats.git"
```
