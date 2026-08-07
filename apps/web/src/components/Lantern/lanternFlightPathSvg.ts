import { LANTERN_ROUTE_SEGMENTS } from "./lanternRoutePath";

export const LANTERN_FLIGHT_PATH_VIEWBOX = {
  width: 1920,
  height: 1080,
} as const;

/** Fade segment (`segment-0`) path `d`. */
export const LANTERN_FLIGHT_PATH_D = LANTERN_ROUTE_SEGMENTS[0] ?? "";

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

export type PathSampler = {
  pointAt: (t: number) => SvgPoint;
  tangentAt: (t: number) => number;
  arcLength: number;
  getArcLengthTable: () => readonly ArcLengthEntry[];
  pathStart: SvgPoint;
  pathEnd: SvgPoint;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

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
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function lerpPoint(a: SvgPoint, b: SvgPoint, t: number): SvgPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function lineToCubic(p0: SvgPoint, p3: SvgPoint): CubicSegment {
  return {
    p0,
    p1: lerpPoint(p0, p3, 1 / 3),
    p2: lerpPoint(p0, p3, 2 / 3),
    p3,
  };
}

function hasNumberToken(tokens: string[], index: number): boolean {
  return index < tokens.length && !/^[a-zA-Z]$/.test(tokens[index]);
}

export function parseSvgPath(pathD: string): CubicSegment[] {
  const tokens = pathD.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return [];

  const segments: CubicSegment[] = [];
  let index = 0;
  let command = "";
  let current: SvgPoint = { x: 0, y: 0 };
  let subpathStart: SvgPoint = { x: 0, y: 0 };

  const readNumber = () => Number(tokens[index++]);

  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[a-zA-Z]$/.test(token)) {
      command = token;
      index += 1;
    }

    if (command === "M") {
      current = { x: readNumber(), y: readNumber() };
      subpathStart = current;
      continue;
    }

    if (command === "C") {
      while (hasNumberToken(tokens, index)) {
        const p1 = { x: readNumber(), y: readNumber() };
        const p2 = { x: readNumber(), y: readNumber() };
        const p3 = { x: readNumber(), y: readNumber() };
        segments.push({ p0: current, p1, p2, p3 });
        current = p3;
      }
      continue;
    }

    if (command === "c") {
      while (hasNumberToken(tokens, index)) {
        const p1 = { x: current.x + readNumber(), y: current.y + readNumber() };
        const p2 = { x: current.x + readNumber(), y: current.y + readNumber() };
        const p3 = { x: current.x + readNumber(), y: current.y + readNumber() };
        segments.push({ p0: current, p1, p2, p3 });
        current = p3;
      }
      continue;
    }

    if (command === "L") {
      while (hasNumberToken(tokens, index)) {
        const p3 = { x: readNumber(), y: readNumber() };
        segments.push(lineToCubic(current, p3));
        current = p3;
      }
      continue;
    }

    if (command === "l") {
      while (hasNumberToken(tokens, index)) {
        const p3 = { x: current.x + readNumber(), y: current.y + readNumber() };
        segments.push(lineToCubic(current, p3));
        current = p3;
      }
      continue;
    }

    if (command === "Z" || command === "z") {
      if (current.x !== subpathStart.x || current.y !== subpathStart.y) {
        segments.push(lineToCubic(current, subpathStart));
        current = subpathStart;
      }
      continue;
    }

    throw new Error(`Unsupported SVG path command: ${command}`);
  }

  return segments;
}

