# Auth-Duality Folder Refactor Summary

## Final Architecture

The auth-duality folder now follows app-style separation:

- **Container/UI orchestration:** `ZenDualityButton.tsx`
- **Animation presentation:** `TextToIcon.tsx`
- **Wrapper integration:** `LoginButton.tsx`
- **Transition policy hook:** `useAuthToggleSideTransitions.ts`
- **Seam path animation hook:** `useZenDualitySeamAnimation.ts`
- **Shared motion constants/utilities:** `authToggleMotion.ts`
- **Black-hole helpers:** `wash-in-sea/blackHoleConstants.ts`, `wash-in-sea/prepareCharacterItems.ts`

## New Components Added

| Component | Responsibility |
|---|---|
| `ZenDualityButton` | Main dual-option button with hover transitions, click lock, and unlock via `onClose` token changes. |
| `TextToIcon` | Handles text->black-hole->icon and icon->text transitions, including non-interruptible exit lock + queued target reconciliation. |
| `LoginButton` | Wrapper around `ZenDualityButton` that demonstrates mock login/register modal flow and close-unlock behavior. |

## Folder-Wide Required Metrics

Metrics are for logic files in this folder (estimated complexity via branch/operator count).

- **Highest line count:** `199` in `ZenDualityButton.tsx`
- **Highest estimated complexity:** `13` in `wash-in-sea/WashInSea.tsx`

## Hooks and Utilities (with Complexity)

| File | Type | Responsibility | Lines | Estimated Complexity |
|---|---|---|---:|---:|
| `useAuthToggleSideTransitions.ts` | Hook | Computes target side mode, delay, and duration from hover intent and width fitness. | 124 | 3 |
| `useZenDualitySeamAnimation.ts` | Hook | Drives seam/ying path morph animation tied to hovered side and resize duration. | 83 | 4 |
| `authToggleMotion.ts` | Utility | Shared animation constants and width-crossing timing utility. | 18 | 1 |
| `wash-in-sea/blackHoleConstants.ts` | Utility | Shared types/constants for black-hole animation internals. | 5 | 1 |
| `wash-in-sea/prepareCharacterItems.ts` | Utility | Splits text nodes into character spans for per-character animation. | 40 | 6 |

## Behavior Guarantees Preserved

- Non-interruptible text exit once text-to-icon begins.
- Queued target mode applied after exit lock completes.
- Click lock on selected side until `onClose` token changes.
- Seam-safe rendering (no overlap between seam and visible text/icon).
- Smooth transitions on lock/unlock and modal close flows.

## Tests Added/Updated

- `TextToIcon.test.tsx`
  - verifies non-interruptible text exit and queued target reconciliation
  - verifies icon fallback when text cannot be shown safely
- `ZenDualityButton.test.tsx`
  - verifies click lock persistence across hover attempts
  - verifies unlock on `onClose` token change
- Playwright regression
  - `tests/playwright/auth-duality-liquid-toggle-anime-whirlpool-overlap.spec.ts`
  - confirms no seam/text and no seam/icon overlap after refactor
