import { parseRouteSvg } from "./routeStopsSvg.parse";
import { parsedRouteStops } from "./lanternRoutePath";
import {
  journeySBetweenStopIds,
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  LANTERN_FLIGHT_PATH_STOPS,
  LANTERN_ROUTE_JOURNEY,
  lanternExitPathS,
  lanternInitialPathS,
  pointAtJourneyS,
  routeStopById,
  sampleAlongSegment,
  sampleBetweenStopIds,
} from "./lanternRouteStops";
import { getSegmentSampler } from "./lanternFlightPathSvg";

describe("lanternRouteStops", () => {
  it("parses all 16 segments and 17 stop circles from the route SVG", () => {
    expect(Object.keys(parsedRouteStops.segmentsById)).toHaveLength(16);
    expect(parsedRouteStops.circles).toHaveLength(17);
    expect(parsedRouteStops.circles.map((stop) => stop.id)).toEqual(
      Array.from({ length: 17 }, (_, index) => index),
    );
  });

  it("parses segment paths from markup", () => {
    const segmentMarkup = Array.from(
      { length: 16 },
      (_, id) => `<path id="segment-${id}" d="M${id},${id}"/>`,
    ).join("");
    const parsed = parseRouteSvg(
      `<svg>${segmentMarkup}<circle id="stop-1" cx="1" cy="2"/></svg>`,
    );
    expect(parsed.segmentsById[0]).toBe(`M0,0`);
    expect(parsed.segmentsById[1]).toBe(`M1,1`);
  });

  it("reads stop coordinates from the route SVG", () => {
    expect(routeStopById(2)?.cx).toBeCloseTo(642.59, 2);
    expect(routeStopById(3)?.cx).toBeCloseTo(209.59, 2);
    expect(routeStopById(7)?.cx).toBeCloseTo(1155.72, 2);
    expect(routeStopById(8)?.cx).toBeCloseTo(1377.96, 2);
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

  it("increases journeyS monotonically for stop ids 1 through 16", () => {
    const journeyValues = LANTERN_CAROUSEL_STOP_IDS.map(
      (stopId) => LANTERN_ROUTE_JOURNEY.stopJourneySById[stopId] ?? 0,
    );

    for (let index = 1; index < journeyValues.length; index += 1) {
      expect(journeyValues[index]).toBeGreaterThan(journeyValues[index - 1] ?? 0);
    }

    expect(journeyValues[0]).toBeCloseTo(0, 5);
    expect(journeyValues.at(-1)).toBeCloseTo(1, 5);
  });

  it("uses circle centers for stop x/y", () => {
    const stop = routeStopById(4);
    expect(stop).toBeDefined();
    if (!stop) return;

    expect(stop.x).toBeCloseTo(1 - stop.cx / 1920, 5);
    expect(stop.y).toBeCloseTo(stop.cy / 1080, 5);
  });

  it("mirrors stop x coordinates horizontally in normalized space", () => {
    const stop1 = routeStopById(1);
    expect(stop1).toBeDefined();
    if (!stop1) return;
    expect(stop1.x).toBeCloseTo(1 - 1325.15 / 1920, 2);
  });

  it("samples segment-1 for the midpoint between stop-1 and stop-2", () => {
    const stop1 = routeStopById(1);
    const stop2 = routeStopById(2);
    expect(stop1).toBeDefined();
    expect(stop2).toBeDefined();
    if (!stop1 || !stop2) return;

    const midpoint = pointAtJourneyS(
      LANTERN_ROUTE_JOURNEY,
      journeySBetweenStopIds(LANTERN_ROUTE_JOURNEY, 1, 2, 0.5),
    );
    const segmentMid = getSegmentSampler(1)?.pointAt(0.5);
    expect(segmentMid).toBeDefined();
    if (!segmentMid) return;

    expect(midpoint.x).toBeCloseTo(segmentMid.x, 3);
    expect(midpoint.y).toBeCloseTo(segmentMid.y, 3);

    const straightMidX = (stop1.x + stop2.x) / 2;
    const straightMidY = (stop1.y + stop2.y) / 2;
    const curveDelta = Math.hypot(midpoint.x - straightMidX, midpoint.y - straightMidY);
    expect(curveDelta).toBeGreaterThan(0.01);
  });

  it("maps segment-1 to stop-1 through stop-2", () => {
    const leg = LANTERN_ROUTE_JOURNEY.segments.find((segment) => segment.segmentIndex === 1);
    expect(leg).toBeDefined();
    expect(leg?.fromStopId).toBe(1);
    expect(leg?.toStopId).toBe(2);
  });

  it("samples along segment id via sampleAlongSegment", () => {
    const fromSampler = getSegmentSampler(1)?.pointAt(0.5);
    const sampled = sampleAlongSegment(1, 0.5);
    expect(fromSampler).toBeDefined();
    if (!fromSampler) return;
    expect(sampled.x).toBeCloseTo(fromSampler.x, 5);
    expect(sampled.y).toBeCloseTo(fromSampler.y, 5);
  });

  it("samples adjacent stops via sampleBetweenStopIds", () => {
    const adjacent = sampleBetweenStopIds(LANTERN_ROUTE_JOURNEY, 1, 2, 0.5);
    const segmentMid = getSegmentSampler(1)?.pointAt(0.5);
    expect(segmentMid).toBeDefined();
    if (!segmentMid) return;
    expect(adjacent.x).toBeCloseTo(segmentMid.x, 5);
    expect(adjacent.y).toBeCloseTo(segmentMid.y, 5);
  });
});
