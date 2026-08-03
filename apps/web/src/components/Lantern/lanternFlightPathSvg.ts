/** SVG path from `public/fly_path.svg`. */
export const LANTERN_FLIGHT_PATH_D =
  "M.37,118.15c10.42-11.74,24.07-23.09,38.21-21.58c22.79,2.45,25.55,36.01,47.33,44.81c36.49,14.75,76.66-70.13,124.95-69.71c74.51.65,84.92,197.08,174.17,220.73c99.38,26.34,187.72-244.25,299.11-238.99c159.87,7.55,138.72,556.63,361.58,629.01c140.99,45.79,395.26-94.14,866.7-682.11";

export const LANTERN_FLIGHT_PATH_VIEWBOX = {
  width: 1912.81,
  height: 690.96,
} as const;

const LUT_SAMPLES = 400;

export type SvgPoint = {
  x: number;
  y: number;
};

export type CubicSegment = {
  p0: SvgPoint;
  p1: SvgPoint;
  p2: SvgPoint;
  p3: SvgPoint;
};

type ArcLengthEntry = {
  s: number;
  x: number;
  y: number;
};

function cubicPoint(segment: CubicSegment, t: number): SvgPoint {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      u3 * segment.p0.x +
      3 * u2 * t * segment.p1.x +
      3 * u * t2 * segment.p2.x +
      t3 * segment.p3.x,
    y:
      u3 * segment.p0.y +
      3 * u2 * t * segment.p1.y +
      3 * u * t2 * segment.p2.y +
      t3 * segment.p3.y,
  };
}

function distance(a: SvgPoint, b: SvgPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function parseSvgPath(pathD: string): CubicSegment[] {
  const tokens = pathD.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return [];

  const segments: CubicSegment[] = [];
  let index = 0;
  let command = "";
  let current: SvgPoint = { x: 0, y: 0 };

  const readNumber = () => Number(tokens[index++]);

  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[a-zA-Z]$/.test(token)) {
      command = token;
      index += 1;
    }

    if (command === "M") {
      current = { x: readNumber(), y: readNumber() };
      continue;
    }

    if (command === "c") {
      const p1 = { x: current.x + readNumber(), y: current.y + readNumber() };
      const p2 = { x: current.x + readNumber(), y: current.y + readNumber() };
      const p3 = { x: current.x + readNumber(), y: current.y + readNumber() };
      segments.push({ p0: current, p1, p2, p3 });
      current = p3;
      continue;
    }

    throw new Error(`Unsupported SVG path command: ${command}`);
  }

  return segments;
}

function buildArcLengthTable(segments: CubicSegment[]): ArcLengthEntry[] {
  const entries: ArcLengthEntry[] = [{ s: 0, x: segments[0].p0.x, y: segments[0].p0.y }];
  let cumulative = 0;
  let previous = segments[0].p0;

  for (const segment of segments) {
    const steps = Math.max(8, Math.ceil(LUT_SAMPLES / segments.length));
    for (let step = 1; step <= steps; step += 1) {
      const point = cubicPoint(segment, step / steps);
      cumulative += distance(previous, point);
      entries.push({ s: cumulative, x: point.x, y: point.y });
      previous = point;
    }
  }

  return entries;
}

function normalizePoint(point: SvgPoint): SvgPoint {
  return {
    x: point.x / LANTERN_FLIGHT_PATH_VIEWBOX.width,
    y: point.y / LANTERN_FLIGHT_PATH_VIEWBOX.height,
  };
}

function findInitialArcLength(entries: ArcLengthEntry[], totalLength: number): number {
  let maxY = Number.NEGATIVE_INFINITY;
  let initialS = 0;

  for (const entry of entries) {
    const yNorm = entry.y / LANTERN_FLIGHT_PATH_VIEWBOX.height;
    if (yNorm > maxY) {
      maxY = yNorm;
      initialS = entry.s / totalLength;
    }
  }

  return initialS;
}

const SEGMENTS = parseSvgPath(LANTERN_FLIGHT_PATH_D);
const ARC_LENGTH_TABLE = buildArcLengthTable(SEGMENTS);
const TOTAL_ARC_LENGTH = ARC_LENGTH_TABLE[ARC_LENGTH_TABLE.length - 1]?.s ?? 1;

export const LANTERN_FLIGHT_PATH_INITIAL = findInitialArcLength(
  ARC_LENGTH_TABLE,
  TOTAL_ARC_LENGTH,
);

function lookupByArcLength(arcLength: number): { entry: ArcLengthEntry; next: ArcLengthEntry } {
  const clamped = Math.min(TOTAL_ARC_LENGTH, Math.max(0, arcLength));

  if (clamped <= 0) {
    const next = ARC_LENGTH_TABLE[1] ?? ARC_LENGTH_TABLE[0];
    return { entry: ARC_LENGTH_TABLE[0], next };
  }

  for (let i = 1; i < ARC_LENGTH_TABLE.length; i += 1) {
    const next = ARC_LENGTH_TABLE[i];
    if (clamped <= next.s) {
      return { entry: ARC_LENGTH_TABLE[i - 1], next };
    }
  }

  const last = ARC_LENGTH_TABLE[ARC_LENGTH_TABLE.length - 1];
  const prev = ARC_LENGTH_TABLE[ARC_LENGTH_TABLE.length - 2] ?? last;
  return { entry: prev, next: last };
}

/** Sample a normalized point on the SVG path at arc-length fraction `s` (0–1). */
export function pointAtArcLength(s: number): SvgPoint {
  const arcLength = s * TOTAL_ARC_LENGTH;
  const { entry, next } = lookupByArcLength(arcLength);
  const span = next.s - entry.s || 1;
  const localT = (arcLength - entry.s) / span;

  return normalizePoint({
    x: entry.x + (next.x - entry.x) * localT,
    y: entry.y + (next.y - entry.y) * localT,
  });
}

/** Tangent angle in degrees at arc-length fraction `s`. */
export function tangentAtArcLength(s: number): number {
  const arcLength = s * TOTAL_ARC_LENGTH;
  const epsilon = TOTAL_ARC_LENGTH / LUT_SAMPLES;
  const a = pointAtArcLength(Math.max(0, (arcLength - epsilon) / TOTAL_ARC_LENGTH));
  const b = pointAtArcLength(Math.min(1, (arcLength + epsilon) / TOTAL_ARC_LENGTH));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function getTotalArcLength(): number {
  return TOTAL_ARC_LENGTH;
}

export function getArcLengthTable(): readonly ArcLengthEntry[] {
  return ARC_LENGTH_TABLE;
}
