import {
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
import {
  equalArcLengthSamples,
  getLanternFlightOpacity,
  getLanternFlightTransform,
  getLanternQueuePathProgress,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import { pointAtArcLength, getArcLengthTable, LANTERN_FLIGHT_PATH_VIEWBOX } from "./lanternFlightPathSvg";

describe("lanternFlightPath", () => {
  describe("sampleLanternFlightPath", () => {
    it("scales up from left to the initial trough", () => {
      const start = sampleLanternFlightPath(0);
      const initial = sampleLanternFlightPath(LANTERN_FLIGHT_PATH_INITIAL);
      expect(start.scale).toBeLessThan(initial.scale);
      expect(initial.scale).toBeCloseTo(1, 5);
    });

    it("continues scaling up after the initial trough toward exit", () => {
      const initial = sampleLanternFlightPath(LANTERN_FLIGHT_PATH_INITIAL);
      const exit = sampleLanternFlightPath(1);
      expect(exit.scale).toBeGreaterThan(initial.scale);
    });

    it("moves rightward along the path", () => {
      const start = sampleLanternFlightPath(0);
      const end = sampleLanternFlightPath(1);
      expect(end.x).toBeGreaterThan(start.x);
    });

    it("places the initial arc-length sample at the global max Y", () => {
      const table = getArcLengthTable();
      const maxEntryY =
        Math.max(...table.map((entry) => entry.y)) / LANTERN_FLIGHT_PATH_VIEWBOX.height;
      const initialPoint = pointAtArcLength(LANTERN_FLIGHT_PATH_INITIAL);
      expect(initialPoint.y).toBeCloseTo(maxEntryY, 4);
    });
  });

  describe("equalArcLengthSamples", () => {
    it("produces roughly equal Euclidean spacing along the SVG path", () => {
      const samples = equalArcLengthSamples(8);
      const distances = samples.slice(1).map((s, index) => {
        const a = pointAtArcLength(samples[index]);
        const b = pointAtArcLength(s);
        return Math.hypot(b.x - a.x, b.y - a.y);
      });
      const average = distances.reduce((sum, value) => sum + value, 0) / distances.length;

      for (const distance of distances) {
        expect(distance).toBeGreaterThan(0);
        expect(distance / average).toBeGreaterThan(0.45);
        expect(distance / average).toBeLessThan(2.2);
      }
    });
  });

  describe("getLanternFlightOpacity", () => {
    it("is fully opaque at and before the initial point", () => {
      expect(
        getLanternFlightOpacity({ pathT: LANTERN_FLIGHT_PATH_INITIAL - 0.1 }),
      ).toBe(1);
      expect(getLanternFlightOpacity({ pathT: LANTERN_FLIGHT_PATH_INITIAL })).toBe(1);
    });

    it("fades linearly after the initial point", () => {
      const midFade = getLanternFlightOpacity({ pathT: LANTERN_FLIGHT_PATH_INITIAL + 0.05 });
      const endFade = getLanternFlightOpacity({ pathT: 1 });
      expect(midFade).toBeLessThan(1);
      expect(endFade).toBeLessThan(midFade);
      expect(endFade).toBeCloseTo(0, 1);
    });
  });

  describe("getLanternFlightTransform", () => {
    it("returns percent positioning with partial fade past initial", () => {
      const transform = getLanternFlightTransform(LANTERN_FLIGHT_PATH_INITIAL + 0.05);
      expect(transform.positionMode).toBe("percent");
      expect(transform.opacity).toBeLessThan(1);
      expect(transform.opacity).toBeGreaterThan(0);
    });
  });

  describe("getLanternQueuePathProgress", () => {
    it("places the lead lantern at initial when scroll is 0", () => {
      expect(getLanternQueuePathProgress(0, 0, LANTERN_FLIGHT_QUEUE_SPACING)).toBe(
        LANTERN_FLIGHT_PATH_INITIAL,
      );
    });

    it("staggers followers behind the lead at scroll 0", () => {
      expect(getLanternQueuePathProgress(0, 1, LANTERN_FLIGHT_QUEUE_SPACING)).toBeCloseTo(
        LANTERN_FLIGHT_PATH_INITIAL - LANTERN_FLIGHT_QUEUE_SPACING,
        5,
      );
    });

    it("staggers lanterns along scroll progress", () => {
      const first = getLanternQueuePathProgress(0.5, 0, LANTERN_FLIGHT_QUEUE_SPACING);
      const second = getLanternQueuePathProgress(0.5, 1, LANTERN_FLIGHT_QUEUE_SPACING);
      expect(second).toBeLessThan(first);
    });

    it("reaches path end when scroll completes", () => {
      expect(getLanternQueuePathProgress(1, 0, LANTERN_FLIGHT_QUEUE_SPACING)).toBe(1);
    });
  });
});
