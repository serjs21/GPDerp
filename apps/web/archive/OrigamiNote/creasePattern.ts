/** Crease segments in source SVG coordinates (square at 432,288 size 2016). */
export const CREASE_SEGMENTS: readonly [number, number, number, number][] = [
  [864, 1296, 2016, 1296],
  [1440, 720, 1440, 1872],
  [432, 288, 1440, 720],
  [2448, 288, 1440, 720],
  [2448, 288, 2016, 1296],
  [2448, 2304, 2016, 1296],
  [2448, 2304, 1440, 1872],
  [432, 2304, 1440, 1872],
  [432, 2304, 864, 1296],
  [432, 288, 864, 1296],
  [1440, 720, 2016, 1296],
  [864, 1296, 1440, 1872],
  [800.78, 1148.488, 1152, 1008],
  [1292.488, 656.781, 1152, 1008],
  [1587.512, 1935.22, 1728, 1584],
  [2079.22, 1443.513, 1728, 1584],
  [1292.488, 656.781, 1440, 288],
  [800.78, 1148.488, 432, 1296],
  [2079.22, 1443.513, 2448, 1296],
  [1587.512, 1935.22, 1440, 2304],
  [1152, 1008, 1728, 1584],
  [1728, 1584, 2448, 2304],
  [1152, 1008, 648, 504],
  [432, 597.595, 524.571, 504],
  [524.571, 504, 648, 504],
  [741.595, 288, 648, 380.571],
  [648, 380.571, 648, 504],
  [432, 288, 648, 504],
];

export const PATTERN_ORIGIN = { x: 432, y: 288 } as const;
export const PATTERN_SIZE = 2016;

const VERTEX_TOL = 1.5;
const MAX_INTERIOR_FACE_AREA_RATIO = 0.5;

export type Pt = [number, number];
type Seg = [number, number, number, number];

type FaceLoop = {
  points: Pt[];
};

export type TriangleEdge = {
  edgeId: string;
  a: Pt;
  b: Pt;
  neighborId: number | null;
};

export type TrianglePanel = {
  id: number;
  points: Pt[];
  clipPath: string;
  edges: TriangleEdge[];
};

export const PATTERN_CENTER: Pt = [
  PATTERN_ORIGIN.x + PATTERN_SIZE / 2,
  PATTERN_ORIGIN.y + PATTERN_SIZE / 2,
];

export function edgeIdFromPoints(a: Pt, b: Pt): string {
  const key = (p: Pt) => `${Math.round(p[0])},${Math.round(p[1])}`;
  const [k0, k1] = [key(a), key(b)].sort();
  return `edge-${k0}-${k1}`;
}

export function normalizePoint(point: Pt): { xPct: number; yPct: number } {
  return {
    xPct: ((point[0] - PATTERN_ORIGIN.x) / PATTERN_SIZE) * 100,
    yPct: ((point[1] - PATTERN_ORIGIN.y) / PATTERN_SIZE) * 100,
  };
}

export function pointsToClipPath(points: Pt[]): string {
  const coords = points
    .map((point) => {
      const { xPct, yPct } = normalizePoint(point);
      return `${xPct.toFixed(4)}% ${yPct.toFixed(4)}%`;
    })
    .join(", ");
  return `polygon(${coords})`;
}

function pointsEqual(a: Pt, b: Pt): boolean {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < VERTEX_TOL;
}

function segmentIntersection(a: Seg, b: Seg): Pt | null {
  const [x1, y1, x2, y2] = a;
  const [x3, y3, x4, y4] = b;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-9) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
  if (t < -1e-6 || t > 1 + 1e-6 || u < -1e-6 || u > 1 + 1e-6) return null;

  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

function borderSegments(): Seg[] {
  const { x: ox, y: oy } = PATTERN_ORIGIN;
  const s = PATTERN_SIZE;
  return [
    [ox, oy, ox + s, oy],
    [ox + s, oy, ox + s, oy + s],
    [ox + s, oy + s, ox, oy + s],
    [ox, oy + s, ox, oy],
  ];
}

