import { CRANE_CAMERA } from "./origamiCraneSequence";
import {
  CRANE_LANDMARK_TOLERANCE,
  CRANE_REFERENCE_LANDMARKS,
  computeCraneLandmarks,
  verifyCraneOrientation,
  verifyCraneReferencePose,
} from "./origamiCraneVerification";
import { resolveCraneFolds } from "./origamiCraneSequence";
import { solveOrigamiAtState } from "./origamiFoldSolver";

describe("origamiCraneVerification", () => {
  it("matches reference landmarks within tolerance at full crane pose", () => {
    const verification = verifyCraneReferencePose(1, CRANE_CAMERA);
    expect(verification.orientationOk).toBe(true);
    expect(verification.maxLandmarkError).toBeLessThanOrEqual(CRANE_LANDMARK_TOLERANCE);
    expect(verification.ok).toBe(true);
  });

  it("places head left, tail upper-right, belly lower than body", () => {
    const { landmarks } = verifyCraneReferencePose(1, CRANE_CAMERA);
    expect(landmarks.head[0]).toBeLessThan(landmarks.body[0]);
    expect(landmarks.tail[0]).toBeGreaterThan(landmarks.body[0]);
    expect(landmarks.head[1]).toBeLessThan(landmarks.body[1]);
    expect(landmarks.tail[1]).toBeLessThan(landmarks.body[1]);
    expect(landmarks.belly[1]).toBeGreaterThan(landmarks.body[1]);
  });

  it("uses roll rotation in crane camera", () => {
    expect(CRANE_CAMERA.rollDeg).toBe(14);
  });

  it("reports per-landmark errors against golden reference", () => {
    const verification = verifyCraneReferencePose(1, CRANE_CAMERA);
    for (const id of Object.keys(CRANE_REFERENCE_LANDMARKS) as Array<
      keyof typeof CRANE_REFERENCE_LANDMARKS
    >) {
      expect(verification.landmarkErrors[id]).toBeLessThanOrEqual(CRANE_LANDMARK_TOLERANCE);
    }
  });

  it("fails orientation check when landmarks are mirrored", () => {
    const mirrored = {
      head: [0.9, 0.2] as const,
      tail: [0.1, 0.1] as const,
      belly: [0.4, 0.9] as const,
      body: [0.5, 0.5] as const,
    };
    expect(verifyCraneOrientation(mirrored)).toBe(false);
  });

  it("computes landmarks from solver output", () => {
    const result = solveOrigamiAtState(resolveCraneFolds(), CRANE_CAMERA);
    const landmarks = computeCraneLandmarks(result, CRANE_CAMERA);
    expect(landmarks).not.toBeNull();
    expect(landmarks!.head).toHaveLength(2);
  });
});
