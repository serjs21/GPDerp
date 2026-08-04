import {
  LANTERN_FLIGHT_PATH_INITIAL,
  LANTERN_FLIGHT_PATH_REST_EPSILON,
  LANTERN_FLIGHT_QUEUE_SPACING,
} from "./lanternFlightPath.config";
import {
  equalArcLengthSamples,
  getLanternFlightOpacity,
  getLanternFlightTransform,
  getLanternQueuePathProgress,
  isLanternFlightPathVisible,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import {
  getArcLengthTable,
  LANTERN_FLIGHT_PATH_VIEWBOX,
  pointAtFlightArcLength,
} from "./lanternFlightPathSvg";

describe("lanternFlightPath", () => {
  describe("sampleLanternFlightPath", () => {
    it("is full scale and opaque at rest", () => {
      const rest = sampleLanternFlightPath(0);
      expect(rest.scale).toBeCloseTo(1, 5);
      expect(getLanternFlightOpacity({ pathT: 0 })).toBe(1);
    });

    it("shrinks to zero at the exit", () => {
      const exit = sampleLanternFlightPath(1);
      expect(exit.scale).toBe(0);
      expect(getLanternFlightOpacity({ pathT: 1 })).toBe(0);
    });

    it("moves upward along the flight segment", () => {
      const rest = sampleLanternFlightPath(0);
      const exit = sampleLanternFlightPath(1);
      expect(exit.y).toBeLessThan(rest.y);
    });

    it("places rest at the global max Y on the perimeter", () => {
      const table = getArcLengthTable();
      const maxEntryY =
        Math.max(...table.map((entry) => entry.y)) / LANTERN_FLIGHT_PATH_VIEWBOX.height;
      const restPoint = pointAtFlightArcLength(0);
      expect(restPoint.y).toBeCloseTo(maxEntryY, 3);
    });

    it("places exit near the global min Y on the perimeter", () => {
      const table = getArcLengthTable();
      const minEntryY =
        Math.min(...table.map((entry) => entry.y)) / LANTERN_FLIGHT_PATH_VIEWBOX.height;
      const exitPoint = pointAtFlightArcLength(1);
      expect(Math.abs(exitPoint.y - minEntryY)).toBeLessThan(0.002);
      expect(exitPoint.y).toBeLessThan(pointAtFlightArcLength(0).y);
    });

    it("hides samples outside the flight segment", () => {
      expect(sampleLanternFlightPath(-0.2).scale).toBe(0);
      expect(sampleLanternFlightPath(1.2).scale).toBe(0);
      expect(isLanternFlightPathVisible(-0.2)).toBe(false);
    });
  });

  describe("equalArcLengthSamples", () => {
    it("produces roughly equal Euclidean spacing along the SVG path", () => {
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
    it("fades along the flight segment", () => {
      const midFade = getLanternFlightOpacity({ pathT: 0.5 });
      const endFade = getLanternFlightOpacity({ pathT: 1 });
      expect(midFade).toBeLessThan(1);
      expect(endFade).toBe(0);
    });

    it("forces invisibility when the next lantern reaches rest", () => {
      expect(
        getLanternFlightOpacity({
          pathT: 0.05,
          nextLanternPathT: LANTERN_FLIGHT_PATH_REST_EPSILON,
        }),
      ).toBe(0);
    });
  });

  describe("getLanternFlightTransform", () => {
    it("returns percent positioning with opacity", () => {
      const transform = getLanternFlightTransform(0.05, {
        nextLanternPathT: LANTERN_FLIGHT_PATH_REST_EPSILON,
      });
      expect(transform.positionMode).toBe("percent");
      expect(transform.opacity).toBe(0);
    });
  });

  describe("getLanternQueuePathProgress", () => {
    it("anchors the lead lantern at rest when scroll is 0", () => {
      expect(getLanternQueuePathProgress(0, 0, LANTERN_FLIGHT_QUEUE_SPACING)).toBe(
        LANTERN_FLIGHT_PATH_INITIAL,
      );
    });

    it("staggers followers behind the lead at scroll 0", () => {
      expect(getLanternQueuePathProgress(0, 1, LANTERN_FLIGHT_QUEUE_SPACING)).toBeCloseTo(
        -LANTERN_FLIGHT_QUEUE_SPACING,
        5,
      );
    });

    it("staggers lanterns along scroll progress", () => {
      const first = getLanternQueuePathProgress(0.5, 0, LANTERN_FLIGHT_QUEUE_SPACING);
      const second = getLanternQueuePathProgress(0.5, 1, LANTERN_FLIGHT_QUEUE_SPACING);
      expect(second).toBeLessThan(first);
    });

    it("reaches the exit when scroll completes", () => {
      expect(getLanternQueuePathProgress(1, 0, LANTERN_FLIGHT_QUEUE_SPACING)).toBe(1);
    });
  });
});
