import {
  SPLIT_PATH_MAX_STOP,
  SPLIT_PATH_MIN_STOP,
} from "./parseSplitPathSvg";

/** Path stop for the focused lantern. */
export const SVG_PATH_FOCUS_STOP = 20;
export const SVG_PATH_EXIT_STOP = 21;
export const SVG_PATH_GONE_STOP = 22;

export function isStopOnPath(stopId: number): boolean {
  return stopId >= SPLIT_PATH_MIN_STOP && stopId <= SPLIT_PATH_MAX_STOP;
}

/** Which authored stop a haiku occupies when `focusIndex` sits on stop-20. */
export function stopForHaikuIndex(haikuIndex: number, focusIndex: number): number {
  return SVG_PATH_FOCUS_STOP + focusIndex - haikuIndex;
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
