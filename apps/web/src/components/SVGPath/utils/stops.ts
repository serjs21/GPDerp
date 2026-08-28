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

/** Focus index that leaves stop-20 empty for the generating lantern. */
export const CREATION_FOCUS_INDEX = -1;

/** Which authored stop a haiku occupies when `focusIndex` sits on stop-20. */
export function stopForHaikuIndex(haikuIndex: number, focusIndex: number): number {
  return SVG_PATH_FOCUS_STOP + focusIndex - haikuIndex;
}

/** Stop for the virtual lantern that would occupy the next queue slot after `haikuCount` items. */
export function queueLoaderStop(haikuCount: number, focusIndex: number): number {
  return stopForHaikuIndex(haikuCount, focusIndex);
}

/** Opaque queue slots are stops 0–20 (`opacityAtStop === 1`). */
export function isOpaqueQueueStop(stopId: number): boolean {
  return stopId >= SPLIT_PATH_MIN_STOP && stopId <= SVG_PATH_FOCUS_STOP;
}

export function shouldFetchNextQueuePage(haikuCount: number, focusIndex: number): boolean {
  return isOpaqueQueueStop(queueLoaderStop(haikuCount, focusIndex));
}

/** Pack new haikus at the loader/join stop, then fan out to natural slots as `catchUpT` goes 0→1. */
export function catchUpStopForHaiku(
  haikuIndex: number,
  catchUpStartIndex: number,
  focusIndex: number,
  catchUpT: number,
): number {
  const packed = stopForHaikuIndex(catchUpStartIndex, focusIndex);
  const natural = stopForHaikuIndex(haikuIndex, focusIndex);
  return packed + (natural - packed) * catchUpT;
}

export function canStepBack(focusIndex: number): boolean {
  return focusIndex > 0;
}

export function canStepForward(focusIndex: number, haikuCount: number): boolean {
  if (haikuCount <= 0) return false;
  return focusIndex < haikuCount - 1;
}

/** Scroll target clamp; allows creation slot (-1) when list is non-empty. */
export function clampScrollFocusIndex(focusIndex: number, haikuCount: number): number {
  if (haikuCount <= 0) return 0;
  return Math.max(CREATION_FOCUS_INDEX, Math.min(haikuCount - 1, focusIndex));
}

export function clampFocusIndex(focusIndex: number, haikuCount: number): number {
  if (haikuCount <= 0) return 0;
  return Math.max(0, Math.min(haikuCount - 1, focusIndex));
}
