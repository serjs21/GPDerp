import { lerp } from "./math";
import type { ParsedSplitPathSvg } from "./parseSplitPathSvg";
import { isStopOnPath } from "./stops";

const pathElementCache = new Map<string, SVGPathElement>();

function pathElementFor(d: string): SVGPathElement | null {
  if (typeof document === "undefined") return null;

  const cached = pathElementCache.get(d);
  if (cached) return cached;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  pathElementCache.set(d, path);
  return path;
}

/** Sample a segment `d` at t in [0, 1] using SVG path length. */
export function sampleSegment(d: string, t: number): { x: number; y: number } | null {
  const path = pathElementFor(d);
  if (!path) return null;

  const length = path.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) return null;

  const clamped = Math.max(0, Math.min(1, t));
  const point = path.getPointAtLength(clamped * length);
  return { x: point.x, y: point.y };
}

export type SvgPathPoint = {
  x: number;
  y: number;
};

function stopPoint(parsed: ParsedSplitPathSvg, stopId: number): SvgPathPoint | null {
  const stop = parsed.stopsById[stopId];
  if (!stop) return null;
  return {
    x: stop.cx / parsed.viewBox.width,
    y: stop.cy / parsed.viewBox.height,
  };
}

function lerpPoints(
  from: SvgPathPoint | null,
  to: SvgPathPoint | null,
  t: number,
): SvgPathPoint | null {
  if (!from || !to) return from ?? to;
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
}

function normalizeSample(
  parsed: ParsedSplitPathSvg,
  sampled: { x: number; y: number },
): SvgPathPoint {
  return {
    x: sampled.x / parsed.viewBox.width,
    y: sampled.y / parsed.viewBox.height,
  };
}

/**
 * Point along the authored path between two stops (adjacent or multi-stop).
 * Multi-stop ranges walk intermediate stops so lanterns follow the path.
 * `t` is 0 at `fromStop` and 1 at `toStop`.
 */
export function pointBetweenStops(
  parsed: ParsedSplitPathSvg,
  fromStop: number,
  toStop: number,
  t: number,
): SvgPathPoint | null {
  if (!isStopOnPath(fromStop) && !isStopOnPath(toStop)) return null;
  if (Math.abs(toStop - fromStop) < 1e-6 || t >= 1 - 1e-6) {
    return stopPoint(parsed, Math.round(toStop));
  }
  if (t <= 1e-6) {
    return stopPoint(parsed, Math.round(fromStop));
  }

  const span = toStop - fromStop;
  if (Math.abs(span) > 1 + 1e-6) {
    const continuous = fromStop + span * t;
    const a = Math.floor(continuous);
    const b = Math.ceil(continuous);
    const localT = continuous - a;
    if (a === b) return stopPoint(parsed, a);
    return pointBetweenStops(parsed, a, b, localT);
  }

  const segment = parsed.segmentsById[Math.min(fromStop, toStop)];
  const from = stopPoint(parsed, fromStop);
  const to = stopPoint(parsed, toStop);
  if (!segment) return lerpPoints(from, to, t);

  const along = toStop > fromStop ? t : 1 - t;
  const sampled = sampleSegment(segment.d, along);
  if (!sampled) return lerpPoints(from, to, t);

  return normalizeSample(parsed, sampled);
}
