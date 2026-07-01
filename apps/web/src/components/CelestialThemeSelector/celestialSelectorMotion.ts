import type { Transition } from "motion/react";

export const CELESTIAL_SELECTOR_LAYOUT_ID_PREFIX = "celestial-selector";

export const CELESTIAL_SELECTOR_LAYOUT_TRANSITION: Transition = {
  layout: { duration: 3, ease: [0.22, 1, 0.36, 1] },
};

export const CELESTIAL_SELECTOR_INSTANT_TRANSITION: Transition = {
  layout: { duration: 0 },
};

export function celestialSelectorTransition(
  reduceMotion: boolean | null,
): Transition {
  return reduceMotion
    ? CELESTIAL_SELECTOR_INSTANT_TRANSITION
    : CELESTIAL_SELECTOR_LAYOUT_TRANSITION;
}
