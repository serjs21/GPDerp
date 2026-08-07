import {
  LANTERN_FLIGHT_PATH_FADE,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_PATH_ROTATE_GAIN,
} from "./lanternFlightPath.config";
import {
  isPathSOnFadeZone,
  lanternExitPathS,
  lanternInitialPathS,
  opacityAtJourneyS,
  opacityAtPathS,
  scaleAtJourneyS,
  scaleAtPathS,
  scaleAtStopIndex,
} from "./lanternFlightPathStops.config";
import {
  journeySBetweenCarouselSteps,
  journeySForCarouselStep,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  LANTERN_ROUTE_JOURNEY,
  lanternFinalJourneyS,
  lanternInitialJourneyS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
  sampleLanternJourneyPath,
} from "./lanternRouteStops";
import {
  pointAtFlightArcLength,
  tangentAtFlightArcLength,
} from "./lanternFlightPathSvg";

export { LANTERN_FLIGHT_PATH_INITIAL, LANTERN_FLIGHT_PATH_FADE } from "./lanternFlightPath.config";
export {
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
export {
  isPathSOnFadeZone,
  lanternExitPathS,
  lanternInitialPathS,
  opacityAtJourneyS,
  opacityAtPathS,
  scaleAtJourneyS,
  scaleAtPathS,
  scaleAtStopIndex,
} from "./lanternFlightPathStops.config";
export {
  journeySBetweenCarouselSteps,
  journeySForCarouselStep,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  LANTERN_ROUTE_JOURNEY,
  lanternFinalJourneyS,
  lanternInitialJourneyS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
  sampleLanternJourneyPath,
} from "./lanternRouteStops";
export {
  LANTERN_FLIGHT_PATH_D,
  LANTERN_FLIGHT_PATH_PERIMETER_EXIT,
  LANTERN_FLIGHT_PATH_PERIMETER_INITIAL,
  LANTERN_FLIGHT_PATH_VIEWBOX,
  getArcLengthTable,
  getFlightArcLength,
  getTotalArcLength,
  perimeterSToFlightS,
  pointAtArcLength,
  pointAtFlightArcLength,
  projectViewBoxPointToFlightS,
  tangentAtArcLength,
  tangentAtFlightArcLength,
} from "./lanternFlightPathSvg";

export type LanternFlightPathSample = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Sample carousel journey position, scale, and tangent rotation. */
export function sampleLanternJourney(journeyS: number): LanternFlightPathSample {
  return sampleLanternJourneyPath(LANTERN_ROUTE_JOURNEY, journeyS, scaleAtJourneyS(journeyS));
}

/** Sample wheel fade segment at flight `pathS` (stop-1 → stop-0). */
export function sampleLanternFlightPath(pathS: number): LanternFlightPathSample {
  const point = pointAtFlightArcLength(pathS);
  const tangentDeg = tangentAtFlightArcLength(pathS);

  return {
    x: point.x,
    y: point.y,
    scale: scaleAtPathS(pathS),
    rotate: tangentDeg * (LANTERN_FLIGHT_PATH_ROTATE_GAIN / 90),
  };
}

export function isLanternJourneyVisible(journeyS: number): boolean {
  if (journeyS > 1 + 1e-6) return false;
  if (journeyS < 0) return false;
  return scaleAtJourneyS(journeyS) > 0;
}

export function isLanternFlightPathVisible(pathS: number): boolean {
  if (pathS > lanternExitPathS() + 0.02) return false;
  return scaleAtPathS(pathS) > 0 || opacityAtPathS(pathS) > 0;
}

export type LanternFlightOpacityInput = {
  pathT: number;
  journeyS?: number;
  nextLanternPathT?: number;
};

export function getLanternJourneyOpacity(journeyS: number): number {
  return opacityAtJourneyS(journeyS);
}

/** Opacity along flight path; hidden when past exit. */
export function getLanternFlightOpacity({
  pathT,
  journeyS,
}: LanternFlightOpacityInput): number {
  if (journeyS !== undefined) {
    return getLanternJourneyOpacity(journeyS);
  }

  if (pathT > lanternExitPathS() + 0.02) {
    return 0;
  }

  return opacityAtPathS(pathT);
}

export type LanternFlightTransform = LanternFlightPathSample & {
  opacity: number;
  positionMode: "percent";
};

export function getLanternJourneyTransform(journeyS: number): LanternFlightTransform {
  const sample = sampleLanternJourney(journeyS);
  return {
    ...sample,
    opacity: getLanternJourneyOpacity(journeyS),
    positionMode: "percent",
  };
}

export function getLanternFlightTransform(
  pathT: number,
  options: { nextLanternPathT?: number; journeyS?: number } = {},
): LanternFlightTransform {
  if (options.journeyS !== undefined) {
    return getLanternJourneyTransform(options.journeyS);
  }

  const sample = sampleLanternFlightPath(pathT);
  return {
    ...sample,
    opacity: getLanternFlightOpacity({
      pathT,
      nextLanternPathT: options.nextLanternPathT,
    }),
    positionMode: "percent",
  };
}

/** Resting queue slot index for carousel stop assignment. */
export function getLanternQueueRestStopIndex(index: number, lanternCount: number): number {
  return Math.min(
    Math.max(0, lanternCount - 1 - index),
    LANTERN_CAROUSEL_STOP_IDS.length - 1,
  );
}

export function getLanternQueueRestJourneyS(index: number, lanternCount: number): number {
  return journeySForCarouselStep(getLanternQueueRestStopIndex(index, lanternCount));
}

/** @deprecated Use getLanternQueueRestJourneyS — kept for existing tests/callers. */
export function getLanternQueueRestPathS(index: number, lanternCount: number): number {
  return getLanternQueueRestJourneyS(index, lanternCount);
}

export function getLanternQueueFadePathS(
  scrollProgress: number,
  index: number,
  lanternCount: number,
): number | undefined {
  if (index !== lanternCount - 1) return undefined;
  const scroll = clamp01(scrollProgress);
  return lerp(lanternInitialPathS(), lanternExitPathS(), scroll);
}

export type LanternQueueSlot = {
  journeyS?: number;
  pathS?: number;
};

function isQueueSlotAtInitial(slot: LanternQueueSlot): boolean {
  if (slot.pathS !== undefined) {
    return slot.pathS <= lanternInitialPathS() + LANTERN_FLIGHT_PATH_REST_EPSILON;
  }
  return (slot.journeyS ?? 0) <= lanternInitialJourneyS() + LANTERN_FLIGHT_PATH_REST_EPSILON;
}

export function getLanternQueueHandoffFadePathS(
  scrollProgress: number,
  index: number,
  lanternCount: number,
): number | undefined {
  const newestIndex = lanternCount - 1;
  if (index >= newestIndex) return undefined;

  const restJourneyS = getLanternQueueRestJourneyS(index, lanternCount);
  if (restJourneyS <= lanternInitialJourneyS() + LANTERN_FLIGHT_PATH_REST_EPSILON) {
    return undefined;
  }

  const nextSlot = resolveLanternQueueSlot(scrollProgress, index + 1, lanternCount);
  if (
    scrollProgress > 0 &&
    isQueueSlotAtInitial(nextSlot)
  ) {
    return lanternExitPathS();
  }

  return undefined;
}

export function resolveLanternQueueSlot(
  scrollProgress: number,
  index: number,
  lanternCount: number,
): LanternQueueSlot {
  const handoffPathS = getLanternQueueHandoffFadePathS(scrollProgress, index, lanternCount);
  if (handoffPathS !== undefined) {
    return { pathS: handoffPathS };
  }

  const fadePathS = getLanternQueueFadePathS(scrollProgress, index, lanternCount);
  if (fadePathS !== undefined) {
    return { pathS: fadePathS };
  }

  return { journeyS: getLanternQueueRestJourneyS(index, lanternCount) };
}

/**
 * Scroll-linked queue position (pathS on fade segment or journeyS on carousel stops).
 * Prefer `resolveLanternQueueSlot` when rendering.
 */
export function getLanternQueuePathProgress(
  scrollProgress: number,
  index: number,
  lanternCount: number,
): number {
  const slot = resolveLanternQueueSlot(scrollProgress, index, lanternCount);
  return slot.pathS ?? slot.journeyS ?? lanternInitialJourneyS();
}

/** Evenly spaced arc-length samples for discrete step previews on fade segment. */
export function lanternFlightPathAtStep(step: number, maxSteps: number): number {
  const clampedStep = Math.max(0, Math.min(maxSteps, step));
  if (maxSteps <= 0) return lanternInitialPathS();
  const fadeSpan = lanternExitPathS() - lanternInitialPathS();
  return lanternInitialPathS() + (clampedStep / maxSteps) * fadeSpan;
}

/** Equal arc-length fractions for `count` lanterns along the fade segment. */
export function equalArcLengthSamples(count: number): number[] {
  if (count <= 1) return [lanternInitialPathS()];
  return Array.from({ length: count }, (_, index) => index / (count - 1));
}
