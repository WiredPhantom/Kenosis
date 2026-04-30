# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `lumen-library` — Static cozy book library
A fully static site (HTML + CSS + vanilla JS + JSON). No React, no TypeScript, no build framework needed at runtime — Vite is used only as a dev/static server.

- `index.html` — single page shell
- `style.css` — all styles (mobile-first, responsive)
- `app.js` — vanilla JS app with hash routing (`#/` home, `#/book/:id` detail)
- `data/books.json` — **single source of truth for books**. Add a new entry here and it appears on the site automatically.
- `public/covers/` — book cover images (referenced by `coverImageUrl` in JSON)
- `public/avatar/girl-reading.png` — Lumi the animated reading companion (CSS-animated bob/blink/sparkles overlay)

To add a book: append an object to `data/books.json` with `id`, `title`, `author`, `category` (one of: Philosophy, Self-Help, Psychology, Business, Science, Spirituality), `coverImageUrl` (relative path), `shortDescription`, `keyTakeaways[]`, and `summarySections[{heading, paragraphs[]}]`. Drop the cover into `public/covers/` and reload — done.
