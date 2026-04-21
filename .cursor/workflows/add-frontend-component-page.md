# Workflow: Add Frontend Component Or Page

## Goal
Add UI in `apps/web` using existing design and data-fetching patterns.

## Steps
1. Inspect similar pages/components in `apps/web/src/app` and `apps/web/src/components` before adding new structures.
2. Prefer extending reusable components/hooks over one-off markup.
3. For new routes, place under `apps/web/src/app/.../page.tsx`; for reusable UI, add to `apps/web/src/components/...`.
4. Keep server/client boundaries intentional; add `"use client"` only when required.
5. Use existing API modules in `apps/web/src/api` and shared axios setup (`src/axios.setup.ts` / `src/client.axios.setup.ts`).
6. Prefer CSS modules and existing variables from `apps/web/src/app/globals.css`.
7. Preserve semantic HTML and accessibility labels/roles.

## Verification
- Targeted: `pnpm test -- <component-or-hook-pattern>` in `apps/web`.
- Standard checks: `pnpm lint`.
- If route/render behavior changed significantly: `pnpm build`.
