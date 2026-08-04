import {
  LANTERN_FLIGHT_PATH_FADE,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_PATH_ROTATE_GAIN,
} from "./lanternFlightPath.config";
import {
  isPathSOnFadeZone,
  lanternExitPathS,
  lanternInitialPathS,
  opacityAtPathS,
  scaleAtPathS,
} from "./lanternFlightPathStops.config";
import {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
} from "./lanternRouteStops";
import {
  perimeterSToFlightS,
  pointAtFlightArcLength,
  projectViewBoxPointToFlightS,
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
  opacityAtPathS,
  scaleAtPathS,
} from "./lanternFlightPathStops.config";
export {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
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

const JOURNEY_START_PATH_S = lanternJourneyStartPathS();

/** Sample position, scale, and tangent rotation at flight arc length `pathS` (0 = rest, 1 = exit). */
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

export function isLanternFlightPathVisible(pathS: number): boolean {
  if (pathS > lanternExitPathS() + 0.02) return false;
  if (pathS < JOURNEY_START_PATH_S - 0.02) return false;
  return scaleAtPathS(pathS) > 0 || opacityAtPathS(pathS) > 0;
}

export type LanternFlightOpacityInput = {
  pathT: number;
  nextLanternPathT?: number;
};

/** Opacity along flight path; hidden when past exit. */
export function getLanternFlightOpacity({
  pathT,
}: LanternFlightOpacityInput): number {
  if (pathT > lanternExitPathS() + 0.02) {
    return 0;
  }

  return opacityAtPathS(pathT);
}

export type LanternFlightTransform = LanternFlightPathSample & {
  opacity: number;
  positionMode: "percent";
};

export function getLanternFlightTransform(
  pathT: number,
  options: { nextLanternPathT?: number } = {},
): LanternFlightTransform {
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

/**
 * Resting queue slot for a lantern (newest at stop-1, older at higher stop ids).
 * `index` 0 = oldest; `lanternCount - 1` = newest at default stop.
 */
export function getLanternQueueRestPathS(index: number, lanternCount: number): number {
  const stopIndex = lanternCount - 1 - index;
  const clampedStopIndex = Math.min(
    Math.max(0, stopIndex),
    LANTERN_FLIGHT_PATH_STOPS.length - 1,
  );
  return LANTERN_FLIGHT_PATH_STOPS[clampedStopIndex] ?? lanternInitialPathS();
}

/**
 * Scroll-linked path position: newest lantern fades stop-1 → stop-0; others hold discrete stops
 * until handoff moves them to exit.
 */
export function getLanternQueuePathProgress(
  scrollProgress: number,
  index: number,
  lanternCount: number,
): number {
  const scroll = clamp01(scrollProgress);
  const newestIndex = lanternCount - 1;
  const restPathS = getLanternQueueRestPathS(index, lanternCount);

  if (index === newestIndex) {
    return restPathS * (1 - scroll) + lanternExitPathS() * scroll;
  }

  const nextPathS =
    index < newestIndex ? getLanternQueuePathProgress(scrollProgress, index + 1, lanternCount) : undefined;

  if (
    scroll > 0 &&
    nextPathS !== undefined &&
    nextPathS <= lanternInitialPathS() + LANTERN_FLIGHT_PATH_REST_EPSILON &&
    restPathS > lanternInitialPathS() + LANTERN_FLIGHT_PATH_REST_EPSILON
  ) {
    return lanternExitPathS();
  }

  return restPathS;
}

/** Evenly spaced arc-length samples for discrete step previews. */
export function lanternFlightPathAtStep(step: number, maxSteps: number): number {
  const clampedStep = Math.max(0, Math.min(maxSteps, step));
  if (maxSteps <= 0) return lanternInitialPathS();
  const fadeSpan = lanternExitPathS() - lanternInitialPathS();
  return lanternInitialPathS() + (clampedStep / maxSteps) * fadeSpan;
}

/** Equal arc-length fractions for `count` lanterns along the full path. */
export function equalArcLengthSamples(count: number): number[] {
  if (count <= 1) return [lanternInitialPathS()];
  return Array.from({ length: count }, (_, index) => index / (count - 1));
}
