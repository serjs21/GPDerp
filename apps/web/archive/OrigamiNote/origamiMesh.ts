import {
  PATTERN_CENTER,
  PATTERN_TRIANGLES,
  edgeIdFromPoints,
  type Pt,
  type TrianglePanel,
} from "./creasePattern";

const VERTEX_TOL = 1.5;

export type MeshTriangle = {
  id: number;
  v0: number;
  v1: number;
  v2: number;
};

export type MeshEdge = {
  edgeId: string;
  a: number;
  b: number;
  triangleIds: number[];
};

export type OrigamiMesh = {
  vertices: Pt[];
  triangles: MeshTriangle[];
  edges: MeshEdge[];
  edgeById: Map<string, MeshEdge>;
};

function pointsEqual(a: Pt, b: Pt): boolean {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < VERTEX_TOL;
}

function vertexIndex(vertices: Pt[], point: Pt): number {
  for (let i = 0; i < vertices.length; i++) {
    if (pointsEqual(vertices[i], point)) return i;
  }
  vertices.push(point);
  return vertices.length - 1;
}

function buildMeshFromPanels(panels: TrianglePanel[]): OrigamiMesh {
  const vertices: Pt[] = [];
  const triangles: MeshTriangle[] = [];
  const edgeMap = new Map<string, { a: number; b: number; triangleIds: number[] }>();

  for (const panel of panels) {
    const [p0, p1, p2] = panel.points;
    const v0 = vertexIndex(vertices, p0);
    const v1 = vertexIndex(vertices, p1);
    const v2 = vertexIndex(vertices, p2);
    triangles.push({ id: panel.id, v0, v1, v2 });

    const cornerIds = [v0, v1, v2];
    const cornerPts = [p0, p1, p2];
    for (let j = 0; j < 3; j++) {
      const a = cornerIds[j];
      const b = cornerIds[(j + 1) % 3];
      const edgeId = edgeIdFromPoints(cornerPts[j], cornerPts[(j + 1) % 3]);
      const existing = edgeMap.get(edgeId);
      if (existing) {
        if (!existing.triangleIds.includes(panel.id)) {
          existing.triangleIds.push(panel.id);
        }
      } else {
        edgeMap.set(edgeId, { a, b, triangleIds: [panel.id] });
      }
    }
  }

  const edges: MeshEdge[] = [];
  const edgeById = new Map<string, MeshEdge>();
  for (const [edgeId, data] of edgeMap) {
    const edge: MeshEdge = { edgeId, ...data };
    edges.push(edge);
    edgeById.set(edgeId, edge);
  }

  return { vertices, triangles, edges, edgeById };
}

export const ORIGAMI_MESH: OrigamiMesh = buildMeshFromPanels(PATTERN_TRIANGLES);

export function triangleVertexIds(mesh: OrigamiMesh, triangleId: number): [number, number, number] {
  const tri = mesh.triangles[triangleId];
  return [tri.v0, tri.v1, tri.v2];
}

export function triangleCentroid(mesh: OrigamiMesh, triangleId: number): Pt {
  const tri = mesh.triangles[triangleId];
  const p0 = mesh.vertices[tri.v0];
  const p1 = mesh.vertices[tri.v1];
  const p2 = mesh.vertices[tri.v2];
  return [
    (p0[0] + p1[0] + p2[0]) / 3,
    (p0[1] + p1[1] + p2[1]) / 3,
  ];
}

/** Signed distance of point from line through hinge (positive = left of directed edge). */
export function signedSideOfLine(point: Pt, lineA: Pt, lineB: Pt): number {
  return (lineB[0] - lineA[0]) * (point[1] - lineA[1]) - (lineB[1] - lineA[1]) * (point[0] - lineA[0]);
}

/** All triangle ids reachable from seed without crossing hinge edge. */
export function trianglesOnSideOfEdge(
  mesh: OrigamiMesh,
  edgeId: string,
  seedTriangleId: number,
): number[] {
  const edge = mesh.edgeById.get(edgeId);
  if (!edge) return [];

  const hingeA = mesh.vertices[edge.a];
  const hingeB = mesh.vertices[edge.b];
  const seedSide = Math.sign(signedSideOfLine(triangleCentroid(mesh, seedTriangleId), hingeA, hingeB));
  if (seedSide === 0) return [seedTriangleId];

  const visited = new Set<number>();
  const queue = [seedTriangleId];

  while (queue.length > 0) {
    const triId = queue.pop()!;
    if (visited.has(triId)) continue;
    visited.add(triId);

    const tri = mesh.triangles[triId];
    for (const neighborId of neighborsAcrossEdges(mesh, triId, [tri.v0, tri.v1, tri.v2])) {
      if (visited.has(neighborId)) continue;
      const neighborSide = Math.sign(
        signedSideOfLine(triangleCentroid(mesh, neighborId), hingeA, hingeB),
      );
      if (neighborSide === seedSide) {
        queue.push(neighborId);
      }
    }
  }

  return [...visited].sort((a, b) => a - b);
}

