import type { ParsedSplitPathSvg } from "./parseSplitPathSvg";
import { sampleSegment } from "./sampleSegment";
import { isStopOnPath, lerp } from "./svgPathPose";

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
 * Point along the authored segment between two adjacent stops.
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

  const segment = parsed.segmentsById[Math.min(fromStop, toStop)];
  const from = stopPoint(parsed, fromStop);
  const to = stopPoint(parsed, toStop);
  if (!segment) return lerpPoints(from, to, t);

  const along = toStop > fromStop ? t : 1 - t;
  const sampled = sampleSegment(segment.d, along);
  if (!sampled) return lerpPoints(from, to, t);

  return normalizeSample(parsed, sampled);
}
