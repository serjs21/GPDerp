import {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  lanternExitPathS,
  lanternInitialPathS,
  parseRouteStopCircles,
  ROUTE_STOPS_SVG,
  routeStopById,
} from "./lanternRouteStops";

describe("lanternRouteStops", () => {
  it("parses all 17 stop circles from the embedded SVG", () => {
    const stops = parseRouteStopCircles(ROUTE_STOPS_SVG);
    expect(stops).toHaveLength(17);
    expect(stops.map((stop) => stop.id)).toEqual(Array.from({ length: 17 }, (_, index) => index));
  });

  it("defines carousel ids stop-1 through stop-16", () => {
    expect(LANTERN_CAROUSEL_STOP_IDS).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    expect(LANTERN_FLIGHT_PATH_STOPS).toHaveLength(16);
  });

  it("anchors initial and exit stops at pathS 0 and 1", () => {
    expect(lanternInitialPathS()).toBe(0);
    expect(lanternExitPathS()).toBe(1);
    expect(routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID)?.pathS).toBe(0);
    expect(routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID)?.pathS).toBe(1);
  });

  it("projects every stop to a finite pathS", () => {
    for (const stopId of LANTERN_CAROUSEL_STOP_IDS) {
      const stop = routeStopById(stopId);
      expect(stop).toBeDefined();
      expect(Number.isFinite(stop?.pathS)).toBe(true);
    }
    expect(Number.isFinite(routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID)?.pathS)).toBe(true);
  });
});
