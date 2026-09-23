import {
  sampleSteppedProgresses,
  type TransitionPose,
} from "@/components/animations/SteppedTransition";
import {
  rotationFaceForPose,
  targetRotationForStop,
  type StopFace,
} from "@/components/SVGPath/pathStopRotation";
import {
  lanternTransformAtStops,
  type ParsedSplitPathSvg,
} from "@/components/SVGPath/utils";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";

/** Discrete holds from one path stop to the next (matches SteppedStops story). */
export const PATH_STOP_STEP_POSE_COUNT = 5;
/** Total stop→stop duration (hold budget across pose intervals). */
export const PATH_STOP_STEP_TOTAL_MS = 300;
const PATH_STOP_STEP_INTERVALS = PATH_STOP_STEP_POSE_COUNT - 1;
export const PATH_STOP_STEP_HOLD_MS = Math.round(
  PATH_STOP_STEP_TOTAL_MS / PATH_STOP_STEP_INTERVALS,
);
/** Hard cuts between poses — stop-motion, no opacity crossfade. */
export const PATH_STOP_STEP_CROSSFADE_MS = 0;

export type PathStepPose = TransitionPose & {
  stackOrder: number;
  pathStop: number;
  face: StopFace;
};

/** Discrete path poses between two authored stops (no live spatial tween). */
export function buildPathStopStepPoses(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
): PathStepPose[] {
  const progresses = sampleSteppedProgresses(PATH_STOP_STEP_POSE_COUNT, false);
  const startRotation = targetRotationForStop(parsed, fromStop);
  const endRotation = targetRotationForStop(parsed, toStop);
  const poses: PathStepPose[] = [];
  progresses.forEach((progress, poseIndex) => {
    const transform = lanternTransformAtStops(parsed, fromStop, toStop, progress);
    if (!transform) return;
    const pathStop = fromStop + (toStop - fromStop) * progress;
    poses.push({
      progress,
      x: transform.x,
      y: transform.y,
      rotation: transform.rotate,
      scale: transform.scale,
      opacity: transform.opacity ?? 1,
      stackOrder: transform.stackOrder ?? Math.round(pathStop * 10),
      pathStop,
      face: rotationFaceForPose(
        startRotation,
        endRotation,
        poseIndex,
        PATH_STOP_STEP_POSE_COUNT,
      ),
    });
  });
  return poses;
}

export function pathStepPoseToTransform(
  pose: PathStepPose,
  layerOpacity: number,
): LanternTransform {
  return {
    positionMode: "percent",
    x: pose.x,
    y: pose.y,
    scale: pose.scale ?? 1,
    rotate: pose.rotation,
    opacity: (pose.opacity ?? 1) * layerOpacity,
    stackOrder: pose.stackOrder,
  };
}
