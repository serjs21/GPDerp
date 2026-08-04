import {
  LANTERN_FLIGHT_PATH_FADE,
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
} from "./lanternFlightPath.config";
import {
  equalArcLengthSamples,
  getLanternFlightOpacity,
  getLanternFlightTransform,
  getLanternQueuePathProgress,
  getLanternQueueRestPathS,
  isLanternFlightPathVisible,
  lanternExitPathS,
  lanternInitialPathS,
  LANTERN_FLIGHT_PATH_STOPS,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import {
  LANTERN_CAROUSEL_STOP_IDS,
  LANTERN_FLIGHT_PATH_EXIT_STOP_ID,
  LANTERN_FLIGHT_PATH_INITIAL_STOP_ID,
  routeStopById,
} from "./lanternRouteStops";
import {
  getArcLengthTable,
  LANTERN_FLIGHT_PATH_VIEWBOX,
  pointAtFlightArcLength,
  projectViewBoxPointToFlightS,
} from "./lanternFlightPathSvg";

describe("lanternFlightPath", () => {
  describe("sampleLanternFlightPath", () => {
    it("is full scale and opaque at rest", () => {
      const rest = sampleLanternFlightPath(lanternInitialPathS());
      expect(rest.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: lanternInitialPathS() })).toBe(1);
    });

    it("keeps full scale and opacity on black-path stops", () => {
      const blackPathS = LANTERN_FLIGHT_PATH_STOPS.find((pathS) => pathS < -0.05) ?? -0.5;
      const black = sampleLanternFlightPath(blackPathS);
      expect(black.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: blackPathS })).toBe(1);
      expect(black.x).toBeGreaterThan(0);
      expect(black.y).toBeGreaterThan(0);
    });

    it("reaches fade floor and exit scale at the exit stop", () => {
      const exit = sampleLanternFlightPath(lanternExitPathS());
      expect(exit.scale).toBeCloseTo(LANTERN_FLIGHT_PATH_FADE.exitScale, 2);
      expect(getLanternFlightOpacity({ pathT: lanternExitPathS() })).toBeCloseTo(
        LANTERN_FLIGHT_PATH_FADE.minOpacity,
        2,
      );
    });

    it("interpolates opacity and scale in the fade zone", () => {
      const midPathS = (lanternInitialPathS() + lanternExitPathS()) / 2;
      const mid = sampleLanternFlightPath(midPathS);
      expect(mid.scale).toBeGreaterThan(1);
      expect(mid.scale).toBeLessThan(LANTERN_FLIGHT_PATH_FADE.exitScale);
      expect(getLanternFlightOpacity({ pathT: midPathS })).toBeLessThan(1);
      expect(getLanternFlightOpacity({ pathT: midPathS })).toBeGreaterThan(
        LANTERN_FLIGHT_PATH_FADE.minOpacity,
      );
    });

    it("moves upward along the flight segment", () => {
      const rest = sampleLanternFlightPath(lanternInitialPathS());
      const exit = sampleLanternFlightPath(lanternExitPathS());
      expect(exit.y).toBeLessThan(rest.y);
    });

    it("places rest at the global max Y on the perimeter", () => {
      const table = getArcLengthTable();
      const maxEntryY =
        Math.max(...table.map((entry) => entry.y)) / LANTERN_FLIGHT_PATH_VIEWBOX.height;
      const restPoint = pointAtFlightArcLength(lanternInitialPathS());
      expect(restPoint.y).toBeCloseTo(maxEntryY, 3);
    });

    it("hides samples past the exit", () => {
      expect(sampleLanternFlightPath(lanternExitPathS() + 0.1).scale).toBe(0);
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
    it("lists carousel stops in stop-id order", () => {
      expect(LANTERN_FLIGHT_PATH_STOPS.length).toBe(16);
      expect(LANTERN_CAROUSEL_STOP_IDS[0]).toBe(LANTERN_FLIGHT_PATH_INITIAL_STOP_ID);
      expect(LANTERN_CAROUSEL_STOP_IDS.at(-1)).toBe(16);
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
    it("fades along the red segment only", () => {
      const blackPathS = LANTERN_FLIGHT_PATH_STOPS[2] ?? -0.25;
      expect(getLanternFlightOpacity({ pathT: blackPathS })).toBe(1);
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

    it("keeps followers on black-path stops at scroll 0", () => {
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
