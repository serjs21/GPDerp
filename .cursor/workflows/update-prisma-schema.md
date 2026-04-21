# Workflow: Update Prisma Schema

## Goal
Change database schema safely for API code under `apps/api`.

## Steps
1. Inspect existing models and nearby migrations in `apps/api/prisma/schema.prisma` and `apps/api/prisma/migrations`.
2. Update schema with conservative changes (avoid implicit contract breaks unless requested).
3. Create a migration in `apps/api/prisma/migrations` with a clear timestamped name.
4. Update impacted repository/service logic in `apps/api/src/modules`.
5. Update tests for changed persistence behavior.
6. Check whether frontend API consumers require updates for changed data shape.

## Verification
- In `apps/api`: run Prisma validation/format checks (`pnpm lint:check` includes Prisma checks).
- Run targeted backend tests for affected modules.
- Run broader backend build/test if schema change is widely used.

## Notes
- Assumption: primary Prisma write path is `apps/api/prisma/*`; `apps/web/prisma/*` exists but appears secondary.
