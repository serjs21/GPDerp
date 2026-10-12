# apps/web — Code Complexity & Performance Status

Status as of 2026-10-12. Refactor base: `0186fb8`. Current tree: `ab339f5` plus uncommitted follow-up fixes.

## Summary

- **Component complexity:** requirement **met**. 0 components over the limit, 0 suppressions (was 85 suppressed).
- **Lint health:** improved on every tracked rule. The refactor added no new `eslint-disable`s; one existing `exhaustive-deps` disable was removed.
- **Performance:** label list first render is unchanged. Sorting 1,000 labels is ~17% faster but still scales badly with list size, which remains the top performance issue.
- **Tests:** 335/338 Jest tests pass. The 3 failures were already failing before the refactor and are unrelated to it.

## 1. Component complexity

Rule: `local/component-complexity` (classic cyclomatic complexity, max **5** per React component). Checked with `pnpm lint:components`.

| Metric | Before (`0186fb8`) | Now |
|---|---|---|
| Components over limit | 85 (in 79 files) | **0** |
| Bulk suppressions (`eslint-suppressions.json`) | 85 | **0** (`{}`) |
| Files over suppression budget | 0 | 0 |

### Exempt animation components

These four are tagged `@animationComponent`, with a reason in each tag:

| Component | File | Why exempt |
|---|---|---|
| PathScrim | `components/PathOverlay/PathScrim.tsx` | animejs staggered canvas grid + hover-glow loops |
| SteppedTransition | `components/animations/SteppedTransition/SteppedTransition.tsx` | pose hold-and-crossfade primitive |
| CoverLabel | `components/DualityButton/CoverLabel.tsx` | arc-text morph tied to base rotation |
| Sway | `components/Sway/Sway.tsx` | CSS-keyframe pendulum with reduced-motion bypass |

Other components that contain animation (CoverState, SVGPath, BrushMenu, HaikuActions, ManageLabelsPanel, …) were **not** exempted. Their animation logic moved into hooks instead.

### How it was reduced

The refactor ran in batches B0–B7: shared UI, the comic page and modals, the label collection, share links, SVGPath and lanterns, CoverState/Duality/Brush, and finally the haiku actions, header search, settings and auth screens. The changes fall into four kinds:

- **Prop defaults** now go through `withDefaults(props, DEFAULTS)` instead of a default per destructured prop.
- **Branching** for classes, styles, aria attributes and view-models moved into pure `utils/` functions.
- **State machines, timers and listeners** moved into focused hooks. Examples: `useCoverPhase`, `useClapBurst`, `useBrushTriggerSize`, `usePathCreationLayer`, and the settings-page hooks.
- **Variant-heavy render branches** became separate subcomponent files, e.g. `SavedHaikuActions` / `HaikuActionsGenerating` and `ProfileActiveTab`.

## 2. Lint health (ESLint over `apps/web/src`)

Repo-wide totals. Files unchanged since the base count the same in both columns; changed files were linted at the base commit and in the current tree.

| Rule | Before | Now | Change |
|---|---|---|---|
| `local/component-complexity` (error) | 85 | 0 | −85 |
| `complexity` (warn, max 12) | 37 | 12 | −25 |
| `max-lines-per-function` (warn) | 34 | 17 | −17 |
| `react-hooks/refs` (error) | 42 | 33 | −9 |
| `react-hooks/set-state-in-effect` (error) | 23 | 22 | −1 |
| `@typescript-eslint/no-unused-vars` (warn) | 14 | 12 | −2 |

Notes:

- **Errors still left.** The remaining `react-hooks/*` errors existed before the refactor. Many moved, unchanged, from component bodies into the extracted hooks (e.g. `useCoverPhase`, `useTextBubblePanel`, `useStableLabelOrder`).
- **Errors that surfaced.** One, the paint-height measurement in `BrushMenu/useBrushTriggerSize.ts`, used to be hidden because the React Compiler skipped the oversized parent component.
- **Kept on purpose.** `LabelHalo/useHaloLabelDraft.ts` keeps its original effect-based draft sync. It must update in the same pass as `useLabelPuffIn`, otherwise new labels flash at full opacity before puffing in.
- **Why these matter.** Each remaining `react-hooks/*` error can make the React Compiler skip memoizing that component or hook. The biggest clusters:
  - `SVGPath/*` hooks: `refs` ×16
  - `DualityButton/*`: `set-state-in-effect` ×5
  - `TextBubbleDropdown/useTextBubblePanel.ts`: ×2
  - `HeaderHaikuTools/useHeaderSettingsSearch.ts`: ×2
- **Other leftovers.** 5 `exhaustive-deps` warnings remain: `useShareLinks`, `useShareLinkHaikuEnrichment` ×2, `useComicalBubbles`, `useBuyGenerations`. There is also 1 `prefer-const` error in `styleNavigationStarRimAngle.test.ts`.

## 3. Performance

Benchmark: `tests/playwright-app/perf/labelsCollection.perf.ts` via `pnpm bench:app --grep "labels" --grep-invert "10000"`.

