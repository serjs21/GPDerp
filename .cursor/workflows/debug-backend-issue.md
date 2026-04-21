# Workflow: Debug Backend Issue

## Goal
Diagnose and fix API/service bugs in `apps/api` while preserving contracts.

## Steps
1. Reproduce using the failing endpoint/service path and gather logs/errors.
2. Trace flow across controller -> service -> repository -> Prisma.
3. Validate request inputs and auth/session guard behavior first; many failures are boundary issues.
4. Keep fix localized and consistent with module conventions (error mapping, logging, response shape).
5. Add/adjust focused test coverage for the regression.
6. If persistence is involved, confirm Prisma schema/migration assumptions.

## Verification
- Targeted module tests in `apps/api/src/modules/**`.
- `pnpm lint:check` in `apps/api`.
- `pnpm build` when fix touches shared types, module boundaries, or startup wiring.