function neighborsAcrossEdges(
  mesh: OrigamiMesh,
  triangleId: number,
  vertexIds: [number, number, number],
): number[] {
  const neighbors: number[] = [];
  for (let i = 0; i < 3; i++) {
    const a = vertexIds[i];
    const b = vertexIds[(i + 1) % 3];
    const edgeId = edgeIdFromPoints(mesh.vertices[a], mesh.vertices[b]);
    const edge = mesh.edgeById.get(edgeId);
    if (!edge || edge.triangleIds.length !== 2) continue;
    const neighborId = edge.triangleIds[0] === triangleId ? edge.triangleIds[1] : edge.triangleIds[0];
    neighbors.push(neighborId);
  }
  return neighbors;
}

/** Find edge id for two pattern points (rounded to match crease graph). */
export function edgeIdForPoints(a: Pt, b: Pt): string {
  return edgeIdFromPoints(a, b);
}

/** Pick a seed triangle on the desired side of a crease line. */
export function seedTriangleOnSide(
  mesh: OrigamiMesh,
  edgeId: string,
  wantPositiveSide: boolean,
): number | null {
  const edge = mesh.edgeById.get(edgeId);
  if (!edge) return null;

  const hingeA = mesh.vertices[edge.a];
  const hingeB = mesh.vertices[edge.b];

  for (const tri of mesh.triangles) {
    if (edge.triangleIds.includes(tri.id)) continue;
    const side = Math.sign(signedSideOfLine(triangleCentroid(mesh, tri.id), hingeA, hingeB));
    if (wantPositiveSide ? side > 0 : side < 0) return tri.id;
  }

  for (const triId of edge.triangleIds) {
    const side = Math.sign(signedSideOfLine(triangleCentroid(mesh, triId), hingeA, hingeB));
    if (wantPositiveSide ? side > 0 : side < 0) return triId;
  }

  return edge.triangleIds[0] ?? null;
}

export function findCenterVerticalEdgeId(mesh: OrigamiMesh): string | null {
  const [cx, cy] = PATTERN_CENTER;
  return findEdgeNearLine(mesh, cx, cy - 600, cx, cy + 600);
}

export function findCenterHorizontalEdgeId(mesh: OrigamiMesh): string | null {
  const [cx, cy] = PATTERN_CENTER;
  return findEdgeNearLine(mesh, cx - 600, cy, cx + 600, cy);
}

function findEdgeNearLine(mesh: OrigamiMesh, x1: number, y1: number, x2: number, y2: number): string | null {
  let best: { edgeId: string; score: number } | null = null;

  for (const edge of mesh.edges) {
    const a = mesh.vertices[edge.a];
    const b = mesh.vertices[edge.b];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as Pt;
    const distToLine = Math.abs(signedSideOfLine(mid, [x1, y1], [x2, y2])) /
      Math.hypot(x2 - x1, y2 - y1);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const passesCenter =
      Math.hypot(mid[0] - PATTERN_CENTER[0], mid[1] - PATTERN_CENTER[1]) < PATTERN_CENTER[0] * 0.05 + 80;

    if (distToLine > 2 || len < 400) continue;
    const score = distToLine + (passesCenter ? 0 : 100);
    if (!best || score < best.score) {
      best = { edgeId: edge.edgeId, score };
    }
  }

  return best?.edgeId ?? null;
}

export function trianglesInQuadrant(
  mesh: OrigamiMesh,
  quadrant: "north" | "east" | "south" | "west",
): number[] {
  const [cx, cy] = PATTERN_CENTER;
  return mesh.triangles
    .filter(({ id }) => {
      const [fx, fy] = triangleCentroid(mesh, id);
      const angle = Math.atan2(fy - cy, fx - cx);
      if (quadrant === "east") return angle >= -Math.PI / 4 && angle < Math.PI / 4;
      if (quadrant === "south") return angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4;
      if (quadrant === "north") return angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4;
      return angle >= (3 * Math.PI) / 4 || angle < -Math.PI / 4;
    })
    .map(({ id }) => id);
}
