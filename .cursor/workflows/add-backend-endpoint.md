# Workflow: Add Backend Endpoint

## Goal
Add a Fastify endpoint in `apps/api` without breaking existing API contracts.

## Steps
1. Locate the domain module in `apps/api/src/modules/*` and inspect its `*.controller.ts`, `*.service.ts`, and repository files first.
2. Define/confirm input and output contract; preserve existing `{ ok, data, error }` response shape unless instructed otherwise.
3. Add route in the module controller with minimal request parsing and status mapping.
4. Implement business logic in the service layer; keep controller logic thin.
5. Reuse shared validation/sanitization helpers in `apps/api/src/utils` (Zod or existing validators where present).
6. Reuse auth/csrf/session guards already used by neighboring routes.
7. Add/extend tests near the module (`apps/api/src/modules/**/__tests__` or `*.test.ts`).

## Verification
- Targeted: `pnpm test <target>` or `pnpm test -- <pattern>` in `apps/api`.
- Broader when needed: `pnpm lint:check` and `pnpm build` in `apps/api`.
