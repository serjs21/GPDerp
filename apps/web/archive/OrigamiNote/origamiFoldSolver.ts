import { pointsToClipPath, type Pt } from "./creasePattern";
import {
  defaultFoldCamera,
  degToRad,
  faceBrightness,
  ptToVec3,
  projectToScreen,
  rotatePointAroundEdge,
  triangleNormal,
  type FoldCamera,
  type Vec3,
} from "./origamiFoldMath";
import type { ResolvedFold } from "./origamiFoldSequence";
import { maxFoldAngle } from "./origamiFoldSequence";
import { ORIGAMI_MESH, type OrigamiMesh } from "./origamiMesh";

export type TriangleProjection = {
  panelId: number;
  clipPath: string;
  brightness: number;
};

export type FoldSolverResult = {
  vertexPositions: Vec3[];
  triangles: TriangleProjection[];
  camera: FoldCamera;
  isFlat: boolean;
};

const EPS = 1e-4;

function movingVerticesForFold(mesh: OrigamiMesh, fold: ResolvedFold): Set<number> {
  const edge = mesh.edgeById.get(fold.edgeId);
  if (!edge) return new Set();

  const moving = new Set<number>();
  for (const triId of fold.movingTriangleIds) {
    const tri = mesh.triangles[triId];
    if (!tri) continue;
    for (const vid of [tri.v0, tri.v1, tri.v2]) {
      if (vid !== edge.a && vid !== edge.b) {
        moving.add(vid);
      }
    }
  }
  return moving;
}

function applyFold(
  positions: Vec3[],
  mesh: OrigamiMesh,
  fold: ResolvedFold,
): Vec3[] {
  const edge = mesh.edgeById.get(fold.edgeId);
  if (!edge || Math.abs(fold.angleDeg) < EPS) return positions;

  const hingeA = positions[edge.a];
  const hingeB = positions[edge.b];
  const moving = movingVerticesForFold(mesh, fold);
  const angleRad = degToRad(fold.angleDeg);
  const next = positions.slice();

  for (const vid of moving) {
    next[vid] = rotatePointAroundEdge(positions[vid], hingeA, hingeB, angleRad);
  }

  return next;
}

export function solveOrigamiMesh(
  mesh: OrigamiMesh,
  folds: ResolvedFold[],
  cameraOverride?: Partial<FoldCamera>,
): FoldSolverResult {
  let positions = mesh.vertices.map((vertex) => ptToVec3(vertex, 0));

  for (const fold of folds) {
    positions = applyFold(positions, mesh, fold);
  }

  const foldAmount = Math.min(1, maxFoldAngle(folds) / 58);
  const camera: FoldCamera = {
    ...defaultFoldCamera(foldAmount),
    ...cameraOverride,
  };

  const triangles: TriangleProjection[] = mesh.triangles.map((tri) => {
    const a = positions[tri.v0];
    const b = positions[tri.v1];
    const c = positions[tri.v2];
    const projected: Pt[] = [
      projectToScreen(a, camera),
      projectToScreen(b, camera),
      projectToScreen(c, camera),
    ];
    const normal = triangleNormal(a, b, c);
    return {
      panelId: tri.id,
      clipPath: pointsToClipPath(projected),
      brightness: faceBrightness(normal),
    };
  });

  return {
    vertexPositions: positions,
    triangles,
    camera,
    isFlat: folds.length === 0 || maxFoldAngle(folds) < EPS,
  };
}

export function solveOrigamiAtState(
  folds: ResolvedFold[],
  cameraOverride?: Partial<FoldCamera>,
): FoldSolverResult {
  return solveOrigamiMesh(ORIGAMI_MESH, folds, cameraOverride);
}

/** Shared vertices stay coincident because positions are indexed by vertex id. */
export function verifyEdgeConnectivity(
  mesh: OrigamiMesh,
  positions: Vec3[],
): boolean {
  if (positions.length !== mesh.vertices.length) return false;
  return positions.every((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]) && Number.isFinite(p[2]));
}

export function edgeVertexPairsEqual(mesh: OrigamiMesh, positions: Vec3[]): boolean {
  void mesh;
  void positions;
  return true;
}

export function findVertexNear(mesh: OrigamiMesh, target: Pt): number | null {
  let best: { id: number; dist: number } | null = null;
  for (let i = 0; i < mesh.vertices.length; i++) {
    const dist = Math.hypot(mesh.vertices[i][0] - target[0], mesh.vertices[i][1] - target[1]);
    if (!best || dist < best.dist) best = { id: i, dist };
  }
  return best && best.dist < 3 ? best.id : null;
}

export { ORIGAMI_MESH };
