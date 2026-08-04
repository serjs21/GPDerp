/**
 * Stop markers from `public/route_stops.svg` — keep in sync when editing that file.
 * Carousel: stop-1 (default) through stop-16. stop-0 is exit-only (fade handoff).
 */
import {
  LANTERN_FLIGHT_PATH_VIEWBOX,
  projectViewBoxPointToBlackPathS,
  projectViewBoxPointToFlightS,
} from "./lanternFlightPathSvg";

export const ROUTE_STOPS_SVG = `<g id="stops" fill="#001dff">
<circle id="stop-0" cx="1909.23" cy="101.90" r="7" />
<circle id="stop-1" cx="1325.15" cy="903.69" r="7" />
<circle id="stop-2" cx="209.59" cy="599.90" r="7" />
<circle id="stop-3" cx="642.59" cy="557.93" r="7" />
<circle id="stop-4" cx="966.39" cy="360.96" r="7" />
<circle id="stop-5" cx="559.29" cy="356.57" r="7" />
<circle id="stop-6" cx="209.78" cy="255.50" r="7" />
<circle id="stop-7" cx="1377.96" cy="231.78" r="7" />
<circle id="stop-8" cx="1155.72" cy="186.29" r="7" />
<circle id="stop-9" cx="1345.04" cy="123.69" r="7" />
<circle id="stop-10" cx="1194.87" cy="73.67" r="7" />
<circle id="stop-11" cx="1066.13" cy="73.36" r="7" />
<circle id="stop-12" cx="931.54" cy="58.28" r="7" />
<circle id="stop-13" cx="848.42" cy="46.56" r="7" />
<circle id="stop-14" cx="791.10" cy="52.07" r="7" />
<circle id="stop-15" cx="743.92" cy="51.98" r="7" />
<circle id="stop-16" cx="755.09" cy="12.91" r="7" />
</g>`;

export type RouteStop = {
  id: number;
  cx: number;
  cy: number;
  pathS: number;
  x: number;
  y: number;
};

const STOP_CIRCLE_PATTERN =
  /<circle\s+id="stop-(\d+)"\s+cx="([^"]+)"\s+cy="([^"]+)"[^/]*\/>/g;

export const LANTERN_FLIGHT_PATH_INITIAL_STOP_ID = 1;
export const LANTERN_FLIGHT_PATH_EXIT_STOP_ID = 0;

export function parseRouteStopCircles(svgMarkup: string): RouteStop[] {
  const stops: RouteStop[] = [];

  for (const match of svgMarkup.matchAll(STOP_CIRCLE_PATTERN)) {
    const id = Number(match[1]);
    const cx = Number(match[2]);
    const cy = Number(match[3]);
    let pathS = projectViewBoxPointToFlightS(cx, cy);

    if (id === LANTERN_FLIGHT_PATH_INITIAL_STOP_ID) {
      pathS = 0;
    } else if (id === LANTERN_FLIGHT_PATH_EXIT_STOP_ID) {
      pathS = 1;
    } else if (id > LANTERN_FLIGHT_PATH_INITIAL_STOP_ID) {
      pathS = projectViewBoxPointToBlackPathS(cx, cy);
    }

    stops.push({
      id,
      cx,
      cy,
      pathS,
      x: cx / LANTERN_FLIGHT_PATH_VIEWBOX.width,
      y: cy / LANTERN_FLIGHT_PATH_VIEWBOX.height,
    });
  }

  return stops.sort((a, b) => a.id - b.id);
}

const PARSED_ROUTE_STOPS = parseRouteStopCircles(ROUTE_STOPS_SVG);

export const ROUTE_STOPS_BY_ID: Readonly<Record<number, RouteStop>> = Object.fromEntries(
  PARSED_ROUTE_STOPS.map((stop) => [stop.id, stop]),
);

export const LANTERN_CAROUSEL_STOP_IDS = Array.from({ length: 16 }, (_, index) => index + 1);

/** Carousel `pathS` values in order: stop-1 (default) through stop-16. */
export const LANTERN_FLIGHT_PATH_STOPS: readonly number[] = LANTERN_CAROUSEL_STOP_IDS.map(
  (id) => ROUTE_STOPS_BY_ID[id]?.pathS ?? 0,
);

export function lanternInitialPathS(): number {
  return ROUTE_STOPS_BY_ID[LANTERN_FLIGHT_PATH_INITIAL_STOP_ID]?.pathS ?? 0;
}

export function lanternExitPathS(): number {
  return ROUTE_STOPS_BY_ID[LANTERN_FLIGHT_PATH_EXIT_STOP_ID]?.pathS ?? 1;
}

export function lanternJourneyStartPathS(): number {
  const lastCarouselId = LANTERN_CAROUSEL_STOP_IDS[LANTERN_CAROUSEL_STOP_IDS.length - 1];
  return ROUTE_STOPS_BY_ID[lastCarouselId]?.pathS ?? lanternInitialPathS();
}

export function routeStopById(id: number): RouteStop | undefined {
  return ROUTE_STOPS_BY_ID[id];
}
