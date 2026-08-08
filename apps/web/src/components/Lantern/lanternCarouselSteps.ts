import { journeySForCarouselStep } from "./lanternRouteStops";

export type CarouselStepBounds = {
  minStepIndex: number;
  maxStepIndex: number;
};

/** Carousel stop index (0 = stop-1) for lantern offset 0 = lead/newest. */
export function getCarouselLanternStopIndex(stepIndex: number, lanternOffset: number): number {
  return stepIndex - lanternOffset;
}

export function getCarouselStepBounds(lanternCount: number): CarouselStepBounds {
  if (lanternCount <= 0) {
    return { minStepIndex: 0, maxStepIndex: -1 };
  }

  return {
    minStepIndex: 0,
    maxStepIndex: Math.max(0, lanternCount - 1),
  };
}

export function clampCarouselStepIndex(stepIndex: number, lanternCount: number): number {
  const { minStepIndex, maxStepIndex } = getCarouselStepBounds(lanternCount);
  if (maxStepIndex < minStepIndex) return minStepIndex;
  return Math.max(minStepIndex, Math.min(maxStepIndex, stepIndex));
}

export function isCarouselStepAllowed(stepIndex: number, lanternCount: number): boolean {
  const { minStepIndex, maxStepIndex } = getCarouselStepBounds(lanternCount);
  if (lanternCount <= 0) return false;
  return stepIndex >= minStepIndex && stepIndex <= maxStepIndex;
}

/** True when lantern offset is on a valid carousel stop at this step. */
export function isCarouselLanternVisibleAtStep(stepIndex: number, lanternOffset: number): boolean {
  return getCarouselLanternStopIndex(stepIndex, lanternOffset) >= 0;
}

/** True when lantern offset `stepIndex` lands on stop-1 (carousel index 0). */
export function hasLanternOnStop1(stepIndex: number, lanternCount: number): boolean {
  if (lanternCount <= 0) return false;
  return stepIndex >= 0 && stepIndex < lanternCount;
}

export function buildCarouselLanternJourneyS(
  stepIndex: number,
  lanternCount: number,
): number[] {
  if (lanternCount <= 0) return [];

  return Array.from({ length: lanternCount }, (_, offset) =>
    journeySForCarouselStep(getCarouselLanternStopIndex(stepIndex, offset)),
  );
}
