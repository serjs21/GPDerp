import { LANTERN_FLIGHT_PATH_FADE } from "./lanternFlightPath.config";
import {
  lanternExitPathS,
  lanternInitialPathS,
  lanternJourneyStartPathS,
} from "./lanternRouteStops";

export {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  lanternExitPathS,
  lanternInitialPathS,
  lanternJourneyStartPathS,
  routeStopById,
  ROUTE_STOPS_BY_ID,
} from "./lanternRouteStops";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function opacityAtPathS(pathS: number): number {
  const { minOpacity } = LANTERN_FLIGHT_PATH_FADE;
  const fadeStart = lanternInitialPathS();
  const fadeEnd = lanternExitPathS();

  if (pathS > fadeEnd + 0.02) return 0;
  if (pathS <= fadeStart) return 1;

  const span = fadeEnd - fadeStart || 1;
  const t = (pathS - fadeStart) / span;
  return lerp(1, minOpacity, clamp01(t));
}

export function scaleAtPathS(pathS: number): number {
  const { exitScale } = LANTERN_FLIGHT_PATH_FADE;
  const fadeStart = lanternInitialPathS();
  const fadeEnd = lanternExitPathS();

  if (pathS > fadeEnd + 0.02) return 0;
  if (pathS <= fadeStart) return 1;

  const span = fadeEnd - fadeStart || 1;
  const t = (pathS - fadeStart) / span;
  return lerp(1, exitScale, clamp01(t));
}

export function isPathSOnFadeZone(pathS: number): boolean {
  const fadeStart = lanternInitialPathS();
  const fadeEnd = lanternExitPathS();
  return pathS > fadeStart + 1e-6 && pathS <= fadeEnd;
}
