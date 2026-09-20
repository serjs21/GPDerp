import type { LanternRotatedVariantId } from "@/components/Lantern/consts/rotationBaseConsts";
import { SVG_PATH_FOCUS_STOP, type ParsedSplitPathSvg } from "@/components/SVGPath/utils";

export type StopFace =
  | { kind: "upright" }
  | { kind: "rotated"; variant: LanternRotatedVariantId; mirrored: boolean };

/**
 * Rotation chain (no skips between adjacent frames):
 * rotated-2-left ↔ rotated-1-left ↔ default ↔ rotated-1-right ↔ rotated-2-right
 */
export const ROTATION_CHAIN = [
  "rotated-2-left",
  "rotated-1-left",
  "default",
  "rotated-1-right",
  "rotated-2-right",
] as const;

export type RotationChainId = (typeof ROTATION_CHAIN)[number];

export function faceFromChainId(id: RotationChainId): StopFace {
  switch (id) {
    case "default":
      return { kind: "upright" };
    case "rotated-1-left":
      return { kind: "rotated", variant: "rotated", mirrored: true };
    case "rotated-1-right":
      return { kind: "rotated", variant: "rotated", mirrored: false };
    case "rotated-2-left":
      return { kind: "rotated", variant: "rotated2", mirrored: true };
    case "rotated-2-right":
      return { kind: "rotated", variant: "rotated2", mirrored: false };
  }
}

function chainIndex(id: RotationChainId): number {
  return ROTATION_CHAIN.indexOf(id);
}

/**
 * Path faces right when stop i.x >= stop (i-1).x — use unmirrored rotated bases.
 * Otherwise mirror so the painted face follows the path.
 */
export function pathStopFacesRight(parsed: ParsedSplitPathSvg, stopId: number): boolean {
  const curr = parsed.stopsById[stopId];
  if (!curr) return true;
  const prev = parsed.stopsById[stopId - 1];
  if (prev) return curr.cx >= prev.cx;
  const next = parsed.stopsById[stopId + 1];
  if (next) return curr.cx <= next.cx;
  return true;
}

/** Target rotation state for an authored path stop (idle + transition endpoints). */
export function targetRotationForStop(
  parsed: ParsedSplitPathSvg,
  stopId: number,
): RotationChainId {
  const dist = Math.abs(stopId - SVG_PATH_FOCUS_STOP);
  if (dist === 0) return "default";
  const right = pathStopFacesRight(parsed, stopId);
  if (dist === 1) return right ? "rotated-1-right" : "rotated-1-left";
  return right ? "rotated-2-right" : "rotated-2-left";
}

export function targetFaceForStop(parsed: ParsedSplitPathSvg, stopId: number): StopFace {
  return faceFromChainId(targetRotationForStop(parsed, stopId));
}

/**
 * Walk the rotation chain without skipping along continuous progress t ∈ [0, 1].
 * Adjacent samples differ by at most one chain step.
 */
export function rotationFaceAtProgress(
  startId: RotationChainId,
  endId: RotationChainId,
  t: number,
): StopFace {
  const start = chainIndex(startId);
  const end = chainIndex(endId);
  const delta = end - start;
  const sign = delta === 0 ? 0 : delta > 0 ? 1 : -1;
  const distance = Math.abs(delta);
  const progress = Math.min(1, Math.max(0, t));
  const steps = Math.min(distance, Math.round(progress * distance));
  const faceIdx = start + sign * steps;
  return faceFromChainId(ROTATION_CHAIN[faceIdx]!);
}

/**
 * Discrete-pose walk (SteppedTransition): pose i advances along the same chain
 * rule as {@link rotationFaceAtProgress} with t = poseIndex / (poseCount - 1).
 */
export function rotationFaceForPose(
  startId: RotationChainId,
  endId: RotationChainId,
  poseIndex: number,
  poseCount: number,
): StopFace {
  const span = Math.max(1, poseCount - 1);
  return rotationFaceAtProgress(startId, endId, poseIndex / span);
}
