import { PATTERN_ORIGIN, PATTERN_SIZE, type Pt } from "./creasePattern";

export type Vec3 = [number, number, number];

export type Mat4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

export type FoldCamera = {
  tiltDeg: number;
  yawDeg: number;
  /** In-plane rotation around pattern center (degrees). */
  rollDeg?: number;
  scale: number;
};

export const IDENTITY_MAT4: Mat4 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

export function vec3(x: number, y: number, z: number): Vec3 {
  return [x, y, z];
}

export function ptToVec3(point: Pt, z = 0): Vec3 {
  return [point[0], point[1], z];
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scaleVec3(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function dotVec3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function lengthVec3(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function normalizeVec3(v: Vec3): Vec3 {
  const len = lengthVec3(v) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function edgeAxis3D(hingeA: Vec3, hingeB: Vec3): Vec3 {
  return normalizeVec3(subVec3(hingeB, hingeA));
}

/** Rodrigues rotation of point around hinge axis through hingeA. */
export function rotatePointAroundEdge(
  point: Vec3,
  hingeA: Vec3,
  hingeB: Vec3,
  angleRad: number,
): Vec3 {
  const k = edgeAxis3D(hingeA, hingeB);
  const rel = subVec3(point, hingeA);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const term1 = scaleVec3(rel, cos);
  const term2 = scaleVec3(crossVec3(k, rel), sin);
  const term3 = scaleVec3(k, dotVec3(k, rel) * (1 - cos));
  return addVec3(hingeA, addVec3(term1, addVec3(term2, term3)));
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const out = [...a] as unknown as Mat4;
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[row + col * 4] =
        a[row] * b[col * 4] +
        a[row + 4] * b[col * 4 + 1] +
        a[row + 8] * b[col * 4 + 2] +
        a[row + 12] * b[col * 4 + 3];
    }
  }
  return out;
}

export function applyMat4(point: Vec3, mat: Mat4): Vec3 {
  const [x, y, z] = point;
  const w = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] || 1;
  return [
    (mat[0] * x + mat[4] * y + mat[8] * z + mat[12]) / w,
    (mat[1] * x + mat[5] * y + mat[9] * z + mat[13]) / w,
    (mat[2] * x + mat[6] * y + mat[10] * z + mat[14]) / w,
  ];
}

export function rotationMat4AxisAngle(axis: Vec3, angleRad: number): Mat4 {
  const [x, y, z] = normalizeVec3(axis);
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const t = 1 - c;
  return [
    t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
    t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
    t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
    0, 0, 0, 1,
  ];
}

export function translationMat4(tx: number, ty: number, tz: number): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
  ];
}

export function defaultFoldCamera(foldAmount: number): FoldCamera {
  return {
    tiltDeg: 16 * foldAmount,
    yawDeg: -22 * foldAmount,
    scale: 1,
  };
}

export function projectToScreen(point: Vec3, camera: FoldCamera): Pt {
  const tilt = degToRad(camera.tiltDeg);
  const yaw = degToRad(camera.yawDeg);
  const roll = degToRad(camera.rollDeg ?? 0);
  const [x, y, z] = point;

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = x * cosY + z * sinY;

  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const z1 = -x * sinY + z * cosY;
  const y2 = y * cosT - z1 * sinT;

  let px = x1 * camera.scale;
  let py = y2 * camera.scale;

  const cx = PATTERN_ORIGIN.x + PATTERN_SIZE / 2;
  const cy = PATTERN_ORIGIN.y + PATTERN_SIZE / 2;
  const dx = px - cx;
  const dy = py - cy;
  px = cx + dx * Math.cos(roll) - dy * Math.sin(roll);
  py = cy + dx * Math.sin(roll) + dy * Math.cos(roll);

  return [px, py];
}

/** Normalized pattern coords (0–1) for landmark comparison. */
export function projectToNormalized(point: Vec3, camera: FoldCamera): Pt {
  const [x, y] = projectToScreen(point, camera);
  return [
    (x - PATTERN_ORIGIN.x) / PATTERN_SIZE,
    (y - PATTERN_ORIGIN.y) / PATTERN_SIZE,
  ];
}

export function vec3ToClipPathPercent(point: Pt): string {
  const xPct = ((point[0] - PATTERN_ORIGIN.x) / PATTERN_SIZE) * 100;
  const yPct = ((point[1] - PATTERN_ORIGIN.y) / PATTERN_SIZE) * 100;
  return `${xPct.toFixed(4)}% ${yPct.toFixed(4)}%`;
}

export function pointsToClipPath(points: Pt[]): string {
  return `polygon(${points.map(vec3ToClipPathPercent).join(", ")})`;
}

export function triangleNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return normalizeVec3(crossVec3(subVec3(b, a), subVec3(c, a)));
}

export function faceBrightness(normal: Vec3, light: Vec3 = [0.2, 0.35, 0.9]): number {
  const n = normalizeVec3(normal);
  const l = normalizeVec3(light);
  const diffuse = Math.max(0.25, dotVec3(n, l));
  return 0.55 + diffuse * 0.55;
}
