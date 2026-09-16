import { PATTERN_ORIGIN } from "./creasePattern";
import { CRANE_EXTRA_FOLDS, CRANE_CAMERA, resolveCraneFolds, resolveCraneFoldProgress } from "./origamiCraneSequence";
import { findVertexNear, solveOrigamiAtState, ORIGAMI_MESH } from "./origamiFoldSolver";

describe("origamiCraneSequence", () => {
  it("defines crane-specific extra folds on interior creases", () => {
    expect(CRANE_EXTRA_FOLDS.length).toBeGreaterThanOrEqual(5);
    for (const fold of CRANE_EXTRA_FOLDS) {
      expect(ORIGAMI_MESH.edgeById.has(fold.edgeId)).toBe(true);
      expect(fold.movingTriangleIds.length).toBeGreaterThan(0);
    }
  });

  it("resolves full crane pose from flat transforms", () => {
    const folds = resolveCraneFolds();
    expect(folds.length).toBeGreaterThan(4);
    const result = solveOrigamiAtState(folds, CRANE_CAMERA);

    const nwId = findVertexNear(ORIGAMI_MESH, [PATTERN_ORIGIN.x, PATTERN_ORIGIN.y]);
    const neId = findVertexNear(ORIGAMI_MESH, [PATTERN_ORIGIN.x + 2016, PATTERN_ORIGIN.y]);
    expect(nwId).not.toBeNull();
    expect(neId).not.toBeNull();
    expect(result.vertexPositions[nwId!][2]).toBeGreaterThan(result.vertexPositions[neId!][2] * 0.5);
  });

  it("interpolates from flat at progress zero", () => {
    expect(resolveCraneFoldProgress(0)).toHaveLength(0);
  });

  it("reaches crane folds at progress one", () => {
    expect(resolveCraneFoldProgress(1).length).toBe(resolveCraneFolds().length);
  });
});
