# AGENTS.md

Operational guide for AI/code agents working in this repository.

## Repo Map

- `apps/api`: Fastify + TypeScript backend (modules, services, Prisma migrations).
- `apps/web`: Next.js (App Router) + TypeScript frontend with Ant Design and CSS modules.
- `packages/shared`: shared package shell (currently minimal; verify before adding shared runtime logic).
- `.cursor/rules`: persistent Cursor behavior rules by concern.
- `.cursor/workflows`: task playbooks for common engineering work.

## Key Code Locations

- Backend entrypoint: `apps/api/src/index.ts`
- Backend modules: `apps/api/src/modules/*`
- Backend utilities/validation: `apps/api/src/utils/*`
- Backend Prisma schema/migrations: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*`
- Frontend routes/layout: `apps/web/src/app/*`
- Frontend components: `apps/web/src/components/*`
- Frontend API clients: `apps/web/src/api/*`
- Frontend hooks: `apps/web/src/hooks/*`
- Frontend global styles/tokens: `apps/web/src/app/globals.css`

## Practical Conventions

- TypeScript everywhere; preserve strict typing and local type aliases.
- Backend organization is controller -> service -> repository. Keep handlers thin.
- Validate/sanitize external input at API boundaries; prefer existing utils and Zod where applicable.
- Preserve existing API contract patterns (`ok`, `data`, `error`) unless explicitly asked to change.
- Reuse centralized auth/session patterns already defined in auth plugin and token services.
- Frontend should prefer reusable components/hooks over ad hoc markup.
- Prefer existing CSS variables/theme tokens and module styles over hardcoded one-off styling.
- Be conservative with database and API contract changes.

## Key Commands

Run commands from each app directory unless noted.

- Backend dev: `pnpm dev` (in `apps/api`)
- Backend tests: `pnpm test` (in `apps/api`)
- Backend lint + Prisma checks: `pnpm lint:check` (in `apps/api`)
- Backend build: `pnpm build` (in `apps/api`)
- Frontend dev: `pnpm dev` (in `apps/web`)
- Frontend tests: `pnpm test` (in `apps/web`)
- Frontend lint: `pnpm lint` (in `apps/web`)
- Frontend build: `pnpm build` (in `apps/web`)

## Working Agreement For Agents

- Read adjacent files before editing; mirror local naming and patterns.
- Plan before multi-file or architectural edits.
- Do not introduce new abstractions unless existing patterns fail the use case.
- Do not change public contracts without explicit instruction.
- Run targeted verification first; then escalate to broader checks when risk warrants it.
- Report what was verified and what was intentionally not run.

## Assumptions To Re-check

- There is no confirmed monorepo root script orchestrator; commands appear app-local.
- `packages/shared` currently has no established source tree; verify intended usage before expanding it.
- `apps/web/prisma` exists; primary production DB migration path appears to be `apps/api/prisma`.
