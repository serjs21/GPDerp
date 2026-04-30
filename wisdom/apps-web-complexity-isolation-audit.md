# Apps/Web Complexity and Isolation Audit

Date: 2026-04-30
Scope: `apps/web/src`
Rules baseline: `.cursor/ethics/react-clean-code-rules`

## 1) Module Inventory

| Layer | Total TS/TSX | Production | Test | Stories |
|---|---:|---:|---:|---:|
| `app` | 29 | 26 | 1 | 2 |
| `components` | 91 | 63 | 9 | 19 |
| `hooks` | 18 | 16 | 2 | 0 |
| `api` | 9 | 9 | 0 | 0 |
| `utils` | 8 | 8 | 0 | 0 |
| `theme` | 2 | 2 | 0 | 0 |
| `config` | 1 | 1 | 0 | 0 |
| `types` | 2 | 2 | 0 | 0 |
| `i18n` | 1 | 1 | 0 | 0 |

## 2) Color-Coded Complexity + Isolation Findings

Legend:
- `RED`: too complex / mixed responsibilities / high simplification payoff
- `YELLOW`: moderate complexity and/or partial clean-code drift
- `GREEN`: generally well-isolated and follows clean-code intent

| Area | Color | Why this rating | Evidence | Simplification action |
|---|---|---|---|---|
| Profile page orchestration | RED | File owns routing, auth gating, local-storage hydration, profile fetch, preference sync, update flows, and modal state in one component; high state fan-out and multiple effects | `apps/web/src/app/profile/page.tsx` | Extract `useProfileBootstrap` (auth + fetch + preference reconciliation) and `useProfileActions` (save/avatar/email flows), keep page mostly render + wiring |
| Share modal flow | RED | Component combines form modeling, validation, API orchestration, success transitions, and conditional rendering branches | `apps/web/src/components/ShareModal/ShareModal.tsx` | Split into `useShareModalState`, `useCreateShareLink`, `useShareByEmail`; keep modal component presentational |
| Theme selector interaction logic | RED | UI, animation math, icon interpolation, CSS var composition, and commit semantics are tightly coupled in a single component | `apps/web/src/components/ThemeSelector/ThemeSelector.tsx` | Move math/color interpolation into pure utilities (`themeSelectorMath.ts`) and keep component focused on events/render |
| Reconnectable websocket hook | YELLOW | Strong cleanup and lifecycle handling, but callback-ref syncing uses 4 independent effects and custom queue/reconnect logic increases cognitive load | `apps/web/src/hooks/useWebSocket.ts` | Replace per-callback effects with one merged ref object; extract reconnect policy and queue behavior into small helpers |
| Auth duality toggle root | YELLOW | Main component still coordinates measurement, lock state, hover/focus behavior, and animation hooks; however some motion policy is extracted already | `apps/web/src/components/AuthenticationNav/components/AuthDualityToggle/AuthDualityToggle.tsx` | Extract measurement concern (`useLabelMinWidths`) and selection lock policy hook |
| Auth duality transition policy hook | GREEN | Transition rules are explicit (`text`/`icon` modes), deterministic, and isolated from view layer | `apps/web/src/components/AuthenticationNav/components/AuthDualityToggle/useAuthToggleSideTransitions.ts` | Keep pattern; add tiny state-transition table docs/tests for future edits |
| Seam animation hook | GREEN | Animation side effects are cleanly isolated with cancellation and single responsibility | `apps/web/src/components/AuthenticationNav/components/AuthDualityToggle/useDualitySeamAnimation.ts` | Keep as-is; only tune constants if behavior changes |
| Auth navigation shell | GREEN | Small, declarative component with clear responsibility boundary | `apps/web/src/components/AuthenticationNav/AuthNavigation.tsx` | No refactor needed |

## 3) Clean Code Rules Compliance Snapshot

