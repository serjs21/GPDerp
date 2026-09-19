"use client";

import { SteppedTransition } from "@/components/animations/SteppedTransition";
import type { HaikuDto } from "@/api/haikus";
import {
  PATH_STOP_STEP_CROSSFADE_MS,
  PATH_STOP_STEP_HOLD_MS,
  pathStepPoseToTransform,
  type PathStepPose,
} from "./pathStopSteppedMotion";
import { SVGPathLantern } from "./SVGPathLantern";

export type SVGPathSteppedLanternProps = {
  haiku?: HaikuDto;
  loading?: boolean;
  poses: PathStepPose[];
  runKey: number;
  actionsAlwaysVisible?: boolean;
  excludeLabelIds?: string[];
  onDeleted?: (haiku: HaikuDto) => void;
  onDeleteFailed?: (haiku: HaikuDto) => void;
  onChanged?: () => void;
};

/** Focus-step motion: discrete path holds + rotation faces (SteppedStops story). */
export function SVGPathSteppedLantern({
  haiku,
  loading = false,
  poses,
  runKey,
  actionsAlwaysVisible = false,
  excludeLabelIds,
  onDeleted,
  onDeleteFailed,
  onChanged,
}: SVGPathSteppedLanternProps) {
  if (poses.length === 0) return null;

  if (poses.length === 1) {
    const pose = poses[0]!;
    return (
      <SVGPathLantern
        haiku={haiku}
        loading={loading}
        transform={pathStepPoseToTransform(pose, 1)}
        face={pose.face}
        suppressReveal
        actionsAlwaysVisible={actionsAlwaysVisible}
        excludeLabelIds={excludeLabelIds}
        onDeleted={onDeleted}
        onDeleteFailed={onDeleteFailed}
        onChanged={onChanged}
      />
    );
  }

  return (
    <SteppedTransition
      key={runKey}
      poses={poses}
      active
      holdMs={PATH_STOP_STEP_HOLD_MS}
      crossfadeMs={PATH_STOP_STEP_CROSSFADE_MS}
      renderPose={(pose, layerOpacity) => {
        const pathPose = pose as PathStepPose;
        return (
          <SVGPathLantern
            haiku={haiku}
            loading={loading}
            transform={pathStepPoseToTransform(pathPose, layerOpacity)}
            face={pathPose.face}
            isAnimating
            suppressReveal
            actionsAlwaysVisible={actionsAlwaysVisible}
            excludeLabelIds={excludeLabelIds}
            onDeleted={onDeleted}
            onDeleteFailed={onDeleteFailed}
            onChanged={onChanged}
          />
        );
      }}
    />
  );
}
