# Apps/Web No-Regression Fix Plan

Date: 2026-04-30  
Scope: `apps/web`

## Baseline Snapshot

- `pnpm lint:complexity`: 14 errors, 41 warnings (blocking correctness + non-blocking complexity).
- `pnpm knip:strict`: no current files/exports violations under current config.
- `pnpm deps:check:strict`: 0 errors, 6 warnings (orphan/style boundary warnings).

## Phase 0: Lock Behavior Baseline

Goal: prevent hidden behavior regressions before refactors.

Actions:
1. Identify high-risk flows: auth, profile save, share modal, theme selector, websocket updates.
2. Add/refresh characterization tests for current behavior (golden path + 2 failure modes per flow).
3. Capture current snapshots where visual transitions matter.

Exit criteria:
- Characterization tests pass and are committed before structural refactors.

## Phase 1: Low-Risk Cleanup (Dead Code + Hygiene)

Goal: remove noise and reduce lint surface safely.

Actions:
1. Remove high-confidence runtime-unreferenced files one at a time.
2. Fix straightforward unused vars/imports and test-only lint issues.
3. Keep demo/story-only assets only when explicitly needed.

Exit criteria:
- `deps:check:strict` orphan warnings reduced.
- No test regressions.

## Phase 2: Correctness Errors First

Goal: eliminate error-level lint issues before complexity tuning.

Actions:
1. Replace `set-state-in-effect` anti-patterns in:
   - `app/providers/AuthenticationProvider.tsx`
   - `components/AuthGateModal/AuthGateModal.tsx`
   - `components/IconUploader/IconUploader.tsx`
2. Remove `any` usage and immutability violations in:
   - `components/StreamText.tsx` + tests
   - `hooks/useWebSocket.ts`
   - `hooks/useScrollOnContent/useScrollOnContent.test.ts`
   - `components/TextTyping/TextTyping.tsx`

Exit criteria:
- Error count in `pnpm lint:complexity` reaches 0.

## Phase 3: Complexity Reduction By Extraction

Goal: reduce hotspot complexity without changing contracts.

Actions:
1. Extract profile controller hooks from `app/profile/page.tsx`.
2. Extract share modal state/actions from `components/ShareModal/ShareModal.tsx`.
3. Extract pure math/color modules from `components/ThemeSelector/ThemeSelector.tsx`.
4. Split reconnect/queue policy from `hooks/useWebSocket.ts`.

Exit criteria:
- Hotspot files cross below agreed complexity/length thresholds or show measurable downward trend.

## Phase 4: Enforcement Tightening

Goal: prevent regressions after cleanup.

Actions:
1. Keep complexity rules warning-only until backlog falls below threshold.
2. Promote selected rules to error for changed files via CI policy.
3. Move `quality:check` toward strict mode once baseline is stable.

Exit criteria:
- CI blocks new regressions while allowing legacy debt burn-down completion.

## Verification Matrix

| Phase | Commands | Pass Criteria |
|---|---|---|
| Phase 0 | `pnpm test -- <targeted suites>` | Characterization tests stable |
| Phase 1 | `pnpm deps:check:strict`, targeted Jest | No new boundary errors; removals do not break tests |
| Phase 2 | `pnpm lint:complexity`, targeted Jest | 0 lint errors (warnings allowed during transition) |
| Phase 3 | `pnpm lint:complexity`, targeted Jest + Playwright (auth/profile/share/theme) | Extracted modules preserve behavior and reduce complexity |
| Phase 4 | `pnpm quality:check`, selective `pnpm test`, selective Playwright | No new regressions; quality gates enforceable |

## Rollback Strategy

- Keep refactors in small PR slices by concern.
- Revert single-slice commits if parity fails.
- Do not combine extraction + behavior changes in same PR unless required.