function buildPlanarGraph(): { vertices: Pt[]; edges: [number, number][] } {
  const rawSegments: Seg[] = [...CREASE_SEGMENTS, ...borderSegments()];
  const breakpoints: Pt[][] = rawSegments.map(([x1, y1, x2, y2]) => [
    [x1, y1],
    [x2, y2],
  ]);

  for (let i = 0; i < rawSegments.length; i++) {
    for (let j = i + 1; j < rawSegments.length; j++) {
      const hit = segmentIntersection(rawSegments[i], rawSegments[j]);
      if (!hit) continue;
      breakpoints[i].push(hit);
      breakpoints[j].push(hit);
    }
  }

  const vertices: Pt[] = [];
  const vertexId = (point: Pt): number => {
    for (let i = 0; i < vertices.length; i++) {
      if (pointsEqual(vertices[i], point)) return i;
    }
    vertices.push(point);
    return vertices.length - 1;
  };

  const edges: [number, number][] = [];
  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (edges.some(([e0, e1]) => e0 === lo && e1 === hi)) return;
    edges.push([lo, hi]);
  };

  for (let segIndex = 0; segIndex < rawSegments.length; segIndex++) {
    const [x1, y1] = rawSegments[segIndex];
    const segStart: Pt = [x1, y1];
    const chain = breakpoints[segIndex]
      .map((point) => vertexId(point))
      .filter((id, index, ids) => ids.indexOf(id) === index)
      .sort(
        (a, b) =>
          Math.hypot(vertices[a][0] - segStart[0], vertices[a][1] - segStart[1]) -
          Math.hypot(vertices[b][0] - segStart[0], vertices[b][1] - segStart[1]),
      );

    for (let i = 0; i < chain.length - 1; i++) {
      addEdge(chain[i], chain[i + 1]);
    }
  }

  return { vertices, edges };
}

function traceFaceLoop(
  start: number,
  firstTo: number,
  nextHalf: (from: number, to: number) => { from: number; to: number },
  used: Set<string>,
): number[] | null {
  const faceIdx = [start];
  let a = start;
  let b = firstTo;
  used.add(`${a}->${b}`);
  let guard = 0;
  while (b !== start && guard++ < 64) {
    faceIdx.push(b);
    const nh = nextHalf(a, b);
    a = nh.from;
    b = nh.to;
    const key = `${a}->${b}`;
    if (used.has(key)) return null;
    used.add(key);
  }
  if (faceIdx.length < 3 || b !== start) return null;
  return faceIdx;
}

function isInteriorFace(
  pts: Pt[],
  ox: number,
  oy: number,
  s: number,
  maxFaceArea: number,
): boolean {
  const cx = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
  const cy = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
  if (cx < ox || cx > ox + s || cy < oy || cy > oy + s) return false;

  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  const absArea = Math.abs(area) / 2;
  return absArea > 1 && absArea < maxFaceArea;
}

function walkFaceLoops(vertices: Pt[], edges: [number, number][]): FaceLoop[] {
  const n = vertices.length;
  const adj: { to: number }[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push({ to: b });
    adj[b].push({ to: a });
  }

  for (let i = 0; i < n; i++) {
    const [x, y] = vertices[i];
    adj[i].sort((A, B) => {
      const angA = Math.atan2(vertices[A.to][1] - y, vertices[A.to][0] - x);
      const angB = Math.atan2(vertices[B.to][1] - y, vertices[B.to][0] - x);
      return angA - angB;
    });
  }

  const nextHalf = (from: number, to: number) => {
    const nbrs = adj[to];
    const idx = nbrs.findIndex((h) => h.to === from);
    const next = (idx + 1) % nbrs.length;
    return { from: to, to: nbrs[next].to };
  };

  const used = new Set<string>();
  const faces: FaceLoop[] = [];
  const { x: ox, y: oy } = PATTERN_ORIGIN;
  const s = PATTERN_SIZE;
  const maxFaceArea = s * s * MAX_INTERIOR_FACE_AREA_RATIO;

  for (let start = 0; start < n; start++) {
    for (const h of adj[start]) {
      if (used.has(`${start}->${h.to}`)) continue;
      const faceIdx = traceFaceLoop(start, h.to, nextHalf, used);
      if (!faceIdx) continue;
      const pts = faceIdx.map((i) => vertices[i]);
      if (isInteriorFace(pts, ox, oy, s, maxFaceArea)) {
        faces.push({ points: pts });
      }
    }
  }

  return dedupeFaceLoops(faces);
}

