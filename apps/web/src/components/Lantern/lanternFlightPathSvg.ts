/** SVG path from `public/flight_path.svg`. */
export const LANTERN_FLIGHT_PATH_D =
  "M1172.14,937.67c-8.61,0-17.21-.31-25.83-.94-108.41-7.91-193.23-83.88-300.62-180.06-5.23-4.68-10.51-9.41-15.85-14.19-31.2-27.88-53.58-50.8-77.27-75.06-34.6-35.43-70.37-72.06-137.42-127.87-130.55-108.66-173.79-119.29-201.07-114.6-45.68,7.86-67.85,45.04-91.31,84.4-22.87,38.36-46.52,78.02-93.95,89.13-8.56,2-17.65,2.98-27.07,2.98-36.84,0-78.94-14.92-115.55-41.83-41.88-30.79-68.5-71.41-71.23-108.66-2.43-33.31,13.14-68.87,45.04-102.84,27.52-29.31,66.15-55.71,108.77-74.35,44.71-19.55,90.86-29.67,133.46-29.23,61.57.62,98.01,23.55,144.15,52.59,44.71,28.14,100.36,63.17,198.63,90.08,102.03,27.94,175.75,48.13,252.62,17.66,64.96-25.74,93.99-71.76,122.07-116.26,27.4-43.43,53.28-84.45,110.34-99.93,61.36-16.65,119,7.33,165.33,26.6,42.03,17.48,75.23,31.29,96.22,10.29,10.59-10.6,16.37-28.97,15.47-49.15-.91-20.52-8.52-39.16-19.85-48.64-11.52-9.64-24.22-8.2-41.81-6.21-16.54,1.87-37.12,4.2-63.88-2.51-22.94-5.76-34.77-14.26-47.3-23.27-8.94-6.43-18.19-13.08-32.2-19.41-30.96-13.99-51.17-10.71-79.14-6.17-20,3.24-44.89,7.28-80.96,6.21-44.32-1.32-90.56-9.83-131.35-17.34-52.48-9.66-97.8-18.01-116.9-6.26l-.42.26c-2.89,1.81-11.68,7.3-23.38,7.17-13.38-.15-29.42-5.6-32.82-15.39-4.18-12.06,9.92-32.82,39.99-45.33l.38.92c-28.6,11.9-43.48,32.4-39.43,44.08,3.13,9.02,18.67,14.57,31.89,14.72,11.43.14,20.01-5.25,22.84-7.02l.42-.26c19.43-11.95,62.75-3.97,117.61,6.13,40.76,7.51,86.96,16.01,131.2,17.32,35.98,1.07,60.82-2.96,80.77-6.2,28.14-4.57,48.48-7.87,79.71,6.24,14.09,6.37,23.38,13.05,32.37,19.51,12.44,8.95,24.2,17.4,46.96,23.11,26.58,6.67,47.06,4.35,63.52,2.49,17.16-1.94,30.71-3.48,42.56,6.44,11.54,9.65,19.28,28.57,20.21,49.37.91,20.46-4.98,39.11-15.76,49.9-21.46,21.48-54.93,7.55-97.31-10.08-46.18-19.21-103.65-43.12-164.68-26.56-56.68,15.38-82.46,56.24-109.75,99.5-28.16,44.64-57.29,90.79-122.55,116.66-27.33,10.83-54.25,15.29-82.15,15.29-50.9,0-105.08-14.84-171.11-32.92-98.41-26.95-154.13-62.02-198.9-90.2-46-28.95-82.33-51.82-143.62-52.43-42.45-.42-88.47,9.65-133.04,29.15-42.5,18.59-81.02,44.91-108.44,74.12-31.7,33.76-47.18,69.06-44.77,102.08,2.7,36.96,29.17,77.31,70.82,107.93,45.74,33.63,100.08,48.46,141.8,38.68,47.02-11.01,70.56-50.49,93.32-88.67,23.59-39.56,45.87-76.93,92-84.87,12.24-2.11,27.59-2.1,56.83,12.08,34.89,16.92,82.33,50.53,145.05,102.73,67.09,55.84,102.88,92.49,137.5,127.94,23.68,24.25,46.05,47.16,77.22,75.01,5.34,4.77,10.62,9.5,15.85,14.19,107.25,96.05,191.96,171.92,300.03,179.81,82.86,6.05,165.48-17.11,245.55-68.82,60.76-39.24,104.16-85.1,124.62-108.94,72.44-84.41,95.57-166.79,120.06-254,26.97-96.03,54.86-195.33,153.48-300.43,35.81-38.16,76.45-72.32,120.79-101.55l.55.83c-44.28,29.18-84.86,63.29-120.62,101.4-98.46,104.92-126.31,204.1-153.25,300.01-24.52,87.32-47.68,169.8-120.27,254.38-20.5,23.88-63.97,69.82-124.84,109.13-71.93,46.46-145.94,69.92-220.34,69.92Z";

