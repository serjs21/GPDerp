import type { HaikuDto } from "@/api/haikus";
import { rotationFaceAtProgress, targetFaceForStop, targetRotationForStop, type StopFace } from "../pathStopRotation";
import type { SvgPathVisibleLantern } from "../SVGPath.types";
import type { ParsedSplitPathSvg } from "./parseSplitPathSvg";
import { lanternTransformAtStops } from "./lanternDisplay";
import { catchUpStopForHaiku, isStopOnPath, stopForHaikuIndex } from "./stops";

type StopTween = { fromStop: number; toStop: number; localT: number };

export function lanternFaceBetween(parsed: ParsedSplitPathSvg, fromStop: number, toStop: number, t: number): StopFace {
  if (fromStop === toStop || t >= 1) return targetFaceForStop(parsed, toStop);
  return rotationFaceAtProgress(
    targetRotationForStop(parsed, fromStop),
    targetRotationForStop(parsed, toStop),
    t,
  );
}

/** Pose between two stops, or null when both stops are off the path / no transform resolves. */
function placeBetweenStops(parsed: ParsedSplitPathSvg, { fromStop, toStop, localT }: StopTween) {
  if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return null;
  const transform = lanternTransformAtStops(parsed, fromStop, toStop, localT);
  if (!transform) return null;
  return { transform, face: lanternFaceBetween(parsed, fromStop, toStop, localT) };
}

export type VisibleLanternsInput = {
  parsed: ParsedSplitPathSvg;
  haikus: HaikuDto[];
  focusIndex: number;
  fromFocusIndex: number;
  tweenProgress: number;
  /** First newly paged-in index while the catch-up tween runs, else null. */
  catchUpStart: number | null;
  catchUpT: number;
  /** Pre-delete indices while the delete pack tween runs, else null. */
  packIndexById: Map<string, number> | null;
  deletePackT: number;
  loaderShown: boolean;
};

/**
 * Catch-up: newly paged haikus slide in from the loader slot. Delete pack: survivors tween from their
 * vacated slot to the compacted one. Otherwise: the regular focus-step tween.
 */
function haikuStopTween(haiku: HaikuDto, haikuIndex: number, input: VisibleLanternsInput): StopTween {
  const { focusIndex, fromFocusIndex, catchUpStart, catchUpT } = input;
  if (catchUpStart !== null && catchUpT < 1 && haikuIndex >= catchUpStart) {
    return {
      fromStop: catchUpStopForHaiku(haikuIndex, catchUpStart, fromFocusIndex, catchUpT),
      toStop: catchUpStopForHaiku(haikuIndex, catchUpStart, focusIndex, catchUpT),
      localT: input.tweenProgress,
    };
  }
  const prevIndex = input.packIndexById?.get(haiku.id);
  if (prevIndex != null && prevIndex !== haikuIndex) {
    // Tween along path from vacated older slot toward compacted slot.
    return {
      fromStop: stopForHaikuIndex(prevIndex, focusIndex),
      toStop: stopForHaikuIndex(haikuIndex, focusIndex),
      localT: input.deletePackT,
    };
  }
  return {
    fromStop: stopForHaikuIndex(haikuIndex, fromFocusIndex),
    toStop: stopForHaikuIndex(haikuIndex, focusIndex),
    localT: input.tweenProgress,
  };
}

/** Path lanterns on screen this frame, plus the pagination loader slot after the last haiku. */
export function computeVisibleLanterns(input: VisibleLanternsInput): SvgPathVisibleLantern[] {
  const { parsed, haikus } = input;
  const lanterns: SvgPathVisibleLantern[] = haikus.flatMap((haiku, haikuIndex) => {
    const placed = placeBetweenStops(parsed, haikuStopTween(haiku, haikuIndex, input));
    return placed ? [{ haiku, haikuIndex, loading: false, ...placed }] : [];
  });

  if (input.loaderShown) {
    const placed = placeBetweenStops(parsed, {
      fromStop: stopForHaikuIndex(haikus.length, input.fromFocusIndex),
      toStop: stopForHaikuIndex(haikus.length, input.focusIndex),
      localT: input.tweenProgress,
    });
    if (placed) lanterns.push({ haiku: undefined, haikuIndex: haikus.length, loading: true, ...placed });
  }

  return lanterns;
}
