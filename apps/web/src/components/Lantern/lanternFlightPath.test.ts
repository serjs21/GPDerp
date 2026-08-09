import {
  LANTERN_EXIT_STOP_OPACITY,
  LANTERN_FLIGHT_PATH_FADE,
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  getLanternJourneyTransform,
  isLanternVisibleAtJourneyS,
  isLanternVisibleAtPathS,
  lanternExitPathS,
  lanternInitialPathS,
  LANTERN_FLIGHT_PATH_STOPS,
  sampleLanternJourney,
  sampleLanternSegment0,
  scaleAtJourneyS,
  scaleAtStopIndex,
} from "./path";
import {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  routeStopById,
} from "./path";
import {
  LANTERN_FADE_SEGMENT_SAMPLER,
  pointAtFlightArcLength,
  projectViewBoxPointToFlightS,
} from "./path";

describe("lantern path geometry", () => {
  describe("sampleLanternJourney", () => {
    it("is full scale at stop-1 and zero scale at stop-16", () => {
      const start = sampleLanternJourney(0);
      const end = sampleLanternJourney(1);
      expect(start.scale).toBeCloseTo(1, 5);
      expect(end.scale).toBeCloseTo(0, 5);
    });

    it("collapses past stop-16", () => {
      expect(scaleAtJourneyS(1.01)).toBe(0);
      expect(sampleLanternJourney(1.01).scale).toBe(0);
      expect(isLanternVisibleAtJourneyS(1.01)).toBe(false);
    });

    it("keeps carousel opacity at 1 on stops 1–16", () => {
      expect(getLanternJourneyTransform(0).opacity).toBe(1);
      expect(getLanternJourneyTransform(1).opacity).toBe(1);
    });
  });

  describe("scaleAtStopIndex", () => {
    it("is full scale at stop-1 and collapses at stop-16", () => {
      expect(scaleAtStopIndex(0)).toBeCloseTo(1, 5);
      expect(scaleAtStopIndex(15)).toBeCloseTo(0, 5);
      expect(scaleAtStopIndex(16)).toBe(0);
    });
  });

  describe("sampleLanternSegment0", () => {
    it("fades opacity toward stop-0", () => {
      const rest = sampleLanternSegment0(lanternInitialPathS());
      const exit = sampleLanternSegment0(lanternExitPathS());
      expect(rest.opacity).toBe(1);
      expect(exit.opacity).toBeCloseTo(LANTERN_EXIT_STOP_OPACITY, 5);
    });

    it("hides past the exit", () => {
      expect(isLanternVisibleAtPathS(lanternExitPathS() + 0.1)).toBe(false);
    });
  });

  describe("route stops", () => {
    it("maps stop-0 and stop-1 pathS", () => {
      expect(routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID)?.pathS).toBe(1);
      expect(routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID)?.pathS).toBe(0);
    });

    it("exposes 16 carousel stops", () => {
      expect(LANTERN_CAROUSEL_STOP_IDS).toHaveLength(16);
      expect(LANTERN_FLIGHT_PATH_STOPS).toHaveLength(16);
    });
  });

  describe("fade segment sampler", () => {
    it("samples segment-0 between authored endpoints", () => {
      const start = pointAtFlightArcLength(lanternInitialPathS());
      const end = pointAtFlightArcLength(lanternExitPathS());
      expect(start.x).toBeGreaterThan(0);
      expect(end.x).toBeGreaterThanOrEqual(0);
      expect(LANTERN_FADE_SEGMENT_SAMPLER).toBeDefined();
    });

    it("projects viewBox points onto flight s", () => {
      const stop1 = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
      if (!stop1) throw new Error("missing stop-1");
      const projected = projectViewBoxPointToFlightS(stop1.cx, stop1.cy);
      expect(projected).toBeCloseTo(lanternInitialPathS(), 2);
    });
  });

  describe("constants", () => {
    it("uses stop-1 as initial flight path anchor", () => {
      expect(LANTERN_FLIGHT_PATH_INITIAL).toBe(0);
      expect(LANTERN_FLIGHT_PATH_FADE.minOpacity).toBe(LANTERN_EXIT_STOP_OPACITY);
      expect(LANTERN_FLIGHT_PATH_REST_EPSILON).toBeGreaterThan(0);
    });
  });
});
