import { LANTERN_CAROUSEL_DEPTH_SCALE, LANTERN_EXIT_STOP_OPACITY, LANTERN_FLIGHT_PATH_FADE, easeOutCubic } from "./lanternFlightPath.config";
import {
  LANTERN_CAROUSEL_STOP_IDS,
  lanternExitPathS,
  lanternInitialPathS,
  LANTERN_ROUTE_JOURNEY,
} from "./lanternRouteStops";

export {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  LANTERN_ROUTE_JOURNEY,
  lanternExitPathS,
  lanternFinalJourneyS,
  lanternInitialJourneyS,
  lanternInitialPathS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
} from "./lanternRouteStops";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Depth scale at carousel stop index (0 = stop-1, 15 = stop-16). Ease-out: fast shrink early, slow tail. */
export function scaleAtStopIndex(stopIndex: number): number {
  const stopCount = LANTERN_CAROUSEL_STOP_IDS.length;
  const lastIndex = stopCount - 1;

  if (stopIndex < 0) return 1;
  if (stopIndex >= lastIndex) return 0;
  if (stopCount <= 1) return 1;

  const t = stopIndex / lastIndex;
  return lerp(1, LANTERN_CAROUSEL_DEPTH_SCALE.minTailScale, easeOutCubic(t));
}

export function scaleAtJourneyS(journeyS: number): number {
  if (journeyS > 1 + 1e-6) return 0;
  if (journeyS < 0) return scaleAtStopIndex(0);

  const stopIds = LANTERN_CAROUSEL_STOP_IDS;
  for (let index = 1; index < stopIds.length; index += 1) {
    const prevId = stopIds[index - 1];
    const nextId = stopIds[index];
    const prevJourneyS = LANTERN_ROUTE_JOURNEY.stopJourneySById[prevId] ?? 0;
    const nextJourneyS = LANTERN_ROUTE_JOURNEY.stopJourneySById[nextId] ?? 1;
    if (journeyS <= nextJourneyS + 1e-9) {
      const span = nextJourneyS - prevJourneyS || 1;
      const t = (journeyS - prevJourneyS) / span;
      return lerp(scaleAtStopIndex(index - 1), scaleAtStopIndex(index), clamp01(t));
    }
  }

  return scaleAtStopIndex(stopIds.length - 1);
}

export function opacityAtPathS(pathS: number): number {
  const fadeStart = lanternInitialPathS();
  const fadeEnd = lanternExitPathS();

  if (pathS > fadeEnd + 0.02) return 0;
  if (pathS <= fadeStart) return 1;

  const span = fadeEnd - fadeStart || 1;
  const t = (pathS - fadeStart) / span;
  return lerp(1, LANTERN_EXIT_STOP_OPACITY, clamp01(t));
}

/** Scale stays 1 on segment-0 fade; carousel uses scaleAtJourneyS. */
export function scaleAtPathS(pathS: number): number {
  if (pathS > lanternExitPathS() + 0.02) return 0;
  return 1;
}

export function isPathSOnFadeZone(pathS: number): boolean {
  const fadeStart = lanternInitialPathS();
  const fadeEnd = lanternExitPathS();
  return pathS > fadeStart && pathS <= fadeEnd;
}

export function opacityAtJourneyS(journeyS: number): number {
  if (journeyS > 1) return 0;
  return 1;
}
