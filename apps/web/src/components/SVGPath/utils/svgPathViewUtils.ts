import type { HaikuDto } from "@/api/haikus";
import type { CreationLayerState } from "../SVGPath.types";
import type { ParsedSplitPathSvg } from "./parseSplitPathSvg";
import { creationFlyProgress, creationLanternTransformAtFlyT } from "./lanternDisplay";
import { CREATION_FOCUS_INDEX, shouldFetchNextQueuePage, stopForHaikuIndex, SVG_PATH_FOCUS_STOP } from "./stops";

/** One extra scroll slot for the pagination loader while more pages exist. */
export function svgPathQueue(haikuCount: number, hasNextPage: boolean, isFetchingNextPage: boolean) {
  const morePages = hasNextPage || isFetchingNextPage;
  return { morePages, scrollCount: haikuCount + (morePages ? 1 : 0) };
}

export function isQueueLoaderShown(morePages: boolean, haikuCount: number, focusIndex: number): boolean {
  return morePages && shouldFetchNextQueuePage(haikuCount, focusIndex);
}

function isFarChromePark(
  creationChromeOpen: boolean,
  focusIndex: number,
  isAnimating: boolean,
  scrollGate: number | null,
): boolean {
  return creationChromeOpen && focusIndex !== CREATION_FOCUS_INDEX && !isAnimating && scrollGate === null;
}

/**
 * Near: fly tracks list scroll-back tween. Far chrome: park on stop-20 in guideBox.
 * `creation` is null while no creation lantern should render.
 */
export function svgPathCreationFly(params: {
  creationLayer: CreationLayerState | null;
  parsed: ParsedSplitPathSvg | null;
  focusIndex: number;
  fromFocusIndex: number;
  tweenProgress: number;
  isAnimating: boolean;
  creationChromeOpen: boolean;
}) {
  const { creationLayer, parsed, focusIndex, fromFocusIndex, tweenProgress, isAnimating, creationChromeOpen } = params;
  const scrollGate = creationLayer
    ? creationFlyProgress(focusIndex, fromFocusIndex, tweenProgress, isAnimating)
    : null;
  const farPark =
    Boolean(creationLayer) && isFarChromePark(creationChromeOpen, focusIndex, isAnimating, scrollGate);
  const creationFlyT = farPark ? 1 : scrollGate;
  const creationTransform =
    parsed && creationFlyT !== null ? creationLanternTransformAtFlyT(parsed, creationFlyT) : null;

  return {
    creation: creationTransform && creationLayer ? { transform: creationTransform, layer: creationLayer } : null,
    /** Far path: hide the list lantern that would sit under the creation overlay at stop-20. */
    hideListFocusStop: creationFlyT !== null && creationTransform != null && farPark,
  };
}

export function isUnderCreationOverlay(hideListFocusStop: boolean, haikuIndex: number, focusIndex: number): boolean {
  return hideListFocusStop && stopForHaikuIndex(haikuIndex, focusIndex) === SVG_PATH_FOCUS_STOP;
}

export function svgPathLanternKey(loading: boolean, haiku: HaikuDto | undefined, haikuIndex: number): string {
  if (loading) return "pagination-loader";
  return haiku?.id ?? `svg-path-${haikuIndex}`;
}
