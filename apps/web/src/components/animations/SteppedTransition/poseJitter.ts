import { STEPPED_TRANSITION } from "./steppedTransition.config";
import type { TransitionPose } from "./steppedTransitionTypes";

/** Deterministic 0..1 from integer seed (mulberry32-ish). */
export function seededUnit(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function signedUnit(seed: number): number {
  return seededUnit(seed) * 2 - 1;
}

export type PoseJitter = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

/** Once-per-pose jitter; stable for (poseIndex, seed). */
export function poseJitter(poseIndex: number, seed: number): PoseJitter {
  const base = seed * 1009 + poseIndex * 9176;
  return {
    x: signedUnit(base) * STEPPED_TRANSITION.positionJitterPx,
    y: signedUnit(base + 1) * STEPPED_TRANSITION.positionJitterPx,
    rotation: signedUnit(base + 2) * STEPPED_TRANSITION.rotationJitterDeg,
    scale: 1 + signedUnit(base + 3) * STEPPED_TRANSITION.scaleJitter,
  };
}

export function applyPoseJitter(pose: TransitionPose, poseIndex: number, seed: number): TransitionPose {
  const j = poseJitter(poseIndex, seed);
  return {
    ...pose,
    x: pose.x + j.x,
    y: pose.y + j.y,
    rotation: pose.rotation + j.rotation,
    scale: (pose.scale ?? 1) * j.scale,
  };
}