- Rule 1 (single responsibility): mixed adherence; strongest violations are `profile/page.tsx`, `ShareModal.tsx`, `ThemeSelector.tsx`.
- Rule 2 (prefer pure calculations over effect sync): some effect-heavy flows in profile and websocket areas; several calculations are already pure in theme/auth toggle modules.
- Rule 3 and 4 (isolate animation state machines, explicit transitions): good implementation in AuthDuality hooks.
- Rule 8 (cleanup side effects): `useWebSocket` and seam animation cleanup are good.
- Rule 9 (co-locate feature code but split responsibilities): many features are co-located, but high-complexity components still bundle policy + rendering.

## 4) Code Not Imported by App (Static Graph Candidates)

Method:
- Parsed static imports/exports across production `src` code.
- Excluded framework entrypoints (`app/**/page|layout|route|error|loading|not-found|template|default`, etc.).
- Then manually checked references with repo-wide symbol search.

### High-confidence app-unreferenced (production path)
- `apps/web/src/components/AuthenticationNav/AuthNavYinBackground.tsx`
- `apps/web/src/components/AuthenticationNav/AuthNavYinSegment.tsx`
- `apps/web/src/components/NavigationMenu/NavigationMenu.tsx`
- `apps/web/src/hooks/useScrollOnContent/useScrollOnContent.ts`
- `apps/web/src/utils/sockets.ts`
- `apps/web/src/components/GoogleAuthentication/GoogleAuthentication.tsx`
- `apps/web/src/components/HaikuDisplay/HaikuDisplay.tsx`
- `apps/web/src/components/animations/WashInSea/WashInSea.tsx`
- `apps/web/src/components/AuthenticationNav/components/AuthDualityToggleDemo/AuthDualityToggleDemo.tsx`

### Notes / caveats
- Some of these are still used by tests, Storybook, or infra tests (for example `WashInSea`, `AuthDualityToggleDemo`), but they appear disconnected from runtime app flows.
- `apps/web/src/components/HaikuGenerationChat/index.tsx` appears unimported, but the feature is used via direct file import (`HaikuGenerationChat/HaikuGenerationChat.tsx`), so this is likely an unused barrel, not dead feature code.
- `apps/web/src/api/userConfiguration.ts` appears as a static-graph false positive from alias/re-export detection and is in fact imported.

## 5) Wasteful or Simplifiable Patterns

- Large client pages handling transport + business policy + UI rendering in one file.
- Duplicate state-reset flows in modal components.
- Math-heavy UI logic embedded directly in React component body.
- Story/test-only components co-located with production components without explicit naming convention; this makes dead-code detection noisy.

## 6) Automation Gaps (Not in Current Stack) and Recommendations

Current stack includes ESLint/Jest/Playwright/Storybook, but misses dedicated dead-code/import-graph automation.

Priority recommendations:

1. **P1: Add [Knip](https://github.com/webpro-nl/knip)**  
   - Purpose: detect unused files/exports/dependencies and unlisted deps.
   - Why now: directly addresses your “not imported by app” requirement continuously.
   - Suggested CI command: `pnpm knip --production`.

2. **P1: Add [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)**  
   - Purpose: enforce isolation boundaries (e.g., components cannot deep-import unrelated feature internals).
   - Why now: converts architectural guidance into enforceable rules.
   - Suggested CI command: `depcruise src --config .dependency-cruiser.cjs`.

3. **P2: Strengthen ESLint complexity gates**
   - Add explicit `complexity`, `max-lines-per-function`, and tighter react-hooks linting policy.
   - Why now: catches future regressions in `RED` areas before PR merge.

4. **P3: Add trend-based quality gate (optional)**
   - SonarQube/CodeClimate-style historical complexity drift tracking if your team wants release-over-release visibility.

## 7) Executive Summary (Color Outcome)

- `RED` (simplify soon): profile orchestration, share modal logic, theme selector coupling.
- `YELLOW` (targeted cleanup): websocket hook callback/lifecycle ergonomics, auth duality root composition.
- `GREEN` (good patterns to keep): explicit transition hook separation, animation side-effect isolation, small declarative navigation shell.

Immediate high-ROI work:
1) split policy hooks out of `profile/page.tsx`;  
2) split share modal state/actions from rendering;  
3) extract theme selector math to pure modules;  
4) add Knip + dependency-cruiser to CI.
