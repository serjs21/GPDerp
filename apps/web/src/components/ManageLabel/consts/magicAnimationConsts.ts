/** Shared timings for manage-label row enter/exit animations. */
export const MAGIC_ANIMATION_DURATION_MS = 650;
/** Softened boingOutDown duration (keep in sync with CSS). */
export const MAGIC_EXIT_BOING_MS = 550;
/** Height collapse so rows below slide up (keep in sync with CSS). */
export const MAGIC_EXIT_COLLAPSE_MS = 420;
/** Full exit window (boing + collapse run in parallel). */
export const MAGIC_EXIT_DURATION_MS = Math.max(
  MAGIC_EXIT_BOING_MS,
  MAGIC_EXIT_COLLAPSE_MS,
);
/** Delay between staggered enter animation starts (selection / insert order). */
export const MAGIC_ENTER_STAGGER_MS = 280;

/** First id at 0ms, then +stagger each — no wall-clock backlog. */
export function buildEnterStaggerDelays(
  ids: readonly string[],
): Record<string, number> {
  const delays: Record<string, number> = {};
  ids.forEach((id, index) => {
    delays[id] = index * MAGIC_ENTER_STAGGER_MS;
  });
  return delays;
}
