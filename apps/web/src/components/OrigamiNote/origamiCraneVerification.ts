import { PATTERN_CENTER, PATTERN_ORIGIN, PATTERN_SIZE, type Pt } from "./creasePattern";
import { projectToNormalized, type FoldCamera, type Vec3 } from "./origamiFoldMath";
import { CRANE_CAMERA, resolveCraneFoldProgress, resolveCraneFolds } from "./origamiCraneSequence";
import { findVertexNear, solveOrigamiAtState, type FoldSolverResult } from "./origamiFoldSolver";
import { ORIGAMI_MESH } from "./origamiMesh";

export type CraneLandmarkId = "head" | "tail" | "belly" | "body";

export type CraneLandmark = {
  id: CraneLandmarkId;
  normalized: Pt;
};

/** Golden screen landmarks from the crane reference (normalized 0–1). */
export const CRANE_REFERENCE_LANDMARKS: Record<CraneLandmarkId, Pt> = {
  head: [0.098, 0.203],
  tail: [0.864, -0.028],
  belly: [0.381, 0.863],
  body: [0.476, 0.585],
};

export const CRANE_LANDMARK_TOLERANCE = 0.065;

const LANDMARK_VERTICES: Record<CraneLandmarkId, Pt> = {
  head: [PATTERN_ORIGIN.x, PATTERN_ORIGIN.y],
  tail: [PATTERN_ORIGIN.x + PATTERN_SIZE, PATTERN_ORIGIN.y],
  belly: [PATTERN_ORIGIN.x, PATTERN_ORIGIN.y + PATTERN_SIZE],
  body: PATTERN_CENTER,
};

export type CranePoseVerification = {
  ok: boolean;
  landmarks: Record<CraneLandmarkId, Pt>;
  landmarkErrors: Record<CraneLandmarkId, number>;
  orientationOk: boolean;
  maxLandmarkError: number;
};

function landmarkFromVertex(
  vertexPositions: Vec3[],
  patternPoint: Pt,
  camera: FoldCamera,
): Pt | null {
  const vertexId = findVertexNear(ORIGAMI_MESH, patternPoint);
  if (vertexId === null) return null;
  return projectToNormalized(vertexPositions[vertexId], camera);
}

export function computeCraneLandmarks(
  result: FoldSolverResult,
  camera: FoldCamera = CRANE_CAMERA,
): Record<CraneLandmarkId, Pt> | null {
  const landmarks = {} as Record<CraneLandmarkId, Pt>;
  for (const id of Object.keys(LANDMARK_VERTICES) as CraneLandmarkId[]) {
    const point = landmarkFromVertex(result.vertexPositions, LANDMARK_VERTICES[id], camera);
    if (!point) return null;
    landmarks[id] = point;
  }
  return landmarks;
}

export function verifyCraneOrientation(landmarks: Record<CraneLandmarkId, Pt>): boolean {
  const { head, tail, belly, body } = landmarks;
  return (
    head[0] < body[0] &&
    body[0] < tail[0] &&
    head[1] < body[1] &&
    tail[1] < body[1] &&
    belly[1] > body[1]
  );
}

export function verifyCraneReferencePose(
  progress = 1,
  camera: FoldCamera = CRANE_CAMERA,
): CranePoseVerification {
  const folds = progress >= 1 ? resolveCraneFolds() : resolveCraneFoldProgress(progress);
  const result = solveOrigamiAtState(folds, camera);
  const landmarks = computeCraneLandmarks(result, camera);

  if (!landmarks) {
    return {
      ok: false,
      landmarks: CRANE_REFERENCE_LANDMARKS,
      landmarkErrors: { head: Infinity, tail: Infinity, belly: Infinity, body: Infinity },
      orientationOk: false,
      maxLandmarkError: Infinity,
    };
  }

  const landmarkErrors = {} as Record<CraneLandmarkId, number>;
  let maxLandmarkError = 0;

  for (const id of Object.keys(CRANE_REFERENCE_LANDMARKS) as CraneLandmarkId[]) {
    const [ax, ay] = landmarks[id];
    const [bx, by] = CRANE_REFERENCE_LANDMARKS[id];
    const error = Math.hypot(ax - bx, ay - by);
    landmarkErrors[id] = error;
    maxLandmarkError = Math.max(maxLandmarkError, error);
  }

  const orientationOk = verifyCraneOrientation(landmarks);
  const landmarksOk = maxLandmarkError <= CRANE_LANDMARK_TOLERANCE;
  const ok = landmarksOk && orientationOk;

  return {
    ok,
    landmarks,
    landmarkErrors,
    orientationOk,
    maxLandmarkError,
  };
}

/** Serialize landmarks for Storybook / Playwright data attributes. */
export function craneLandmarksToDataAttributes(
  verification: CranePoseVerification,
): Record<string, string> {
  return {
    "data-crane-verified": verification.ok ? "true" : "false",
    "data-crane-max-error": verification.maxLandmarkError.toFixed(4),
    "data-crane-head": verification.landmarks.head.map((v) => v.toFixed(4)).join(","),
    "data-crane-tail": verification.landmarks.tail.map((v) => v.toFixed(4)).join(","),
    "data-crane-belly": verification.landmarks.belly.map((v) => v.toFixed(4)).join(","),
    "data-crane-body": verification.landmarks.body.map((v) => v.toFixed(4)).join(","),
  };
}