Setup, same for both runs:
- Production build (`next start`), mocked API, seeded dataset.
- Chromium 145.0.7632.6 headless, 1280×720, no CPU throttling, Apple M2 Pro.
- 7 measured runs after 1 discarded warm-up.

Records are in `apps/web/perf-records/labels-collection_*.json`.

| Scenario | Labels | Before median / p95 | Now median / p95 | Change (median) |
|---|---|---|---|---|
| Navigate → first label rows | 100 | 326.7 / 345.7 ms | 344.2 / 384.5 ms | +5% (within noise) |
| Navigate → first label rows | 1,000 | 321.0 / 334.6 ms | 318.9 / 346.2 ms | −1% |
| "Alpacabet" sort → all rows rendered | 100 | 529.3 / 566.4 ms | 494.1 / 558.7 ms | −7% |
| "Alpacabet" sort → all rows rendered | 1,000 | 20,719 / 22,965 ms | 17,266 / 19,732 ms | **−17%** |
| Any | 10,000 | not measured | not measured | — |

Sort at 1,000 labels, per run:

| | Before | Now |
|---|---|---|
| Page requests | 83 | 83 |
| Long tasks | 117 (10,881 ms) | 89 (7,012 ms) |
| Longest event | 96 ms | 24 ms |

### Interpretation

- **Fewer and shorter long tasks.** Lighter label rows and stable per-row props mean less main-thread work while each page arrives.
- **The sort still scales badly.** 10× the labels takes ~35× the time. The cause is architectural, not per-component: the panel loads every page one after another (page size 12, 83 requests for 1,000 labels) and sorts in memory, and each page triggers a re-render. `useShareLinks` follows the same load-everything-then-sort pattern, although that API accepts `sort`/`dir`.
- **Not measured:** share links, haikus and the label picker have no performance test yet.

## 4. Behavior verification

- **Regression verifiers** were run per batch:
  - B0+B1, B2, B6, B7: no regressions found.
  - B3–B5: one regression, the LabelHalo puff-in ordering, which is now fixed.
- **Follow-up fixes after verification:**
  - **LabelHalo flash:** the effect-based draft sync is restored, so new labels no longer flash before puffing in.
  - **Search reset:** the labels panel and label picker kept their old search query ~200 ms after closing. The new shared `hooks/useDebouncedSearchInput.ts` clears it immediately.
  - **Late ref updates:** in `useLabelSlotRotation` and `useHaloDraggable`, refs holding the latest props are now updated in `useLayoutEffect`, so pointer and blur handlers never read stale values.
  - **Picker crash:** the label picker hit "Maximum update depth exceeded" while inactive. `useStableLabelOrder` now keeps the existing empty array instead of setting a new one.
  - **Duplicate dismiss logic:** BrushMenu and TextBubbleDropdown now use the shared `hooks/useDismissOnOutside.ts` instead of local copies.
- **Known low-risk differences** (not visible today):
  - HoverHoldCallout uses its old position for one render before a pre-paint correction.
  - `DualityFaceIcon` remounts if `tone` changes at runtime.
  - `HaikuActions` remounts on the generating → saved switch.
  - PathOverlay mounts one render earlier.
- **Not verified in a browser:** interactive flows were checked by reading code and Storybook smoke tests, with no before/after screenshot comparison. Worth a manual pass:
  - The halo puff-in when adding labels.
  - Opening and closing BrushMenu and CoverState.
  - Opening and closing HaikuActions' modals.
  - Settings tab switching.
  - Login and registration.

## 5. Tests & build

| Check | Command (in `apps/web`) | Result |
|---|---|---|
| Types | `npx tsc --noEmit -p .` | clean |
| Complexity gate | `pnpm lint:components` | 0 violating, 0 suppressed |
| Unit tests | `npx jest` | 335 / 338 pass |
| Production build | `pnpm build` | passed after the last refactor batch, not re-run after the follow-up hook fixes |

The 3 Jest failures were already failing before the refactor:
- `Lantern/labelBeltLayout.test.ts` and `Lantern/lanternTransform.test.ts` expect older values of constants that were later hand-tuned.
- `HaikuGenerationStickyNote/hooks/usePendingHaikuSubmit.test.ts`: its mock lacks `insufficientCreditsMessage`.

## 6. Recommended next steps

1. **P1 — labels sort scaling.** Pass `sort`/`dir` to the API and paginate the sorted results instead of loading every page and sorting in memory. Apply the same fix to `useShareLinks`. Re-run the bench, including the 10,000-label tier.
2. **P2 — clear the `react-hooks/*` errors.** Start with the `SVGPath` hooks (`refs` ×16) and `DualityButton` (`set-state-in-effect` ×5), so the React Compiler can memoize them.
3. **P3 — fix the 3 outdated Jest tests** so the suite is green and catches regressions.
4. **P3 — add performance tests** for share links and the label picker.
5. **Ongoing:** new and changed components are checked by `pnpm lint:components:changed`. Keep `eslint-suppressions.json` empty.

## Reproduce

```bash
cd apps/web
pnpm lint:components                                   # complexity inventory
npx tsc --noEmit -p .
npx jest
pnpm build
pnpm bench:app --grep "labels" --grep-invert "10000"   # needs a production build
```
