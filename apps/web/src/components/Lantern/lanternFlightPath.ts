import {
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_PATH_ROTATE_GAIN,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
import { pointAtFlightArcLength, tangentAtFlightArcLength } from "./lanternFlightPathSvg";

export { LANTERN_FLIGHT_PATH_INITIAL } from "./lanternFlightPath.config";
export {
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
export {
  LANTERN_FLIGHT_PATH_D,
  LANTERN_FLIGHT_PATH_PERIMETER_EXIT,
  LANTERN_FLIGHT_PATH_PERIMETER_INITIAL,
  LANTERN_FLIGHT_PATH_VIEWBOX,
  getArcLengthTable,
  getFlightArcLength,
  getTotalArcLength,
  pointAtArcLength,
  pointAtFlightArcLength,
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

function scaleAtFlightArcLength(pathS: number): number {
  if (pathS < 0 || pathS > 1) return 0;
  return 1 - pathS;
}

function opacityAtFlightArcLength(pathS: number): number {
  if (pathS < 0 || pathS > 1) return 0;
  return 1 - pathS;
}

/** Sample position, scale, and tangent rotation at flight arc length `pathS` (0 = rest, 1 = exit). */
export function sampleLanternFlightPath(pathS: number): LanternFlightPathSample {
  const flightS = clamp01(pathS);
  const point =
    pathS < 0 || pathS > 1
      ? pointAtFlightArcLength(Math.min(1, Math.max(0, pathS)))
      : pointAtFlightArcLength(flightS);
  const tangentDeg = tangentAtFlightArcLength(flightS);

  return {
    x: point.x,
    y: point.y,
    scale: scaleAtFlightArcLength(pathS),
    rotate: tangentDeg * (LANTERN_FLIGHT_PATH_ROTATE_GAIN / 90),
  };
}

export function isLanternFlightPathVisible(pathS: number): boolean {
  return sampleLanternFlightPath(pathS).scale > 0;
}

export type LanternFlightOpacityInput = {
  pathT: number;
  nextLanternPathT?: number;
};

/** Opacity along flight path; hidden when superseded or out of range. */
export function getLanternFlightOpacity({
  pathT,
  nextLanternPathT,
}: LanternFlightOpacityInput): number {
  if (pathT < 0 || pathT > 1) {
    return 0;
  }

  if (
    nextLanternPathT !== undefined &&
    nextLanternPathT <= LANTERN_FLIGHT_PATH_REST_EPSILON &&
    pathT > LANTERN_FLIGHT_PATH_REST_EPSILON
  ) {
    return 0;
  }

  return opacityAtFlightArcLength(pathT);
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

/** Map scroll progress to per-lantern flight arc position (0 = rest, 1 = exit). */
export function getLanternQueuePathProgress(
  scrollProgress: number,
  index: number,
  spacing: number = LANTERN_FLIGHT_QUEUE_SPACING,
): number {
  const leadPathS = clamp01(scrollProgress);
  return leadPathS - index * spacing;
}

/** Evenly spaced arc-length samples for discrete step previews. */
export function lanternFlightPathAtStep(step: number, maxSteps: number): number {
  const clampedStep = Math.max(0, Math.min(maxSteps, step));
  if (maxSteps <= 0) return 0;
  return clampedStep / maxSteps;
}

/** Equal arc-length fractions for `count` lanterns along the full path. */
export function equalArcLengthSamples(count: number): number[] {
  if (count <= 1) return [0];
  return Array.from({ length: count }, (_, index) => index / (count - 1));
}
