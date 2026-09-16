import { PATTERN_CENTER, PATTERN_ORIGIN, PATTERN_TRIANGLES } from "./creasePattern";
import {
  ROTATION_POINTS,
  resolveFoldProgress,
  resolveGlobalFoldProgress,
  stateToFullProgress,
} from "./origamiFoldSequence";
import {
  ORIGAMI_MESH,
  findVertexNear,
  solveOrigamiAtState,
  verifyEdgeConnectivity,
} from "./origamiFoldSolver";
import {
  findCenterHorizontalEdgeId,
  findCenterVerticalEdgeId,
  trianglesInQuadrant,
} from "./origamiMesh";

describe("origamiFoldSolver", () => {
  it("leaves all vertices at z=0 when flat", () => {
    const result = solveOrigamiAtState([]);
    for (const vertex of result.vertexPositions) {
      expect(vertex[2]).toBeCloseTo(0, 4);
    }
    expect(result.isFlat).toBe(true);
  });

  it("finds center crease edges in the mesh", () => {
    expect(findCenterVerticalEdgeId(ORIGAMI_MESH)).toBeTruthy();
    expect(findCenterHorizontalEdgeId(ORIGAMI_MESH)).toBeTruthy();
  });

  it("defines rotation points from flat through collapsed to birdPartial", () => {
    expect(ROTATION_POINTS).toHaveLength(4);
    expect(ROTATION_POINTS[0].folds).toHaveLength(0);
    expect(ROTATION_POINTS[2].folds.length).toBeGreaterThan(0);
    expect(ROTATION_POINTS[3].folds.length).toBeGreaterThan(ROTATION_POINTS[2].folds.length);
  });

  it("maintains vertex connectivity after collapsed pose", () => {
    const folds = resolveFoldProgress("collapsed", 1);
    const result = solveOrigamiAtState(folds);
    expect(verifyEdgeConnectivity(ORIGAMI_MESH, result.vertexPositions)).toBe(true);
  });

  it("maintains vertex connectivity after birdPartial pose", () => {
    const folds = resolveFoldProgress("birdPartial", 1);
    const result = solveOrigamiAtState(folds);
    expect(verifyEdgeConnectivity(ORIGAMI_MESH, result.vertexPositions)).toBe(true);
  });

  it("lifts corners and depresses edge midpoints in collapsed pose", () => {
    const folds = resolveFoldProgress("collapsed", 1);
    const result = solveOrigamiAtState(folds);

    const cornerId = findVertexNear(ORIGAMI_MESH, [PATTERN_ORIGIN.x, PATTERN_ORIGIN.y]);
    expect(cornerId).not.toBeNull();
    expect(result.vertexPositions[cornerId!][2]).toBeGreaterThan(1);

    const topMidId = findVertexNear(ORIGAMI_MESH, [PATTERN_CENTER[0], PATTERN_ORIGIN.y]);
    expect(topMidId).not.toBeNull();
    expect(result.vertexPositions[topMidId!][2]).toBeLessThan(-1);
  });

  it("interpolates between rotation points at segment midpoint", () => {
    const start = solveOrigamiAtState(resolveFoldProgress("collapsed", 0));
    const mid = solveOrigamiAtState(resolveGlobalFoldProgress(1 / 6));
    const end = solveOrigamiAtState(resolveFoldProgress("collapsed", 1));

    const midZ = mid.vertexPositions.reduce((sum, v) => sum + Math.abs(v[2]), 0);
    const startZ = start.vertexPositions.reduce((sum, v) => sum + Math.abs(v[2]), 0);
    const endZ = end.vertexPositions.reduce((sum, v) => sum + Math.abs(v[2]), 0);

    expect(midZ).toBeGreaterThan(startZ);
    expect(midZ).toBeLessThan(endZ);
  });

  it("applies different birdPartial boosts per quadrant", () => {
    const collapsed = resolveFoldProgress("collapsed", 1);
    const bird = resolveFoldProgress("birdPartial", 1);
    expect(bird.length).toBeGreaterThan(collapsed.length);

    const north = trianglesInQuadrant(ORIGAMI_MESH, "north");
    const east = trianglesInQuadrant(ORIGAMI_MESH, "east");
    const northFold = bird.find(
      (fold) =>
        fold.movingTriangleIds.some((id) => north.includes(id)) &&
        !collapsed.some(
          (base) =>
            base.edgeId === fold.edgeId &&
            base.movingTriangleIds.join() === fold.movingTriangleIds.join() &&
            base.angleDeg === fold.angleDeg,
        ),
    );
    const eastFold = bird.find(
      (fold) =>
        fold.movingTriangleIds.some((id) => east.includes(id)) &&
        !collapsed.some(
          (base) =>
            base.edgeId === fold.edgeId &&
            base.movingTriangleIds.join() === fold.movingTriangleIds.join() &&
            base.angleDeg === fold.angleDeg,
        ),
    );
    expect(northFold?.angleDeg).not.toBe(eastFold?.angleDeg);
  });

  it("produces clip paths for all panels", () => {
    const result = solveOrigamiAtState(resolveFoldProgress("collapsed", 1));
    expect(result.triangles).toHaveLength(PATTERN_TRIANGLES.length);
    for (const tri of result.triangles) {
      expect(tri.clipPath).toMatch(/^polygon\(/);
    }
  });

  it("maps named states to global progress anchors", () => {
    expect(stateToFullProgress("flat")).toBe(0);
    expect(stateToFullProgress("collapsed")).toBeCloseTo(2 / 3);
    expect(stateToFullProgress("birdPartial")).toBe(1);
  });
});
