import {
  LANTERN_CAROUSEL_MIN_SCALE,
  LANTERN_FLIGHT_PATH_FADE,
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
} from "./lanternFlightPath.config";
import {
  equalArcLengthSamples,
  getLanternFlightOpacity,
  getLanternFlightTransform,
  getLanternJourneyTransform,
  getLanternQueuePathProgress,
  getLanternQueueRestPathS,
  isLanternFlightPathVisible,
  isLanternJourneyVisible,
  lanternExitPathS,
  lanternInitialPathS,
  LANTERN_FLIGHT_PATH_STOPS,
  sampleLanternFlightPath,
  sampleLanternJourney,
  scaleAtJourneyS,
  scaleAtStopIndex,
} from "./lanternFlightPath";
import {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  routeStopById,
} from "./lanternRouteStops";
import {
  LANTERN_FADE_SEGMENT_SAMPLER,
  pointAtFlightArcLength,
  projectViewBoxPointToFlightS,
} from "./lanternFlightPathSvg";

describe("lanternFlightPath", () => {
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
      expect(isLanternJourneyVisible(1.01)).toBe(false);
    });

    it("keeps carousel opacity at 1 on stops 1–16", () => {
      expect(getLanternJourneyTransform(0).opacity).toBe(1);
      expect(getLanternJourneyTransform(1).opacity).toBe(1);
    });
  });

  describe("scaleAtStopIndex", () => {
    const fullHeightPx = 17.5 * 16 * (505 / 330);

    it("is full scale at stop-1 and collapses at stop-16", () => {
      expect(scaleAtStopIndex(0)).toBeCloseTo(1, 5);
      expect(scaleAtStopIndex(15)).toBeCloseTo(0, 5);
      expect(scaleAtStopIndex(16)).toBe(0);
    });

    it("shrinks exponentially in the tail (stop-14 ≈ 24px, stop-15 ≈ 12px)", () => {
      expect(scaleAtStopIndex(13) * fullHeightPx).toBeCloseTo(24, 0);
      expect(scaleAtStopIndex(14) * fullHeightPx).toBeCloseTo(12, 0);
    });
  });

  describe("sampleLanternFlightPath", () => {
    it("is full scale and opaque at rest on segment-0", () => {
      const rest = sampleLanternFlightPath(lanternInitialPathS());
      expect(rest.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: lanternInitialPathS() })).toBe(1);
      expect(rest.x).toBeCloseTo(LANTERN_FADE_SEGMENT_SAMPLER.pathEnd.x, 3);
      expect(rest.y).toBeCloseTo(LANTERN_FADE_SEGMENT_SAMPLER.pathEnd.y, 3);
    });

    it("fades opacity to zero at exit while keeping scale at 1", () => {
      const exit = sampleLanternFlightPath(lanternExitPathS());
      expect(exit.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: lanternExitPathS() })).toBeCloseTo(0, 2);
      expect(exit.x).toBeCloseTo(LANTERN_FADE_SEGMENT_SAMPLER.pathStart.x, 3);
      expect(exit.y).toBeCloseTo(LANTERN_FADE_SEGMENT_SAMPLER.pathStart.y, 3);
    });

    it("interpolates opacity in the fade zone with constant scale", () => {
      const midPathS = (lanternInitialPathS() + lanternExitPathS()) / 2;
      const mid = sampleLanternFlightPath(midPathS);
      expect(mid.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: midPathS })).toBeLessThan(1);
      expect(getLanternFlightOpacity({ pathT: midPathS })).toBeGreaterThan(0);
    });

    it("moves upward along the fade segment", () => {
      const rest = sampleLanternFlightPath(lanternInitialPathS());
      const exit = sampleLanternFlightPath(lanternExitPathS());
      expect(exit.y).toBeLessThan(rest.y);
    });

    it("hides samples past the exit via opacity", () => {
      expect(getLanternFlightOpacity({ pathT: lanternExitPathS() + 0.1 })).toBe(0);
      expect(isLanternFlightPathVisible(lanternExitPathS() + 0.1)).toBe(false);
    });
  });

  describe("projectViewBoxPointToFlightS", () => {
    it("returns finite pathS for authored stop coordinates", () => {
      const initial = routeStopById(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
      const exit = routeStopById(LANTERN_FLIGHT_PATH_EXIT_STOP_ID);
      expect(initial).toBeDefined();
      expect(exit).toBeDefined();
      if (!initial || !exit) return;

      expect(Number.isFinite(projectViewBoxPointToFlightS(initial.cx, initial.cy))).toBe(true);
      expect(Number.isFinite(projectViewBoxPointToFlightS(exit.cx, exit.cy))).toBe(true);
    });
  });

  describe("LANTERN_FLIGHT_PATH_STOPS", () => {
    it("lists carousel journey positions in stop-id order", () => {
      expect(LANTERN_FLIGHT_PATH_STOPS.length).toBe(16);
      expect(LANTERN_CAROUSEL_STOP_IDS[0]).toBe(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
      expect(LANTERN_CAROUSEL_STOP_IDS.at(-1)).toBe(16);
      expect(LANTERN_FLIGHT_PATH_STOPS[0]).toBeCloseTo(0, 5);
      expect(LANTERN_FLIGHT_PATH_STOPS.at(-1)).toBeCloseTo(1, 5);
    });
  });

  describe("equalArcLengthSamples", () => {
    it("produces roughly equal Euclidean spacing along the fade segment", () => {
      const samples = equalArcLengthSamples(8);
      const distances = samples.slice(1).map((s, index) => {
        const a = pointAtFlightArcLength(samples[index]);
        const b = pointAtFlightArcLength(s);
        return Math.hypot(b.x - a.x, b.y - a.y);
      });
      const average = distances.reduce((sum, value) => sum + value, 0) / distances.length;

      for (const distance of distances) {
        expect(distance).toBeGreaterThan(0);
        expect(distance / average).toBeGreaterThan(0.4);
        expect(distance / average).toBeLessThan(2.2);
      }
    });
  });

  describe("getLanternFlightOpacity", () => {
    it("fades along the wheel exit segment only", () => {
      expect(getLanternFlightOpacity({ journeyS: 0.5 })).toBe(1);
      const midFade = getLanternFlightOpacity({
        pathT: (lanternInitialPathS() + lanternExitPathS()) / 2,
      });
      const endFade = getLanternFlightOpacity({ pathT: lanternExitPathS() });
      expect(midFade).toBeLessThan(1);
      expect(endFade).toBeCloseTo(LANTERN_FLIGHT_PATH_FADE.minOpacity, 2);
    });
  });

  describe("getLanternQueuePathProgress", () => {
    it("places the newest lantern at stop-1 when scroll is 0", () => {
      expect(getLanternQueuePathProgress(0, 2, 3)).toBeCloseTo(lanternInitialPathS(), 3);
    });

    it("assigns older lanterns to higher stop ids at rest", () => {
      expect(getLanternQueueRestPathS(1, 3)).toBeCloseTo(LANTERN_FLIGHT_PATH_STOPS[1] ?? 0, 3);
      expect(getLanternQueueRestPathS(0, 3)).toBeCloseTo(LANTERN_FLIGHT_PATH_STOPS[2] ?? 0, 3);
    });

    it("moves the lead lantern toward exit on scroll", () => {
      const start = getLanternQueuePathProgress(0, 2, 3);
      const end = getLanternQueuePathProgress(1, 2, 3);
      expect(end).toBeGreaterThan(start);
      expect(end).toBeCloseTo(lanternExitPathS(), 2);
    });

    it("keeps followers on carousel stops at scroll 0", () => {
      expect(getLanternQueuePathProgress(0, 1, 3)).toBeCloseTo(LANTERN_FLIGHT_PATH_STOPS[1] ?? 0, 3);
      expect(getLanternQueuePathProgress(0, 0, 3)).toBeCloseTo(LANTERN_FLIGHT_PATH_STOPS[2] ?? 0, 3);
    });
  });

  describe("getLanternFlightTransform", () => {
    it("returns percent positioning with opacity", () => {
      const transform = getLanternFlightTransform(lanternExitPathS());
      expect(transform.positionMode).toBe("percent");
      expect(transform.opacity).toBeCloseTo(LANTERN_FLIGHT_PATH_FADE.minOpacity, 2);
    });
  });

  describe("getLanternQueuePathProgress legacy anchor", () => {
    it("anchors the lead lantern at rest when scroll is 0 for a single lantern", () => {
      expect(getLanternQueuePathProgress(0, 0, 1)).toBeCloseTo(
        LANTERN_FLIGHT_PATH_INITIAL,
        3,
      );
    });
  });
});
