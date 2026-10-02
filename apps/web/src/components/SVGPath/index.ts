export { SVGPath, type SVGPathHandle, type SVGPathProps } from "./SVGPath";
export { parseSplitPathSvg } from "./utils/parseSplitPathSvg";
export {
  stopForHaikuIndex,
  SVG_PATH_FOCUS_STOP,
} from "./utils/stops";
export {
  scaleAtStop,
  opacityAtStop,
  SVG_PATH_QUEUE_SCALE_RATIO,
  SVG_PATH_EXIT_SCALE,
  SVG_PATH_EXIT_OPACITY,
} from "./utils/lanternDisplay";
export { CREATION_ENTER_MS } from "./consts/creationPathLanternConsts";
export {
  SCROLL_TO_TOP_NEAR_THRESHOLD,
  SCROLL_TO_TOP_HANDOFF_INDEX,
  isScrollToTopNear,
} from "./scrollToTop.config";