export const LANTERN_FLIGHT_PATH_VIEWBOX = {
  width: 1920,
  height: 1080,
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

function parseSvgPath(pathD: string): CubicSegment[] {
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

    if (command === "l") {
      while (hasNumberToken(tokens, index)) {
        const p3 = { x: current.x + readNumber(), y: current.y + readNumber() };
        segments.push(lineToCubic(current, p3));
        current = p3;
      }
      continue;
    }

    if (command === "Z") {
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

export function findExitArcLength(entries: ArcLengthEntry[], totalLength: number): number {
  const minY =
    Math.min(...entries.map((entry) => entry.y)) / LANTERN_FLIGHT_PATH_VIEWBOX.height;
  const centerX = 0.5;
  let exitS = 0;
  let bestCenterDistance = Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    const yNorm = entry.y / LANTERN_FLIGHT_PATH_VIEWBOX.height;
    const xNorm = entry.x / LANTERN_FLIGHT_PATH_VIEWBOX.width;
    if (Math.abs(yNorm - minY) > 0.002) continue;

    const centerDistance = Math.abs(xNorm - centerX);
    if (
      centerDistance < bestCenterDistance ||
      (centerDistance === bestCenterDistance && entry.s / totalLength < exitS)
    ) {
      bestCenterDistance = centerDistance;
      exitS = entry.s / totalLength;
    }
  }

  return exitS;
}

function arcLengthBetween(fromS: number, toS: number, totalLength: number): number {
  const from = fromS * totalLength;
  const to = toS * totalLength;
  if (to >= from) return to - from;
  return totalLength - from + to;
}

function averageYNormAlongArc(
  entries: ArcLengthEntry[],
  totalLength: number,
  fromS: number,
  arcLength: number,
  forward: boolean,
): number {
  const samples = 16;
  let sum = 0;

  for (let i = 0; i <= samples; i += 1) {
    const offset = (arcLength * i) / samples;
    let absolute =
      forward
        ? fromS * totalLength + offset
        : fromS * totalLength - offset;

    if (absolute < 0) absolute += totalLength;
    if (absolute > totalLength) absolute -= totalLength;

    const perimeterS = absolute / totalLength;
    const point = pointAtPerimeterArcLength(perimeterS, entries, totalLength);
    sum += point.y;
  }

  return sum / (samples + 1);
}

function chooseFlightArcDirection(
  initialS: number,
  exitS: number,
  totalLength: number,
  entries: ArcLengthEntry[],
): { forward: boolean; arcLength: number } {
  const forwardLength = arcLengthBetween(initialS, exitS, totalLength);
  const backwardLength = totalLength - forwardLength;

  const forwardAverageY = averageYNormAlongArc(
    entries,
    totalLength,
    initialS,
    forwardLength,
    true,
  );
  const backwardAverageY = averageYNormAlongArc(
    entries,
    totalLength,
    initialS,
    backwardLength,
    false,
  );

  if (forwardAverageY <= backwardAverageY) {
    return { forward: true, arcLength: forwardLength };
  }

  return { forward: false, arcLength: backwardLength };
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

function pointAtPerimeterArcLength(
  perimeterS: number,
  entries: ArcLengthEntry[],
  totalLength: number,
): SvgPoint {
  const arcLength = perimeterS * totalLength;
  const { entry, next } = lookupByArcLength(arcLength, entries, totalLength);
  const span = next.s - entry.s || 1;
  const localT = (arcLength - entry.s) / span;

  return normalizePoint({
    x: entry.x + (next.x - entry.x) * localT,
    y: entry.y + (next.y - entry.y) * localT,
  });
}

const SEGMENTS = parseSvgPath(LANTERN_FLIGHT_PATH_D);
const ARC_LENGTH_TABLE = buildArcLengthTable(SEGMENTS);
const TOTAL_ARC_LENGTH = ARC_LENGTH_TABLE[ARC_LENGTH_TABLE.length - 1]?.s ?? 1;

export const LANTERN_FLIGHT_PATH_PERIMETER_INITIAL = findInitialArcLength(
  ARC_LENGTH_TABLE,
  TOTAL_ARC_LENGTH,
);
export const LANTERN_FLIGHT_PATH_PERIMETER_EXIT = findExitArcLength(
  ARC_LENGTH_TABLE,
  TOTAL_ARC_LENGTH,
);

const FLIGHT_ARC = chooseFlightArcDirection(
  LANTERN_FLIGHT_PATH_PERIMETER_INITIAL,
  LANTERN_FLIGHT_PATH_PERIMETER_EXIT,
  TOTAL_ARC_LENGTH,
  ARC_LENGTH_TABLE,
);

/** Rest pose in flight parameterization (always 0). */
export const LANTERN_FLIGHT_PATH_INITIAL = 0;

function flightSToPerimeterS(flightS: number): number {
  const offset = flightS * FLIGHT_ARC.arcLength;
  let absolute = FLIGHT_ARC.forward
    ? LANTERN_FLIGHT_PATH_PERIMETER_INITIAL * TOTAL_ARC_LENGTH + offset
    : LANTERN_FLIGHT_PATH_PERIMETER_INITIAL * TOTAL_ARC_LENGTH - offset;

  if (absolute < 0) absolute += TOTAL_ARC_LENGTH;
  if (absolute > TOTAL_ARC_LENGTH) absolute -= TOTAL_ARC_LENGTH;

  return absolute / TOTAL_ARC_LENGTH;
}

/** Sample a normalized point on the flight segment at `flightS` (0 = rest, 1 = exit). */
export function pointAtFlightArcLength(flightS: number): SvgPoint {
  return pointAtPerimeterArcLength(
    flightSToPerimeterS(flightS),
    ARC_LENGTH_TABLE,
    TOTAL_ARC_LENGTH,
  );
}

/** Tangent angle in degrees at flight arc-length fraction `flightS`. */
export function tangentAtFlightArcLength(flightS: number): number {
  const epsilon = FLIGHT_ARC.arcLength / LUT_SAMPLES;
  const delta = epsilon / FLIGHT_ARC.arcLength;
  const a = pointAtFlightArcLength(flightS - delta);
  const b = pointAtFlightArcLength(flightS + delta);
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** @deprecated Use pointAtFlightArcLength for lantern queue motion. */
export function pointAtArcLength(s: number): SvgPoint {
  return pointAtPerimeterArcLength(s, ARC_LENGTH_TABLE, TOTAL_ARC_LENGTH);
}

/** @deprecated Use tangentAtFlightArcLength for lantern queue motion. */
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

export function getFlightArcLength(): number {
  return FLIGHT_ARC.arcLength;
}

export function getArcLengthTable(): readonly ArcLengthEntry[] {
  return ARC_LENGTH_TABLE;
}

/** Map perimeter fraction to flight `pathS` (negative = black approach). */
export function perimeterSToFlightS(perimeterS: number): number {
  const initial = LANTERN_FLIGHT_PATH_PERIMETER_INITIAL;
  const forwardDist = arcLengthBetween(initial, perimeterS, TOTAL_ARC_LENGTH);
  const backwardDist = TOTAL_ARC_LENGTH - forwardDist;
  const epsilon = TOTAL_ARC_LENGTH * 0.001;

  if (forwardDist <= FLIGHT_ARC.arcLength + epsilon) {
    return forwardDist / FLIGHT_ARC.arcLength;
  }

  return -backwardDist / FLIGHT_ARC.arcLength;
}

function nearestPerimeterS(cx: number, cy: number): number {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestPerimeterS = 0;

  for (const entry of ARC_LENGTH_TABLE) {
    const dx = entry.x - cx;
    const dy = entry.y - cy;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPerimeterS = entry.s / TOTAL_ARC_LENGTH;
    }
  }

  return bestPerimeterS;
}

/** Project a viewBox point onto the route; returns nearest `pathS`. */
export function projectViewBoxPointToFlightS(cx: number, cy: number): number {
  return perimeterSToFlightS(nearestPerimeterS(cx, cy));
}

/** Project onto the black approach (always negative `pathS`). */
export function projectViewBoxPointToBlackPathS(cx: number, cy: number): number {
  const initial = LANTERN_FLIGHT_PATH_PERIMETER_INITIAL;
  const perimeterS = nearestPerimeterS(cx, cy);
  const backwardDist = TOTAL_ARC_LENGTH - arcLengthBetween(initial, perimeterS, TOTAL_ARC_LENGTH);
  return -backwardDist / FLIGHT_ARC.arcLength;
}