function buildArcLengthTable(segments: CubicSegment[]): ArcLengthEntry[] {
  if (segments.length === 0) {
    return [{ s: 0, x: 0, y: 0 }];
  }

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

function lookupByArcLength(
  arcLength: number,
  entries: ArcLengthEntry[],
  totalLength: number,
): { entry: ArcLengthEntry; next: ArcLengthEntry } {
  const clamped = Math.min(totalLength, Math.max(0, arcLength));

  if (clamped <= 0) {
    const next = entries[1] ?? entries[0];
    return { entry: entries[0], next };
  }

  for (let i = 1; i < entries.length; i += 1) {
    const next = entries[i];
    if (clamped <= next.s) {
      return { entry: entries[i - 1], next };
    }
  }

  const last = entries[entries.length - 1];
  const prev = entries[entries.length - 2] ?? last;
  return { entry: prev, next: last };
}

function pointAtArcLengthAbsolute(
  arcLength: number,
  entries: ArcLengthEntry[],
  totalLength: number,
): SvgPoint {
  const { entry, next } = lookupByArcLength(arcLength, entries, totalLength);
  const span = next.s - entry.s || 1;
  const localT = (arcLength - entry.s) / span;

  return {
    x: entry.x + (next.x - entry.x) * localT,
    y: entry.y + (next.y - entry.y) * localT,
  };
}

export function createPathSampler(pathD: string): PathSampler {
  const segments = parseSvgPath(pathD);
  const table = buildArcLengthTable(segments);
  const arcLength = table[table.length - 1]?.s ?? 1;
  const pathStart = segments[0]?.p0 ?? { x: 0, y: 0 };
  const pathEnd = segments[segments.length - 1]?.p3 ?? pathStart;

  return {
    arcLength,
    pathStart: normalizePoint(pathStart),
    pathEnd: normalizePoint(pathEnd),
    getArcLengthTable: () => table,
    pointAt: (t: number) =>
      normalizePoint(pointAtArcLengthAbsolute(clamp01(t) * arcLength, table, arcLength)),
    tangentAt: (t: number) => {
      const epsilon = arcLength / LUT_SAMPLES;
      const delta = epsilon / arcLength;
      const a = normalizePoint(
        pointAtArcLengthAbsolute(
          Math.max(0, clamp01(t) - delta) * arcLength,
          table,
          arcLength,
        ),
      );
      const b = normalizePoint(
        pointAtArcLengthAbsolute(
          Math.min(1, clamp01(t) + delta) * arcLength,
          table,
          arcLength,
        ),
      );
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    },
  };
}

export const LANTERN_ROUTE_SEGMENT_SAMPLERS: readonly PathSampler[] = Array.from(
  { length: 16 },
  (_, segmentId) => createPathSampler(LANTERN_ROUTE_SEGMENTS[segmentId] ?? ""),
);

export const LANTERN_FADE_SEGMENT_SAMPLER = LANTERN_ROUTE_SEGMENT_SAMPLERS[0];

/** Rest pose in flight parameterization (always 0). */
export const LANTERN_FLIGHT_PATH_INITIAL = 0;

/** @deprecated Fade segment uses exact segment-0; initial perimeter is stop-1 end. */
export const LANTERN_FLIGHT_PATH_PERIMETER_INITIAL = 1;

/** @deprecated Fade segment uses exact segment-0; exit perimeter is stop-0 start. */
export const LANTERN_FLIGHT_PATH_PERIMETER_EXIT = 0;

const FADE_ARC_LENGTH_TABLE = LANTERN_FADE_SEGMENT_SAMPLER.getArcLengthTable();
const FADE_TOTAL_ARC_LENGTH = LANTERN_FADE_SEGMENT_SAMPLER.arcLength;

/** Sample wheel fade along segment-0 reversed (stop-1 at pathS 0, stop-0 at pathS 1). */
export function pointAtFlightArcLength(flightS: number): SvgPoint {
  return LANTERN_FADE_SEGMENT_SAMPLER.pointAt(1 - clamp01(flightS));
}

export function tangentAtFlightArcLength(flightS: number): number {
  const epsilon = 1 / LUT_SAMPLES;
  const s = clamp01(flightS);
  const a = LANTERN_FADE_SEGMENT_SAMPLER.pointAt(1 - Math.max(0, s - epsilon));
  const b = LANTERN_FADE_SEGMENT_SAMPLER.pointAt(1 - Math.min(1, s + epsilon));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function pointAtArcLength(s: number): SvgPoint {
  return LANTERN_FADE_SEGMENT_SAMPLER.pointAt(clamp01(s));
}

export function tangentAtArcLength(s: number): number {
  return LANTERN_FADE_SEGMENT_SAMPLER.tangentAt(clamp01(s));
}

export function getTotalArcLength(): number {
  return FADE_TOTAL_ARC_LENGTH;
}

export function getFlightArcLength(): number {
  return FADE_TOTAL_ARC_LENGTH;
}

export function getArcLengthTable(): readonly ArcLengthEntry[] {
  return FADE_ARC_LENGTH_TABLE;
}

function nearestFadeT(cx: number, cy: number): number {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestT = 0;

  for (const entry of FADE_ARC_LENGTH_TABLE) {
    const dx = entry.x - cx;
    const dy = entry.y - cy;
    const dist = dx * dx + dy * dy;
    if (dist < bestDistance) {
      bestDistance = dist;
      bestT = entry.s / FADE_TOTAL_ARC_LENGTH;
    }
  }

  return bestT;
}

/** Project a viewBox point onto segment-0; returns fade `pathS`. */
export function projectViewBoxPointToFlightS(cx: number, cy: number): number {
  return 1 - nearestFadeT(cx, cy);
}

/** @deprecated Carousel uses exact segments; returns fade pathS for compatibility. */
export function perimeterSToFlightS(perimeterS: number): number {
  return clamp01(perimeterS);
}

/** @deprecated Carousel uses exact segments. */
export function projectViewBoxPointToBlackPathS(cx: number, cy: number): number {
  return -projectViewBoxPointToFlightS(cx, cy);
}

/** @deprecated Use segment samplers for carousel motion. */
export function pointAtPerimeterS(perimeterS: number): SvgPoint {
  return LANTERN_FADE_SEGMENT_SAMPLER.pointAt(clamp01(perimeterS));
}

/** @deprecated Use segment samplers for carousel motion. */
export function tangentAtPerimeterS(perimeterS: number): number {
  return LANTERN_FADE_SEGMENT_SAMPLER.tangentAt(clamp01(perimeterS));
}

/** @deprecated Carousel uses exact segment paths. */
export function backwardArcLengthBetween(fromPerimeterS: number, toPerimeterS: number): number {
  return Math.abs(fromPerimeterS - toPerimeterS) * FADE_TOTAL_ARC_LENGTH;
}

/** @deprecated Stops use circle centers from the route SVG. */
export function projectViewBoxPointOntoPath(cx: number, cy: number): SvgPoint & { perimeterS: number } {
  const perimeterS = nearestFadeT(cx, cy);
  return {
    ...LANTERN_FADE_SEGMENT_SAMPLER.pointAt(perimeterS),
    perimeterS,
  };
}

export function findExitArcLength(entries: ArcLengthEntry[], totalLength: number): number {
  return entries[0]?.s / totalLength || 0;
}

export function getSegmentSampler(segmentId: number): PathSampler | undefined {
  return LANTERN_ROUTE_SEGMENT_SAMPLERS[segmentId];
}
