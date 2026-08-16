export { lerp } from "./math";
export {
  parseSplitPathSvg,
  splitPathSvgInnerMarkup,
  padStopId,
  SPLIT_PATH_STOP_COUNT,
  SPLIT_PATH_SEGMENT_COUNT,
  SPLIT_PATH_MIN_STOP,
  SPLIT_PATH_MAX_STOP,
  type ParsedSplitPathSvg,
  type SplitPathSegment,
  type SplitPathStop,
} from "./parseSplitPathSvg";
export {
  sampleSegment,
  pointBetweenStops,
  type SvgPathPoint,
} from "./pathGeometry";
export {
  SVG_PATH_FOCUS_STOP,
  SVG_PATH_EXIT_STOP,
  SVG_PATH_GONE_STOP,
  isStopOnPath,
  stopForHaikuIndex,
  canStepBack,
  canStepForward,
  clampFocusIndex,
} from "./stops";
export {
  SVG_PATH_QUEUE_SCALE_RATIO,
  SVG_PATH_EXIT_SCALE,
  SVG_PATH_GONE_SCALE,
  SVG_PATH_EXIT_OPACITY,
  SVG_PATH_GONE_OPACITY,
  scaleAtStop,
  opacityAtStop,
  poseAtStop,
  lerpPose,
  lanternTransformAtStops,
  type SvgPathPose,
} from "./lanternDisplay";
