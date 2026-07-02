---
name: pnpm workspace PostCSS plugin hoisting
description: PostCSS plugins (autoprefixer, tailwindcss, postcss) must be in dependencies not devDependencies in pnpm workspace sub-packages for Vercel/Next.js builds.
---

## Rule
In a pnpm monorepo, Next.js's webpack PostCSS loader resolves plugins from the workspace root `node_modules`. `devDependencies` of sub-packages are not reliably hoisted there.

**Why:** Vercel runs `pnpm run build` from the root. pnpm's strict hoisting means devDependencies of workspace packages may not appear at root level, causing `Cannot find module 'autoprefixer'` at build time even though the package is installed locally to the sub-package.

**How to apply:** For any Next.js app in a pnpm workspace, always place `autoprefixer`, `postcss`, and `tailwindcss` in `dependencies` (not `devDependencies`). Same applies to any PostCSS plugin referenced in `postcss.config.*`.
