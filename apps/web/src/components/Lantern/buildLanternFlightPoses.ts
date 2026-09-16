import type { CSSProperties } from "react";
import {
  applyPoseJitter,
  sampleSteppedProgresses,
  STEPPED_TRANSITION,
  type TransitionPose,
} from "@/components/animations/SteppedTransition";
import {
  flightPoseAtCall,
  flightStepDelta,
  type FlightAccumulatedOffset,
  type LanternFlightStyleInput,
} from "./simulateFlight";

export type BuildLanternFlightPosesOptions = {
  seed?: number;
  poseCount?: number;
  irregularSpacing?: boolean;
};

/** Mulberry32 PRNG — stable sequence from integer seed. */
export function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seedFromHaikuId(haikuId: string): number {
  return hashStringSeed(haikuId) || 1;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Sample (x,y) along a polyline of cumulative offsets using progress 0..1. */
function samplePolyline(
  points: FlightAccumulatedOffset[],
  progress: number,
): FlightAccumulatedOffset {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1 || progress <= 0) return points[0]!;
  if (progress >= 1) return points[points.length - 1]!;

  const distances: number[] = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(
      points[i]!.x - points[i - 1]!.x,
      points[i]!.y - points[i - 1]!.y,
    );
    total += d;
    distances.push(total);
  }
  if (total <= 0) return points[points.length - 1]!;

  const target = progress * total;
  for (let i = 1; i < points.length; i++) {
    if (target <= distances[i]!) {
      const span = distances[i]! - distances[i - 1]!;
      const local = span <= 0 ? 1 : (target - distances[i - 1]!) / span;
      return {
        x: lerp(points[i - 1]!.x, points[i]!.x, local),
        y: lerp(points[i - 1]!.y, points[i]!.y, local),
      };
    }
  }
  return points[points.length - 1]!;
}

/**
 * Build discrete lantern delete-flight poses from the existing simulateFlight
 * offset trajectory (seeded). Sampling may lerp the polyline; live animation
 * must not tween between returned poses.
 */
export function buildLanternFlightPoses(
  flightInput: LanternFlightStyleInput,
  options: BuildLanternFlightPosesOptions = {},
): TransitionPose[] {
  const poseCount = options.poseCount ?? STEPPED_TRANSITION.poseCount;
  const seed = options.seed ?? 1;
  const irregular =
    options.irregularSpacing ?? STEPPED_TRANSITION.irregularSpacing;
  const progresses = sampleSteppedProgresses(poseCount, irregular);
  const random = createSeededRandom(seed);

  const anchors: FlightAccumulatedOffset[] = [{ x: 0, y: 0 }];
  let accumulated: FlightAccumulatedOffset = { x: 0, y: 0 };
  for (let callIndex = 1; callIndex < poseCount; callIndex++) {
    const delta = flightStepDelta({ random, callIndex });
    accumulated = {
      x: accumulated.x + delta.x,
      y: accumulated.y + delta.y,
    };
    anchors.push({ ...accumulated });
  }

  const baseRotate = flightInput.rotate ?? 0;
  const baseScale = flightInput.scale ?? 1;

  return progresses.map((progress, poseIndex) => {
    const point = samplePolyline(anchors, progress);
    const callIndex = Math.max(1, Math.round(progress * (poseCount - 1)) + 1);
    const { scale, opacity } = flightPoseAtCall(callIndex, poseCount);
    const pose: TransitionPose = {
      progress,
      x: point.x,
      y: point.y,
      rotation: baseRotate,
      scale: baseScale * scale,
      opacity,
    };
    return applyPoseJitter(pose, poseIndex, seed);
  });
}

/** Map a stepped pose to lantern flight CSS vars (no live tween). */
export function lanternPoseToFlightStyle(
  pose: TransitionPose,
  positionMode: LanternFlightStyleInput["positionMode"] = "percent",
  base: Pick<LanternFlightStyleInput, "x" | "y" | "rotate"> = {},
): CSSProperties {
  const opacity = pose.opacity ?? 1;
  const scale = pose.scale ?? 1;
  const rotate = pose.rotation;

  if (positionMode === "percent") {
    return {
      "--lantern-flight-x": `${pose.x}px`,
      "--lantern-flight-y": `${pose.y}px`,
      "--lantern-opacity": String(opacity),
      "--lantern-scale": String(scale),
      "--lantern-rotate": `${rotate}deg`,
    } as CSSProperties;
  }

  return {
    "--lantern-x": `${(base.x ?? 0) + pose.x}px`,
    "--lantern-y": `${(base.y ?? 0) + pose.y}px`,
    "--lantern-rotate": `${rotate}deg`,
    "--lantern-opacity": String(opacity),
    "--lantern-scale": String(scale),
  } as CSSProperties;
}
