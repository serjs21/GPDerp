# Apps/Web Extraction, Removal, and Simplification Report

Date: 2026-04-30  
Scope: `apps/web/src`

## 1) Extract To Standalone Modules

| Target | Extract Candidate | Why | Risk | Required Tests |
|---|---|---|---|---|
| `app/profile/page.tsx` | `useProfileBootstrap`, `useProfileActions` | File mixes auth checks, storage hydration, profile fetch, mutation flows, and UI wiring | Medium | Profile page interaction tests + auth redirect checks |
| `components/ShareModal/ShareModal.tsx` | `useShareModalState`, `useCreateShareLink`, `useShareByEmail` | High branching and combined form/transport orchestration | Medium | Share modal unit tests + email/link flow tests |
| `components/ThemeSelector/ThemeSelector.tsx` | `themeSelectorMath.ts`, `themeSelectorColorBlend.ts` | Dense interpolation and visual math embedded in component | Low-Medium | Theme selector visual state tests + Storybook snapshot checks |
| `hooks/useWebSocket.ts` | `websocketReconnectPolicy.ts`, `websocketSendQueue.ts` | Lifecycle, retry, callback refs, queueing all in one hook | Medium-High | Hook tests for reconnect/backoff/send queue semantics |
| `components/AuthenticationNav/components/AuthDualityToggle/AuthDualityToggle.tsx` | `useLabelMinWidths`, `useSelectionLockPolicy` | Root component still coordinates multiple interaction concerns | Medium | Toggle interaction tests (hover/focus/click/close token) |

## 2) Removal Candidates

| Candidate | Confidence | Rationale | Caveat | Safe Removal Check |
|---|---|---|---|---|
| `components/AuthenticationNav/AuthNavYinBackground.tsx` | High | No runtime usage found | Could be kept for future variant work | Confirm no app imports + no storyboard dependency needed |
| `components/AuthenticationNav/AuthNavYinSegment.tsx` | High | No runtime usage found | Possible design fallback artifact | Confirm no feature flag path references it |
| `components/NavigationMenu/NavigationMenu.tsx` | High | Not referenced in runtime flows | Might be legacy UI prototype | Remove with related unused CSS/icons cleanup |
| `hooks/useScrollOnContent/useScrollOnContent.ts` | High | Hook appears test-only | Could be intended for future reusable scroll behavior | Ensure no pending branch depends on hook |
| `utils/sockets.ts` | High | Reported as orphan | May be placeholder util | Remove only if no non-TS runtime import path |
| `components/AuthenticationNav/components/AuthDualityToggleDemo/AuthDualityToggleDemo.tsx` | Medium | Story/test/demo usage only | Keep if demo remains part of docs strategy | Move to demo-only location or keep with explicit naming |
| `components/animations/WashInSea/WashInSea.tsx` | Medium | Not in runtime app path | Used in story/infra test contexts | Decide if infra visual primitive should remain |

## 3) Simplify In Place

| File | Simplification Opportunity | Risk | Required Tests |
|---|---|---|---|
| `components/AuthGateModal/AuthGateModal.tsx` | Remove sync `setState` in effect by deriving mode from props/open phase | Low | Modal state transition tests |
| `app/providers/AuthenticationProvider.tsx` | Replace effect-based mount state toggling with safer pattern | Low | Provider initialization test |
| `components/IconUploader/IconUploader.tsx` | Eliminate state reset effect and reduce branch complexity | Medium | Icon upload + image fallback tests |
| `components/TextTyping/TextTyping.tsx` | Fix render-time mutation (`chunkIndex` reassign) | Low-Medium | Text chunk ordering/render tests |
| `components/StreamText.tsx` and tests | Remove `any`, fix test component display-name issues | Low | Stream text unit tests |
| `hooks/useAuthentication.ts` | Resolve exhaustive-deps and complexity by splitting auth steps | Medium | Authentication hook tests |

## 4) Prioritized Sequence

1. Remove high-confidence dead files with no runtime references.  
2. Fix correctness lint errors (`set-state-in-effect`, `no-explicit-any`, immutability issues).  
3. Extract highest ROI modules (`profile`, `share modal`, `theme selector`, `websocket`).  
4. Tighten gates once warning/error baseline is reduced.

## 5) Exit Criteria For This Report

- Every `High` confidence removal candidate is either deleted or explicitly retained with reason.
- Red hotspot files have extraction issue/task owners.
- Correctness errors reach zero before strict complexity enforcement.
