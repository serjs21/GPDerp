import {
  ORIGAMI_MESH,
  seedTriangleOnSide,
  trianglesOnSideOfEdge,
  type OrigamiMesh,
} from "./origamiMesh";
import {
  ROTATION_POINTS,
  type FoldInstruction,
  type ResolvedFold,
  type RotationPoint,
} from "./origamiFoldSequence";

/** Camera tuned for the three-quarter crane reference view. */
export const CRANE_CAMERA = {
  tiltDeg: 10,
  yawDeg: -25,
  rollDeg: 14,
  scale: 1,
} as const;

const CRANE_EXTRA_FOLDS: FoldInstruction[] = buildCraneExtraFolds(ORIGAMI_MESH);

function subgraphForSide(
  mesh: OrigamiMesh,
  edgeId: string,
  positiveSide: boolean,
): number[] {
  const seed = seedTriangleOnSide(mesh, edgeId, positiveSide);
  if (seed === null) return [];
  return trianglesOnSideOfEdge(mesh, edgeId, seed);
}

function buildCraneExtraFolds(mesh: OrigamiMesh): FoldInstruction[] {
  const folds: FoldInstruction[] = [
    {
      edgeId: "edge-1292,657-1440,288",
      movingTriangleIds: subgraphForSide(mesh, "edge-1292,657-1440,288", false),
      targetAngleDeg: -78,
    },
    {
      edgeId: "edge-800,1148-1152,1008",
      movingTriangleIds: subgraphForSide(mesh, "edge-800,1148-1152,1008", false),
      targetAngleDeg: 52,
    },
    {
      edgeId: "edge-1440,720-2016,1296",
      movingTriangleIds: subgraphForSide(mesh, "edge-1440,720-2016,1296", true),
      targetAngleDeg: 58,
    },
    {
      edgeId: "edge-2079,1444-2448,2304",
      movingTriangleIds: subgraphForSide(mesh, "edge-2079,1444-2448,2304", true),
      targetAngleDeg: 42,
    },
    {
      edgeId: "edge-1440,1872-432,2304",
      movingTriangleIds: subgraphForSide(mesh, "edge-1440,1872-432,2304", false),
      targetAngleDeg: -52,
    },
    {
      edgeId: "edge-1588,1935-1440,2304",
      movingTriangleIds: subgraphForSide(mesh, "edge-1588,1935-1440,2304", false),
      targetAngleDeg: -38,
    },
    {
      edgeId: "edge-432,288-648,504",
      movingTriangleIds: subgraphForSide(mesh, "edge-432,288-648,504", false),
      targetAngleDeg: -115,
    },
  ];

  return folds.filter((fold) => fold.movingTriangleIds.length > 0);
}

const collapsedBase = ROTATION_POINTS[2].folds.map((fold) => ({
  edgeId: fold.edgeId,
  movingTriangleIds: fold.movingTriangleIds,
  targetAngleDeg: fold.targetAngleDeg,
}));

const fullCraneFolds: FoldInstruction[] = [...collapsedBase, ...CRANE_EXTRA_FOLDS];

export const CRANE_ROTATION_POINTS: RotationPoint[] = [
  { id: "CRP0", state: "flat", folds: [] },
  { id: "CRP1", state: "collapsed", folds: collapsedBase },
  { id: "CRP2", state: "birdPartial", folds: fullCraneFolds },
];

function foldKey(fold: ResolvedFold): string {
  return `${fold.edgeId}:${fold.movingTriangleIds.join(",")}`;
}

function foldsAtPoint(point: RotationPoint): Map<string, ResolvedFold> {
  const map = new Map<string, ResolvedFold>();
  for (const fold of point.folds) {
    map.set(foldKey({
      edgeId: fold.edgeId,
      movingTriangleIds: fold.movingTriangleIds,
      angleDeg: fold.targetAngleDeg,
    }), {
      edgeId: fold.edgeId,
      movingTriangleIds: fold.movingTriangleIds,
      angleDeg: fold.targetAngleDeg,
    });
  }
  return map;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateFolds(from: RotationPoint, to: RotationPoint, t: number): ResolvedFold[] {
  const fromMap = foldsAtPoint(from);
  const toMap = foldsAtPoint(to);
  const keys = new Set([...fromMap.keys(), ...toMap.keys()]);
  const resolved: ResolvedFold[] = [];

  for (const key of keys) {
    const start = fromMap.get(key);
    const end = toMap.get(key);
    const angleDeg = lerp(start?.angleDeg ?? 0, end?.angleDeg ?? 0, t);
    if (Math.abs(angleDeg) <= 1e-6) continue;
    resolved.push({
      edgeId: end?.edgeId ?? start!.edgeId,
      movingTriangleIds: end?.movingTriangleIds ?? start!.movingTriangleIds,
      angleDeg,
    });
  }

  return resolved;
}

/** 0 = flat, 1 = full crane pose (collapsed base + neck/tail/belly/head folds). */
export function resolveCraneFoldProgress(progress: number): ResolvedFold[] {
  const p = Math.min(1, Math.max(0, progress));

  if (p <= 0.5) {
    return interpolateFolds(CRANE_ROTATION_POINTS[0], CRANE_ROTATION_POINTS[1], p / 0.5);
  }
  return interpolateFolds(CRANE_ROTATION_POINTS[1], CRANE_ROTATION_POINTS[2], (p - 0.5) / 0.5);
}

/** Hold the target crane pose (progress = 1). */
export function resolveCraneFolds(): ResolvedFold[] {
  return resolveCraneFoldProgress(1);
}

export { CRANE_EXTRA_FOLDS, fullCraneFolds };
