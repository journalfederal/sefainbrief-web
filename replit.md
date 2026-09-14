# Sefa in Brief

An English-language editorial site for the Sefa in Brief YouTube channel, combining channel promotion with an automatically refreshed, date-sorted video briefing archive.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sefain-brief-site` — the deployable mobile-first React/Vite website.
- `artifacts/api-server/src/routes/channel-feed.ts` — the public YouTube RSS adapter and channel profile data.
- `lib/api-spec/openapi.yaml` — the source-of-truth contract for the channel feed endpoint.
- `artifacts/sefain-brief-site/src/index.css` — the editorial theme, typography, responsive rules, and motion.

## Architecture decisions

- YouTube's public RSS feed is read server-side so the browser does not depend on cross-origin feed access.
- The feed is sorted by `publishedAt` on the server and refreshed by the page every five minutes while open.
- The visual system follows the channel reference: briefing-room navy, signal red, market yellow, paper background, and editorial typography.
- The UI keeps a small local fallback archive so the promotional page remains usable when YouTube is temporarily unavailable.

## Product

Visitors can understand the channel quickly, open the latest briefings, browse the current archive, visit YouTube, and subscribe. New public uploads are pulled into the site automatically and shown newest-first.

## User preferences

- All user-facing copy is in English.

## Gotchas

- The frontend workflow supplies `PORT` and `BASE_PATH`; run the managed workflow for preview/build verification.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
