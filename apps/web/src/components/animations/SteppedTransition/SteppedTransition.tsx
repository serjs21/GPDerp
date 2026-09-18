"use client";

import { Fragment, type ReactNode } from "react";
import { STEPPED_TRANSITION } from "./steppedTransition.config";
import type {
  SteppedFadeMode,
  SteppedPoseRole,
  TransitionPose,
} from "./steppedTransitionTypes";
import { useSteppedTransition } from "./useSteppedTransition";

export type SteppedTransitionProps = {
  poses: TransitionPose[];
  active?: boolean;
  holdMs?: number;
  crossfadeMs?: number;
  fadeMode?: SteppedFadeMode;
  reducedMotion?: boolean;
  onComplete?: () => void;
  onPoseHold?: (poseIndex: number) => void;
  renderPose: (
    pose: TransitionPose,
    opacity: number,
    role: SteppedPoseRole,
  ) => ReactNode;
};

/**
 * Pose-to-pose transition: hold discrete poses and crossfade opacity only.
 * Does not spatially tween between poses. Renders a fragment so consumers can
 * keep absolute path positioning on each pose node.
 */
export function SteppedTransition({
  poses,
  active = true,
  holdMs = STEPPED_TRANSITION.holdMs,
  crossfadeMs = STEPPED_TRANSITION.crossfadeMs,
  fadeMode = "crossfade",
  reducedMotion = false,
  onComplete,
  onPoseHold,
  renderPose,
}: SteppedTransitionProps) {
  const { layers } = useSteppedTransition({
    poses,
    active,
    holdMs,
    crossfadeMs,
    fadeMode,
    reducedMotion,
    onComplete,
    onPoseHold,
  });

  if (!active || layers.length === 0) return null;

  return (
    <>
      {layers.map((layer) => (
        <Fragment key={layer.key}>
          {renderPose(layer.pose, layer.opacity, layer.role)}
        </Fragment>
      ))}
    </>
  );
}
