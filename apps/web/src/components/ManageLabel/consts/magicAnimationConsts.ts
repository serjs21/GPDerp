/** Shared timings for manage-label row enter/exit animations. */
export const MAGIC_ANIMATION_DURATION_MS = 650;
/** Softened boingOutDown duration (keep timeout in sync with CSS). */
export const MAGIC_EXIT_DURATION_MS = 550;
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
