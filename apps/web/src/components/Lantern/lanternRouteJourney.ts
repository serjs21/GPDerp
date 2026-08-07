import type { PathSampler } from "./lanternFlightPathSvg";
import { LANTERN_FLIGHT_PATH_ROTATE_GAIN } from "./lanternFlightPath.config";
import { getSegmentSampler } from "./lanternFlightPathSvg";

export type JourneySegment = {
  segmentIndex: number;
  fromStopId: number;
  toStopId: number;
  sampler: PathSampler;
  fromArc: number;
  toArc: number;
  arcLength: number;
};

export type JourneyPath = {
  segments: JourneySegment[];
  totalArcLength: number;
  stopJourneySById: Readonly<Record<number, number>>;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Authored route convention (see `route-split-segments-exact.svg`):
 * - `segment-N` connects stop-N → stop-(N+1)
 * - stop-1 sits between segment-0 (fade to stop-0) and segment-1 (carousel start)
 * - Carousel journey chains segment-1 … segment-15 for stop-1 … stop-16
 */
export function buildJourneyPath(carouselStopIds: number[]): JourneyPath {
  const segments: JourneySegment[] = [];
  const rawJourneyById: Record<number, number> = {};
  let cumulative = 0;

  for (let index = 0; index < carouselStopIds.length; index += 1) {
    const stopId = carouselStopIds[index];
    rawJourneyById[stopId] = cumulative;

    if (index === 0) continue;

    const fromStopId = carouselStopIds[index - 1];
    const toStopId = stopId;
    const segmentIndex = fromStopId;
    const sampler = getSegmentSampler(segmentIndex);
    if (!sampler) continue;

    const fromArc = cumulative;
    cumulative += sampler.arcLength;
    rawJourneyById[toStopId] = cumulative;

    segments.push({
      segmentIndex,
      fromStopId,
      toStopId,
      sampler,
      fromArc,
      toArc: cumulative,
      arcLength: sampler.arcLength,
    });
  }

  const totalArcLength = cumulative || 1;
  const stopJourneySById: Record<number, number> = {};
  for (const stopId of carouselStopIds) {
    stopJourneySById[stopId] = (rawJourneyById[stopId] ?? 0) / totalArcLength;
  }

  return {
    segments,
    totalArcLength,
    stopJourneySById,
  };
}

export function journeySForStopId(journey: JourneyPath, stopId: number): number {
  return journey.stopJourneySById[stopId] ?? 0;
}

export function journeySBetweenStopIds(
  journey: JourneyPath,
  fromStopId: number,
  toStopId: number,
  t: number,
): number {
  const fromJourneyS = journeySForStopId(journey, fromStopId);
  const toJourneyS = journeySForStopId(journey, toStopId);
  return lerp(fromJourneyS, toJourneyS, clamp01(t));
}

/** Sample `segment-{segmentId}` at local arc-length fraction t ∈ [0, 1]. */
export function sampleAlongSegment(segmentId: number, localT: number) {
  const sampler = getSegmentSampler(segmentId);
  if (!sampler) {
    return { x: 0, y: 0 };
  }
  return sampler.pointAt(clamp01(localT));
}

/**
 * Sample position moving from `fromStopId` to `toStopId` along exact sub-paths.
 * Adjacent stops use segment-{fromId} forward or segment-{toId} reverse.
 */
export function sampleBetweenStopIds(
  journey: JourneyPath,
  fromStopId: number,
  toStopId: number,
  t: number,
) {
  const clampedT = clamp01(t);

  if (toStopId === fromStopId + 1) {
    return sampleAlongSegment(fromStopId, clampedT);
  }

  if (toStopId === fromStopId - 1) {
    return sampleAlongSegment(toStopId, 1 - clampedT);
  }

  return pointAtJourneyS(
    journey,
    journeySBetweenStopIds(journey, fromStopId, toStopId, clampedT),
  );
}

function sampleJourneyArcLength(journey: JourneyPath, arcLength: number) {
  const clamped = Math.min(journey.totalArcLength, Math.max(0, arcLength));

  for (const segment of journey.segments) {
    if (clamped <= segment.toArc + 1e-9) {
      const span = segment.arcLength || 1;
      const localT = (clamped - segment.fromArc) / span;
      return segment.sampler.pointAt(localT);
    }
  }

  const last = journey.segments[journey.segments.length - 1];
  return last?.sampler.pointAt(1) ?? { x: 0, y: 0 };
}

function tangentAtJourneyArcLength(journey: JourneyPath, arcLength: number): number {
  const clamped = Math.min(journey.totalArcLength, Math.max(0, arcLength));

  for (const segment of journey.segments) {
    if (clamped <= segment.toArc + 1e-9) {
      const span = segment.arcLength || 1;
      const localT = (clamped - segment.fromArc) / span;
      return segment.sampler.tangentAt(localT);
    }
  }

  const last = journey.segments[journey.segments.length - 1];
  return last?.sampler.tangentAt(1) ?? 0;
}

export function pointAtJourneyS(journey: JourneyPath, journeyS: number) {
  const arcLength = clamp01(journeyS) * journey.totalArcLength;
  return sampleJourneyArcLength(journey, arcLength);
}

export function tangentAtJourneyS(journey: JourneyPath, journeyS: number): number {
  const epsilon = journey.totalArcLength / 400;
  const arcLength = clamp01(journeyS) * journey.totalArcLength;
  const a = sampleJourneyArcLength(journey, Math.max(0, arcLength - epsilon));
  const b = sampleJourneyArcLength(journey, Math.min(journey.totalArcLength, arcLength + epsilon));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function sampleLanternJourneyPath(
  journey: JourneyPath,
  journeyS: number,
  scale: number,
): { x: number; y: number; scale: number; rotate: number } {
  const point = pointAtJourneyS(journey, journeyS);
  const tangentDeg = tangentAtJourneyS(journey, journeyS);
  return {
    x: point.x,
    y: point.y,
    scale,
    rotate: tangentDeg * (LANTERN_FLIGHT_PATH_ROTATE_GAIN / 90),
  };
}
