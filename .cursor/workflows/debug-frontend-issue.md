# Workflow: Debug Frontend Issue

## Goal
Find and fix UI/runtime issues in `apps/web` with minimal regression risk.

## Steps
1. Reproduce issue locally and identify scope (route/component/hook/API integration).
2. Inspect related component, CSS module, and API hook files before changing code.
3. Verify whether failure is state, network, auth/cookie, or rendering boundary (`"use client"` vs server).
4. Reuse existing error handling and messaging patterns (for example Ant Design `message` usage where applicable).
5. Implement smallest safe fix; avoid broad UI rewrites.
6. Add or adjust focused test(s) near the bug location.

## Verification
- Targeted frontend tests for impacted component/hook.
- `pnpm lint` in `apps/web`.
- `pnpm build` if issue touches routing/layout or hydration-sensitive code.
