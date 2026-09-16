import {
  ORIGAMI_MESH,
  findCenterHorizontalEdgeId,
  findCenterVerticalEdgeId,
  seedTriangleOnSide,
  trianglesInQuadrant,
  trianglesOnSideOfEdge,
  type OrigamiMesh,
} from "./origamiMesh";

export type OrigamiFoldState = "flat" | "collapsed" | "birdPartial";

export type FoldInstruction = {
  edgeId: string;
  movingTriangleIds: number[];
  targetAngleDeg: number;
};

export type RotationPoint = {
  id: string;
  state: OrigamiFoldState;
  folds: FoldInstruction[];
};

export type ResolvedFold = {
  edgeId: string;
  movingTriangleIds: number[];
  angleDeg: number;
};

const CARDINAL_ANGLE = 58;
const BIRD_PARTIAL_ANGLES = {
  north: 32,
  east: -48,
  south: -24,
  west: 40,
} as const;

function subgraphForSide(
  mesh: OrigamiMesh,
  edgeId: string | null,
  positiveSide: boolean,
): number[] {
  if (!edgeId) return [];
  const seed = seedTriangleOnSide(mesh, edgeId, positiveSide);
  if (seed === null) return [];
  return trianglesOnSideOfEdge(mesh, edgeId, seed);
}

function buildRotationPoints(mesh: OrigamiMesh): RotationPoint[] {
  const verticalEdge = findCenterVerticalEdgeId(mesh);
  const horizontalEdge = findCenterHorizontalEdgeId(mesh);

  const westIds = subgraphForSide(mesh, verticalEdge, false);
  const eastIds = subgraphForSide(mesh, verticalEdge, true);
  const northIds = subgraphForSide(mesh, horizontalEdge, false);
  const southIds = subgraphForSide(mesh, horizontalEdge, true);

  const verticalFolds: FoldInstruction[] = [
    {
      edgeId: verticalEdge ?? "",
      movingTriangleIds: westIds,
      targetAngleDeg: -CARDINAL_ANGLE,
    },
    {
      edgeId: verticalEdge ?? "",
      movingTriangleIds: eastIds,
      targetAngleDeg: CARDINAL_ANGLE,
    },
  ].filter((fold) => fold.edgeId && fold.movingTriangleIds.length > 0);

  const horizontalFolds: FoldInstruction[] = [
    {
      edgeId: horizontalEdge ?? "",
      movingTriangleIds: northIds,
      targetAngleDeg: CARDINAL_ANGLE,
    },
    {
      edgeId: horizontalEdge ?? "",
      movingTriangleIds: southIds,
      targetAngleDeg: -CARDINAL_ANGLE,
    },
  ].filter((fold) => fold.edgeId && fold.movingTriangleIds.length > 0);

  const collapsedFolds = [...verticalFolds, ...horizontalFolds];

  const birdFolds: FoldInstruction[] = [
    {
      edgeId: horizontalEdge ?? "",
      movingTriangleIds: trianglesInQuadrant(mesh, "north"),
      targetAngleDeg: BIRD_PARTIAL_ANGLES.north,
    },
    {
      edgeId: horizontalEdge ?? "",
      movingTriangleIds: trianglesInQuadrant(mesh, "south"),
      targetAngleDeg: BIRD_PARTIAL_ANGLES.south,
    },
    {
      edgeId: verticalEdge ?? "",
      movingTriangleIds: trianglesInQuadrant(mesh, "east"),
      targetAngleDeg: BIRD_PARTIAL_ANGLES.east,
    },
    {
      edgeId: verticalEdge ?? "",
      movingTriangleIds: trianglesInQuadrant(mesh, "west"),
      targetAngleDeg: BIRD_PARTIAL_ANGLES.west,
    },
  ].filter((fold) => fold.edgeId && fold.movingTriangleIds.length > 0);

  return [
    { id: "RP0", state: "flat", folds: [] },
    { id: "RP1", state: "flat", folds: verticalFolds },
    { id: "RP2", state: "collapsed", folds: collapsedFolds },
    { id: "RP3", state: "birdPartial", folds: [...collapsedFolds, ...birdFolds] },
  ];
}

