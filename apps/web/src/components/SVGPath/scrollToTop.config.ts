/** Max focusIndex that uses the near (direct) scroll-to-top path. */
export const SCROLL_TO_TOP_NEAR_THRESHOLD = 10;

/** Far mode snaps here immediately, then finishes with the near animation. */
export const SCROLL_TO_TOP_HANDOFF_INDEX = 2;

/** Fixed duration for the near / final scroll-to-top leg. */
export const SCROLL_TO_TOP_NEAR_MS = 600;

export function scrollToTopNearDurationMs(_distance?: number, _stepMs?: number): number {
  return SCROLL_TO_TOP_NEAR_MS * 1.5;
}

export function isScrollToTopNear(focusIndex: number): boolean {
  return focusIndex <= SCROLL_TO_TOP_NEAR_THRESHOLD;
}
