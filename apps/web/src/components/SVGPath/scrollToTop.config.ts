/** Max focusIndex that uses the near (direct) scroll-to-top path. */
export const SCROLL_TO_TOP_NEAR_THRESHOLD = 10;

/** Far mode jumps here first (`NEAR_THRESHOLD - 5`), then finishes with the near animation. */
export const SCROLL_TO_TOP_HANDOFF_INDEX = SCROLL_TO_TOP_NEAR_THRESHOLD - 5;

/** Fixed duration for the near / final scroll-to-top leg. */
export const SCROLL_TO_TOP_NEAR_MS = 1000;

/** Per-index duration for the far “quick scroll” leg. */
export const SCROLL_TO_TOP_QUICK_MS_PER_INDEX = 80;

/** Cap on the far quick-scroll leg total duration. */
export const SCROLL_TO_TOP_QUICK_MAX_MS = 600;

export function scrollToTopNearDurationMs(_distance?: number, _stepMs?: number): number {
  return SCROLL_TO_TOP_NEAR_MS;
}

export function scrollToTopQuickDurationMs(distance: number): number {
  return Math.min(
    SCROLL_TO_TOP_QUICK_MAX_MS,
    Math.max(SCROLL_TO_TOP_QUICK_MS_PER_INDEX, Math.abs(distance) * SCROLL_TO_TOP_QUICK_MS_PER_INDEX),
  );
}

export function isScrollToTopNear(focusIndex: number): boolean {
  return focusIndex <= SCROLL_TO_TOP_NEAR_THRESHOLD;
}
