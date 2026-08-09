import type { HaikuDto } from "@/api/haikus";
import {
  LANTERN_EXIT_STOP_OPACITY,
  journeySForCarouselStep,
  lanternExitPathS,
  lanternInitialPathS,
  sampleLanternJourney,
  sampleLanternSegment0,
} from "../path";
import type { LanternTransform } from "../lanternTransform";
import { lerp } from "../lanternTransform";
import {
  LANTERN_PATH_EXIT_STOP,
  LANTERN_PATH_FOCUS_STOP,
  LANTERN_PATH_PUSH_OUT_X,
  LANTERN_PATH_PUSH_OUT_Y,
  LANTERN_PATH_VIRTUAL_STOP,
} from "./lanternPath.config";

export type PathStopPose = Pick<
  LanternTransform,
  "x" | "y" | "scale" | "opacity" | "rotate"
>;

function poseAtIntegerStop(pathStop: number): PathStopPose {
  if (pathStop <= LANTERN_PATH_VIRTUAL_STOP) {
    return {
      x: LANTERN_PATH_PUSH_OUT_X,
      y: LANTERN_PATH_PUSH_OUT_Y,
      scale: 1,
      opacity: 0,
      rotate: 0,
    };
  }

  if (pathStop === LANTERN_PATH_EXIT_STOP) {
    const sample = sampleLanternSegment0(lanternExitPathS(), LANTERN_EXIT_STOP_OPACITY);
    return {
      x: sample.x,
      y: sample.y,
      scale: sample.scale,
      opacity: LANTERN_EXIT_STOP_OPACITY,
      rotate: 0,
    };
  }

  if (pathStop === LANTERN_PATH_FOCUS_STOP) {
    const sample = sampleLanternJourney(journeySForCarouselStep(0));
    return {
      x: sample.x,
      y: sample.y,
      scale: sample.scale,
      opacity: 1,
      rotate: 0,
    };
  }

  if (pathStop > LANTERN_PATH_FOCUS_STOP) {
    const carouselIndex = pathStop - 1;
    const sample = sampleLanternJourney(journeySForCarouselStep(carouselIndex));
    return {
      x: sample.x,
      y: sample.y,
      scale: sample.scale,
      opacity: sample.scale > 0 ? 1 : 0,
      rotate: 0,
    };
  }

  const pathS = lerp(lanternExitPathS(), lanternInitialPathS(), pathStop);
  const sample = sampleLanternSegment0(pathS, 1);
  return {
    x: sample.x,
    y: sample.y,
    scale: sample.scale,
    opacity: 1,
    rotate: 0,
  };
}

function opacityBetweenStops(fromStop: number, toStop: number, t: number): number {
  const from = poseAtIntegerStop(fromStop);
  const to = poseAtIntegerStop(toStop);

  if (fromStop === LANTERN_PATH_EXIT_STOP && toStop === LANTERN_PATH_FOCUS_STOP) {
    return 1;
  }

  if (fromStop === LANTERN_PATH_VIRTUAL_STOP || toStop === LANTERN_PATH_VIRTUAL_STOP) {
    return lerp(from.opacity ?? 0, to.opacity ?? 0, t);
  }

  if (fromStop === LANTERN_PATH_EXIT_STOP || toStop === LANTERN_PATH_EXIT_STOP) {
    return lerp(from.opacity ?? 1, to.opacity ?? 1, t);
  }

  return lerp(from.opacity ?? 1, to.opacity ?? 1, t);
}

/** Resolve fractional path stop to a lantern transform (rotate fixed at 0). */
export function resolveLanternAtPathStop(pathStop: number): LanternTransform {
  const floorStop = Math.floor(pathStop);
  const ceilStop = Math.ceil(pathStop);
  const t = pathStop - floorStop;

  if (t <= 1e-6) {
    const pose = poseAtIntegerStop(floorStop);
    return { ...pose, positionMode: "percent", stackOrder: Math.round(pathStop * 10) };
  }

  const from = poseAtIntegerStop(floorStop);
  const to = poseAtIntegerStop(ceilStop);

  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    scale: lerp(from.scale, to.scale, t),
    opacity: opacityBetweenStops(floorStop, ceilStop, t),
    rotate: 0,
    positionMode: "percent",
    stackOrder: Math.round(pathStop * 10),
  };
}

export function pathStopForHaikuIndex(haikuIndex: number, focusIndex: number): number {
  return LANTERN_PATH_FOCUS_STOP + (haikuIndex - focusIndex);
}
