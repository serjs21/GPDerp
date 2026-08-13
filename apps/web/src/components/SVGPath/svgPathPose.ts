import {
  SPLIT_PATH_MAX_STOP,
  SPLIT_PATH_MIN_STOP,
} from "./parseSplitPathSvg";

export const SVG_PATH_FOCUS_STOP = 20;
export const SVG_PATH_EXIT_STOP = 21;
export const SVG_PATH_GONE_STOP = 22;

export const SVG_PATH_QUEUE_SCALE_RATIO = 0.6;

export type SvgPathPose = {
  scale: number;
  opacity: number;
};

export function scaleAtStop(stopId: number): number {
  if (stopId === SVG_PATH_EXIT_STOP) return 1.2;
  if (stopId === SVG_PATH_GONE_STOP) return 1.4;
  if (stopId < SPLIT_PATH_MIN_STOP || stopId > SVG_PATH_FOCUS_STOP) return 0;
  return SVG_PATH_QUEUE_SCALE_RATIO ** (SVG_PATH_FOCUS_STOP - stopId);
}

export function opacityAtStop(stopId: number): number {
  if (stopId === SVG_PATH_EXIT_STOP) return 0.5;
  if (stopId === SVG_PATH_GONE_STOP) return 0;
  if (stopId < SPLIT_PATH_MIN_STOP || stopId > SVG_PATH_FOCUS_STOP) return 0;
  return 1;
}

export function poseAtStop(stopId: number): SvgPathPose {
  return {
    scale: scaleAtStop(stopId),
    opacity: opacityAtStop(stopId),
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPose(fromStop: number, toStop: number, t: number): SvgPathPose {
  const from = poseAtStop(fromStop);
  const to = poseAtStop(toStop);
  return {
    scale: lerp(from.scale, to.scale, t),
    opacity: lerp(from.opacity, to.opacity, t),
  };
}

/** Which authored stop a haiku occupies when `focusIndex` sits on stop-20. */
export function stopForHaikuIndex(haikuIndex: number, focusIndex: number): number {
  return SVG_PATH_FOCUS_STOP + focusIndex - haikuIndex;
}

export function isStopOnPath(stopId: number): boolean {
  return stopId >= SPLIT_PATH_MIN_STOP && stopId <= SPLIT_PATH_MAX_STOP;
}

export function canStepBack(focusIndex: number): boolean {
  return focusIndex > 0;
}

export function canStepForward(focusIndex: number, haikuCount: number): boolean {
  if (haikuCount <= 0) return false;
  return focusIndex < haikuCount - 1;
}

export function clampFocusIndex(focusIndex: number, haikuCount: number): number {
  if (haikuCount <= 0) return 0;
  return Math.max(0, Math.min(haikuCount - 1, focusIndex));
}
