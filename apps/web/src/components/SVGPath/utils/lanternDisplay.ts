import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { lerp } from "./math";
import {
  SPLIT_PATH_MIN_STOP,
  type ParsedSplitPathSvg,
} from "./parseSplitPathSvg";
import { pointBetweenStops } from "./pathGeometry";
import {
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
    if (stopId === SVG_PATH_FOCUS_STOP) return 1;
    if (stopId === SVG_PATH_EXIT_STOP) return SVG_PATH_EXIT_SCALE;
    if (stopId === SVG_PATH_GONE_STOP) return SVG_PATH_GONE_SCALE;
    if (stopId < SPLIT_PATH_MIN_STOP || stopId > SVG_PATH_FOCUS_STOP) return 0;
        return 1 / (SVG_PATH_FOCUS_STOP - stopId + 1);
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