export const ROTATION_POINTS: RotationPoint[] = buildRotationPoints(ORIGAMI_MESH);

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function foldsAtPoint(point: RotationPoint): Map<string, ResolvedFold> {
  const map = new Map<string, ResolvedFold>();
  for (const fold of point.folds) {
    const key = foldKey({
      edgeId: fold.edgeId,
      movingTriangleIds: fold.movingTriangleIds,
      angleDeg: fold.targetAngleDeg,
    });
    map.set(key, {
      edgeId: fold.edgeId,
      movingTriangleIds: fold.movingTriangleIds,
      angleDeg: fold.targetAngleDeg,
    });
  }
  return map;
}

function foldKey(fold: ResolvedFold): string {
  return `${fold.edgeId}:${fold.movingTriangleIds.join(",")}`;
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

/** Map named state + segment progress (0–1) to rotation point pair. */
export function stateSegmentToRotationRange(
  state: OrigamiFoldState,
  segmentProgress: number,
): { from: RotationPoint; to: RotationPoint; t: number } {
  const progress = Math.min(1, Math.max(0, segmentProgress));

  if (state === "flat") {
    return { from: ROTATION_POINTS[0], to: ROTATION_POINTS[0], t: 0 };
  }

  if (state === "collapsed") {
    if (progress <= 0.5) {
      return {
        from: ROTATION_POINTS[0],
        to: ROTATION_POINTS[1],
        t: progress / 0.5,
      };
    }
    return {
      from: ROTATION_POINTS[1],
      to: ROTATION_POINTS[2],
      t: (progress - 0.5) / 0.5,
    };
  }

  const from = ROTATION_POINTS[2];
  const to = ROTATION_POINTS[3];
  return { from, to, t: progress };
}

/** Global fold progress 0–1 across flat → collapsed → birdPartial. */
export function globalFoldProgressToRotationRange(globalProgress: number): {
  from: RotationPoint;
  to: RotationPoint;
  t: number;
} {
  const p = Math.min(1, Math.max(0, globalProgress));
  if (p <= 1 / 3) {
    return {
      from: ROTATION_POINTS[0],
      to: ROTATION_POINTS[1],
      t: p / (1 / 3),
    };
  }
  if (p <= 2 / 3) {
    return {
      from: ROTATION_POINTS[1],
      to: ROTATION_POINTS[2],
      t: (p - 1 / 3) / (1 / 3),
    };
  }
  return {
    from: ROTATION_POINTS[2],
    to: ROTATION_POINTS[3],
    t: (p - 2 / 3) / (1 / 3),
  };
}

export function resolveFoldProgress(
  state: OrigamiFoldState,
  segmentProgress: number,
): ResolvedFold[] {
  const { from, to, t } = stateSegmentToRotationRange(state, segmentProgress);
  if (from.id === to.id) return foldsAtPoint(from) ? [...foldsAtPoint(from).values()] : [];
  return interpolateFolds(from, to, t);
}

export function resolveGlobalFoldProgress(globalProgress: number): ResolvedFold[] {
  const { from, to, t } = globalFoldProgressToRotationRange(globalProgress);
  if (from.id === to.id) return [...foldsAtPoint(from).values()];
  return interpolateFolds(from, to, t);
}

export function maxFoldAngle(resolved: ResolvedFold[]): number {
  return resolved.reduce((max, fold) => Math.max(max, Math.abs(fold.angleDeg)), 0);
}

export function stateToFullProgress(state: OrigamiFoldState): number {
  if (state === "flat") return 0;
  if (state === "collapsed") return 2 / 3;
  return 1;
}
