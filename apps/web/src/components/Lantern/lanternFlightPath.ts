import {
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_PATH_MAX_SCALE,
  LANTERN_FLIGHT_PATH_MIN_SCALE,
  LANTERN_FLIGHT_PATH_ROTATE_GAIN,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
import { pointAtArcLength, tangentAtArcLength } from "./lanternFlightPathSvg";

export { LANTERN_FLIGHT_PATH_INITIAL } from "./lanternFlightPath.config";
export { LANTERN_FLIGHT_QUEUE_SPACING } from "./lanternFlightPath.config";
export {
  LANTERN_FLIGHT_PATH_D,
  LANTERN_FLIGHT_PATH_VIEWBOX,
  getArcLengthTable,
  getTotalArcLength,
  pointAtArcLength,
  tangentAtArcLength,
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

function scaleAtArcLength(s: number): number {
  const pathS = Math.max(0, s);

  if (pathS <= LANTERN_FLIGHT_PATH_INITIAL) {
    if (LANTERN_FLIGHT_PATH_INITIAL <= 0) return 1;
    return lerp(
      LANTERN_FLIGHT_PATH_MIN_SCALE,
      1,
      pathS / LANTERN_FLIGHT_PATH_INITIAL,
    );
  }

  const fadeSpan = 1 - LANTERN_FLIGHT_PATH_INITIAL;
  if (fadeSpan <= 0) return LANTERN_FLIGHT_PATH_MAX_SCALE;

  return lerp(
    1,
    LANTERN_FLIGHT_PATH_MAX_SCALE,
    (pathS - LANTERN_FLIGHT_PATH_INITIAL) / fadeSpan,
  );
}

/** Sample position, scale, and tangent rotation at normalized arc length `s` (0–1). */
export function sampleLanternFlightPath(pathS: number): LanternFlightPathSample {
  const s = clamp01(pathS);
  const point = pointAtArcLength(s);
  const tangentDeg = tangentAtArcLength(s);

  return {
    x: point.x,
    y: point.y,
    scale: scaleAtArcLength(s),
    rotate: tangentDeg * (LANTERN_FLIGHT_PATH_ROTATE_GAIN / 90),
  };
}

export type LanternFlightOpacityInput = {
  pathT: number;
};

/** Opacity along path: full at/before INITIAL; linear fade to 0 at path exit. */
export function getLanternFlightOpacity({ pathT }: LanternFlightOpacityInput): number {
  if (pathT <= LANTERN_FLIGHT_PATH_INITIAL) {
    return 1;
  }

  const fadeSpan = 1 - LANTERN_FLIGHT_PATH_INITIAL;
  const fadeT = clamp01((pathT - LANTERN_FLIGHT_PATH_INITIAL) / fadeSpan);
  return 1 - fadeT;
}

export type LanternFlightTransform = LanternFlightPathSample & {
  opacity: number;
  positionMode: "percent";
};

export function getLanternFlightTransform(pathT: number): LanternFlightTransform {
  const sample = sampleLanternFlightPath(pathT);
  return {
    ...sample,
    opacity: getLanternFlightOpacity({ pathT }),
    positionMode: "percent",
  };
}

/** Map scroll progress to per-lantern arc-length position in a queue. */
export function getLanternQueuePathProgress(
  scrollProgress: number,
  index: number,
  spacing: number = LANTERN_FLIGHT_QUEUE_SPACING,
): number {
  const clampedScroll = clamp01(scrollProgress);
  const exitSpan = 1 - LANTERN_FLIGHT_PATH_INITIAL;
  const leadPathS = LANTERN_FLIGHT_PATH_INITIAL + clampedScroll * exitSpan;
  return Math.max(0, leadPathS - index * spacing);
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
