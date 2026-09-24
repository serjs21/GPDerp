import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { lerp } from "./math";
import {
  SPLIT_PATH_MIN_STOP,
  type ParsedSplitPathSvg,
} from "./parseSplitPathSvg";
import { pointBetweenStops } from "./pathGeometry";
import {
  CREATION_FOCUS_INDEX,
  SVG_PATH_EXIT_STOP,
  SVG_PATH_FOCUS_STOP,
  SVG_PATH_GONE_STOP,
} from "./stops";

/**
 * Scale of each queue stop relative to the next one closer to focus.
 * Stop 20 = 1; stop 19 = ratio; stop 18 = ratio²; …
 */
export const SVG_PATH_QUEUE_SCALE_RATIO = 0.75;

export const SVG_PATH_EXIT_SCALE = 1.1;
export const SVG_PATH_GONE_SCALE = 1.2;
export const SVG_PATH_EXIT_OPACITY = 0.5;
export const SVG_PATH_GONE_OPACITY = 0;

export type SvgPathPose = {
  scale: number;
  opacity: number;
};

export function scaleAtStop(stopId: number): number {
  if (stopId === SVG_PATH_EXIT_STOP) return SVG_PATH_EXIT_SCALE;
  if (stopId === SVG_PATH_GONE_STOP) return SVG_PATH_GONE_SCALE;
  if (stopId < SPLIT_PATH_MIN_STOP || stopId > SVG_PATH_FOCUS_STOP) return 0;
  // Constant per-step ratio so adjacent stops change evenly (not harmonic 1→½→⅓…).
  return SVG_PATH_QUEUE_SCALE_RATIO ** (SVG_PATH_FOCUS_STOP - stopId);
}

export function opacityAtStop(stopId: number): number {
  if (stopId === SVG_PATH_EXIT_STOP) return SVG_PATH_EXIT_OPACITY;
  if (stopId === SVG_PATH_GONE_STOP) return SVG_PATH_GONE_OPACITY;
  if (stopId < SPLIT_PATH_MIN_STOP || stopId > SVG_PATH_FOCUS_STOP) return 0;
  return 1;
}

export function poseAtStop(stopId: number): SvgPathPose {
  return {
    scale: scaleAtStop(stopId),
    opacity: opacityAtStop(stopId),
  };
}

export function lerpPose(fromStop: number, toStop: number, t: number): SvgPathPose {
  const from = poseAtStop(fromStop);
  const to = poseAtStop(toStop);
  return {
    scale: lerp(from.scale, to.scale, t),
    opacity: lerp(from.opacity, to.opacity, t),
  };
}

/** Layout transform for a lantern moving between two path stops. */
export function lanternTransformAtStops(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
  t: number,
): LanternTransform | null {
  const pathStop = fromStop + (toStop - fromStop) * t;
  const a = Math.floor(pathStop);
  const b = Math.ceil(pathStop);
  const localT = pathStop - a;

  // Position and scale both walk adjacent segments so ratio changes linearly per step.
  const point = pointBetweenStops(parsed, a, b, a === b ? 1 : localT);
  if (!point) return null;

  const pose = a === b ? poseAtStop(a) : lerpPose(a, b, localT);

  return {
    x: point.x,
    y: point.y,
    scale: pose.scale,
    opacity: pose.opacity,
    rotate: 0,
    positionMode: "percent",
    stackOrder: Math.round(pathStop * 10),
  };
}

/**
 * Creation lantern fly progress, tied to list scroll into the creation focus.
 * While scrolling toward creation (any index → -1), returns tweenProgress so the
 * fly-in runs in lockstep with the list making space. Settled → 1. Otherwise null.
 */
export function creationFlyProgress(
  focusIndex: number,
  fromFocusIndex: number,
  tweenProgress: number,
  isAnimating: boolean,
): number | null {
  if (focusIndex === CREATION_FOCUS_INDEX) {
    if (isAnimating && fromFocusIndex !== CREATION_FOCUS_INDEX) {
      return tweenProgress;
    }
    return 1;
  }
  return null;
}

/** Path default-stop (stop-20) pose — same transform the focused list lantern uses. */
export function defaultStopLanternTransform(
  parsed: ParsedSplitPathSvg,
): LanternTransform | null {
  return lanternTransformAtStops(
    parsed,
    SVG_PATH_FOCUS_STOP,
    SVG_PATH_FOCUS_STOP,
    1,
  );
}

/**
 * Creation lantern pose: fly exit→focus during scroll; park on default stop transform
 * when settled so handoff matches the list lantern exactly.
 */
export function creationLanternTransformAtFlyT(
  parsed: ParsedSplitPathSvg,
  flyT: number,
): LanternTransform | null {
  if (flyT >= 1) return defaultStopLanternTransform(parsed);
  return generatingLanternTransformAtFlyT(parsed, flyT);
}

/** Generating lantern pose along exit→focus segment; bottom from -exit to +focus. */
export function generatingLanternTransformAtFlyT(
  parsed: ParsedSplitPathSvg,
  flyT: number,
): LanternTransform | null {
  const segmentTransform = lanternTransformAtStops(
    parsed,
    SVG_PATH_EXIT_STOP,
    SVG_PATH_FOCUS_STOP,
    flyT,
  );
  const exitTransform = lanternTransformAtStops(
    parsed,
    SVG_PATH_EXIT_STOP,
    SVG_PATH_EXIT_STOP,
    1,
  );
  const destTransform = lanternTransformAtStops(
    parsed,
    SVG_PATH_FOCUS_STOP,
    SVG_PATH_FOCUS_STOP,
    1,
  );
  if (!segmentTransform || !exitTransform || !destTransform) return segmentTransform;

  const exitBottomPct = (1 - exitTransform.y) * 100;
  const destBottomPct = (1 - destTransform.y) * 100;
  const bottomPct = lerp(-exitBottomPct, destBottomPct, flyT);

  return {
    ...segmentTransform,
    y: 1 - bottomPct / 100,
    positionMode: "percent",
  };
}
