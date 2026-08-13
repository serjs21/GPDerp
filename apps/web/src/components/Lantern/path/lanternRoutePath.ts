import routeSvgMarkup from "../../../assets/routeSplitSegmentsExact";
import { parseRouteSvg } from "./routeStopsSvg.parse";
const parsedRoute = parseRouteSvg(routeSvgMarkup);

/** Authored sub-path `d` for `segment-N` (stop-N → stop-(N+1)). */
export const LANTERN_ROUTE_SEGMENTS: Readonly<Record<number, string>> = parsedRoute.segmentsById;

/** @deprecated Use LANTERN_ROUTE_SEGMENTS[0] for fade segment. */
export const LANTERN_ROUTE_BASE_PATH_D = parsedRoute.segmentsById[0] ?? "";

export const ROUTE_STOPS_SVG_MARKUP = routeSvgMarkup;

export const parsedRouteStops = parsedRoute;
