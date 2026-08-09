import type { HaikuDto } from "@/api/haikus";
import {
  LANTERN_PATH_MAX_VISIBLE_STOP,
  LANTERN_PATH_MIN_VISIBLE_STOP,
} from "./lanternPath.config";
import { pathStopForHaikuIndex } from "./resolveLanternAtPathStop";

export type VisibleLantern = {
  haikuIndex: number;
  haiku: HaikuDto;
  pathStop: number;
};

export function isPathStopVisible(pathStop: number): boolean {
  return pathStop >= LANTERN_PATH_MIN_VISIBLE_STOP && pathStop <= LANTERN_PATH_MAX_VISIBLE_STOP;
}

export function computeVisibleLanterns(
  haikus: readonly HaikuDto[],
  focusIndex: number,
  tweenProgress = 1,
  fromFocusIndex?: number,
): VisibleLantern[] {
  if (haikus.length === 0) return [];

  const fromFocus = fromFocusIndex ?? focusIndex;
  const results: VisibleLantern[] = [];

  for (let haikuIndex = 0; haikuIndex < haikus.length; haikuIndex += 1) {
    const fromStop = pathStopForHaikuIndex(haikuIndex, fromFocus);
    const toStop = pathStopForHaikuIndex(haikuIndex, focusIndex);
    const pathStop = fromStop + (toStop - fromStop) * tweenProgress;

    if (!isPathStopVisible(pathStop) && !crossesVisibleWindow(fromStop, toStop)) {
      continue;
    }

    if (pathStop < LANTERN_PATH_MIN_VISIBLE_STOP - 1e-6) continue;
    if (pathStop > LANTERN_PATH_MAX_VISIBLE_STOP + 1e-6) continue;

    results.push({
      haikuIndex,
      haiku: haikus[haikuIndex],
      pathStop,
    });
  }

  return results.sort((a, b) => a.pathStop - b.pathStop);
}

function crossesVisibleWindow(fromStop: number, toStop: number): boolean {
  const min = Math.min(fromStop, toStop);
  const max = Math.max(fromStop, toStop);
  return max >= LANTERN_PATH_MIN_VISIBLE_STOP && min <= LANTERN_PATH_MAX_VISIBLE_STOP;
}

export function clampFocusIndex(focusIndex: number, haikuCount: number): number {
  if (haikuCount <= 0) return 0;
  return Math.max(0, Math.min(haikuCount - 1, focusIndex));
}