function dedupeFaceLoops(faces: FaceLoop[]): FaceLoop[] {
  const seen = new Set<string>();
  return faces.filter(({ points: pts }) => {
    const key = pts
      .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
      .sort()
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function triangleKey(points: Pt[]): string {
  return points
    .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
    .sort()
    .join("|");
}

export function triangleArea(points: Pt[]): number {
  const [x1, y1] = points[0];
  const [x2, y2] = points[1];
  const [x3, y3] = points[2];
  return Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2;
}

function fanTriangulate(polygon: Pt[]): { triangles: Pt[][]; diagonals: Seg[] } {
  if (polygon.length <= 3) {
    return { triangles: [polygon], diagonals: [] };
  }

  const triangles: Pt[][] = [];
  const diagonals: Seg[] = [];
  const [v0] = polygon;

  for (let i = 1; i < polygon.length - 1; i++) {
    triangles.push([v0, polygon[i], polygon[i + 1]]);
    if (i + 1 < polygon.length - 1) {
      const vk = polygon[i + 1];
      diagonals.push([v0[0], v0[1], vk[0], vk[1]]);
    }
  }

  return { triangles, diagonals };
}

function segKey(seg: Seg): string {
  const a = `${Math.round(seg[0])},${Math.round(seg[1])}`;
  const b = `${Math.round(seg[2])},${Math.round(seg[3])}`;
  return [a, b].sort().join("-");
}

function dedupeSegments(segments: Seg[]): Seg[] {
  const seen = new Set<string>();
  return segments.filter((seg) => {
    const key = segKey(seg);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTriangulation(): {
  triangles: TrianglePanel[];
  triangulationSegments: Seg[];
} {
  const { vertices, edges } = buildPlanarGraph();
  const faceLoops = walkFaceLoops(vertices, edges);

  const rawTriangles: Pt[][] = [];
  const allDiagonals: Seg[] = [];

  for (const { points } of faceLoops) {
    const { triangles, diagonals } = fanTriangulate(points);
    rawTriangles.push(...triangles);
    allDiagonals.push(...diagonals);
  }

  const seen = new Set<string>();
  const uniqueTriangles = rawTriangles.filter((points) => {
    const key = triangleKey(points);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const edgeToTriangles = new Map<string, number[]>();
  for (let i = 0; i < uniqueTriangles.length; i++) {
    const points = uniqueTriangles[i];
    for (let j = 0; j < 3; j++) {
      const a = points[j];
      const b = points[(j + 1) % 3];
      const id = edgeIdFromPoints(a, b);
      const list = edgeToTriangles.get(id) ?? [];
      list.push(i);
      edgeToTriangles.set(id, list);
    }
  }

  const triangles: TrianglePanel[] = uniqueTriangles.map((points, id) => {
    const edges: TriangleEdge[] = [];
    for (let j = 0; j < 3; j++) {
      const a = points[j];
      const b = points[(j + 1) % 3];
      const edgeId = edgeIdFromPoints(a, b);
      const neighbors = edgeToTriangles.get(edgeId) ?? [];
      const neighborId =
        neighbors.length === 2
          ? neighbors[0] === id
            ? neighbors[1]
            : neighbors[0]
          : null;
      edges.push({ edgeId, a, b, neighborId });
    }
    return {
      id,
      points,
      clipPath: pointsToClipPath(points),
      edges,
    };
  });

  return {
    triangles,
    triangulationSegments: dedupeSegments(allDiagonals),
  };
}

const TRIANGULATION = buildTriangulation();

export const PATTERN_TRIANGLES: TrianglePanel[] = TRIANGULATION.triangles;
export const TRIANGULATION_SEGMENTS: readonly Seg[] = TRIANGULATION.triangulationSegments;
export const DISPLAY_CREASE_SEGMENTS: readonly Seg[] = [
  ...CREASE_SEGMENTS,
  ...TRIANGULATION_SEGMENTS,
];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bright random fill colors for each face. */
export function randomFaceColors(count: number, seed?: number): string[] {
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  return Array.from({ length: count }, () => {
    const h = Math.floor(rand() * 360);
    const s = 55 + Math.floor(rand() * 35);
    const l = 45 + Math.floor(rand() * 25);
    return `hsl(${h} ${s}% ${l}%)`;
  });
}

export function pointsToPath(points: Pt[]): string {
  return `${points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ")} Z`;
}
