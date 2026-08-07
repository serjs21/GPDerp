import { parsedRouteStops } from "./lanternRoutePath";
import {
  buildJourneyPath,
  journeySBetweenStopIds,
  journeySForStopId,
  pointAtJourneyS,
  sampleAlongSegment,
  sampleBetweenStopIds,
  sampleLanternJourneyPath,
  tangentAtJourneyS,
  type JourneyPath,
} from "./lanternRouteJourney";
import { LANTERN_FLIGHT_PATH_VIEWBOX } from "./lanternFlightPathSvg";

export type RouteStop = {
  id: number;
  cx: number;
  cy: number;
  x: number;
  y: number;
  /** Wheel exit fade parameter (stop-0 only). */
  pathS?: number;
};

export const LANTERN_FLIGHT_PATH_INITIAL_STOP_ID = 1;
export const LANTERN_FLIGHT_PATH_EXIT_STOP_ID = 0;

export const LANTERN_CAROUSEL_STOP_IDS = Array.from({ length: 16 }, (_, index) => index + 1);

function buildRouteStop(id: number, cx: number, cy: number): RouteStop {
  const stop: RouteStop = {
    id,
    cx,
    cy,
    x: cx / LANTERN_FLIGHT_PATH_VIEWBOX.width,
    y: cy / LANTERN_FLIGHT_PATH_VIEWBOX.height,
  };

  if (id === LANTERN_FLIGHT_PATH_EXIT_STOP_ID) {
    stop.pathS = 1;
  } else if (id === LANTERN_FLIGHT_PATH_INITIAL_STOP_ID) {
    stop.pathS = 0;
  }

  return stop;
}

const PARSED_ROUTE_STOPS = parsedRouteStops.circles.map(({ id, cx, cy }) =>
  buildRouteStop(id, cx, cy),
);

export const ROUTE_STOPS_BY_ID: Readonly<Record<number, RouteStop>> = Object.fromEntries(
  PARSED_ROUTE_STOPS.map((stop) => [stop.id, stop]),
);

export const LANTERN_ROUTE_JOURNEY: JourneyPath = buildJourneyPath(LANTERN_CAROUSEL_STOP_IDS);

/** Normalized journey positions for carousel stops stop-1 … stop-16. */
export const LANTERN_FLIGHT_PATH_STOPS: readonly number[] = LANTERN_CAROUSEL_STOP_IDS.map(
  (id) => journeySForStopId(LANTERN_ROUTE_JOURNEY, id),
);

export function lanternInitialJourneyS(): number {
  return journeySForStopId(LANTERN_ROUTE_JOURNEY, LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
}

export function lanternFinalJourneyS(): number {
  return journeySForStopId(
    LANTERN_ROUTE_JOURNEY,
    LANTERN_CAROUSEL_STOP_IDS[LANTERN_CAROUSEL_STOP_IDS.length - 1] ?? 16,
  );
}

export function lanternInitialPathS(): number {
  return ROUTE_STOPS_BY_ID[LANTERN_FLIGHT_PATH_INITIAL_STOP_ID]?.pathS ?? 0;
}

export function lanternExitPathS(): number {
  return ROUTE_STOPS_BY_ID[LANTERN_FLIGHT_PATH_EXIT_STOP_ID]?.pathS ?? 1;
}

export function lanternJourneyStartPathS(): number {
  return lanternFinalJourneyS();
}

export function routeStopById(id: number): RouteStop | undefined {
  return ROUTE_STOPS_BY_ID[id];
}

export function journeySForCarouselStep(stepIndex: number): number {
  const stopId = LANTERN_CAROUSEL_STOP_IDS[stepIndex] ?? LANTERN_FLIGHT_PATH_INITIAL_STOP_ID;
  return journeySForStopId(LANTERN_ROUTE_JOURNEY, stopId);
}

export function journeySBetweenCarouselSteps(
  fromStepIndex: number,
  toStepIndex: number,
  t: number,
): number {
  const fromId = LANTERN_CAROUSEL_STOP_IDS[fromStepIndex] ?? LANTERN_FLIGHT_PATH_INITIAL_STOP_ID;
  const toId = LANTERN_CAROUSEL_STOP_IDS[toStepIndex] ?? fromId;
  return journeySBetweenStopIds(LANTERN_ROUTE_JOURNEY, fromId, toId, t);
}

export {
  journeySBetweenStopIds,
  journeySForStopId,
  pointAtJourneyS,
  sampleAlongSegment,
  sampleBetweenStopIds,
  sampleLanternJourneyPath,
  tangentAtJourneyS,
};

export { LANTERN_FLIGHT_PATH_VIEWBOX };
