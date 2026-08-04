import { LANTERN_DEFAULT_MAX_STEPS } from "./constants";
import { LANTERN_FLIGHT_PATH_REST_EPSILON } from "./lanternFlightPath.config";
import {
  easeInOutCubic,
  getLanternTransformAtProgress,
  getLanternTransformAtStep,
  lanternTransformToCssVars,
  lerp,
} from "./lanternTransform";

describe("lanternTransform", () => {
  describe("getLanternTransformAtStep", () => {
    it("keeps step 0 at rest with percent positioning", () => {
      const start = getLanternTransformAtStep(0);
      expect(start.positionMode).toBe("percent");
      expect(start.scale).toBeCloseTo(1, 1);
      expect(start.opacity).toBe(1);
    });

    it("shrinks toward the path exit at the final step", () => {
      const end = getLanternTransformAtStep(LANTERN_DEFAULT_MAX_STEPS, LANTERN_DEFAULT_MAX_STEPS);
      expect(end.scale).toBe(0);
      expect(end.opacity).toBe(0);
    });

    it("floors fractional and clamps negative steps", () => {
      expect(getLanternTransformAtStep(1.9).scale).toBe(getLanternTransformAtStep(1).scale);
      expect(getLanternTransformAtStep(-3)).toEqual(getLanternTransformAtStep(0));
    });
  });

  describe("getLanternTransformAtProgress", () => {
    it("matches the rest pose at path progress 0", () => {
      const rest = getLanternTransformAtProgress(0);
      expect(rest.scale).toBeCloseTo(1, 1);
      expect(rest.opacity).toBe(1);
    });

    it("hides when the next lantern reaches rest", () => {
      const faded = getLanternTransformAtProgress(0.05, {
        nextLanternPathProgress: LANTERN_FLIGHT_PATH_REST_EPSILON,
      });
      expect(faded.opacity).toBe(0);
    });

    it("vanishes at the exit", () => {
      const exit = getLanternTransformAtProgress(1);
      expect(exit.scale).toBe(0);
      expect(exit.opacity).toBe(0);
    });

    it("clamps progress outside 0–1", () => {
      expect(getLanternTransformAtProgress(-1).scale).toBe(
        getLanternTransformAtProgress(0).scale,
      );
      expect(getLanternTransformAtProgress(2).scale).toBe(
        getLanternTransformAtProgress(1).scale,
      );
    });
  });

  describe("helpers", () => {
    it("lerps linearly", () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(-6, 6, 0.25)).toBe(-3);
    });

    it("eases in-out within unit interval", () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
      expect(easeInOutCubic(0.5)).toBe(0.5);
      expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
      expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
    });

    it("maps percent transform to CSS vars", () => {
      const vars = lanternTransformToCssVars({
        x: 0.42,
        y: 0.68,
        scale: 0.8,
        rotate: -6,
        opacity: 0.5,
        positionMode: "percent",
      }) as Record<string, string>;
      expect(vars["--lantern-left"]).toBe("42%");
      expect(vars["--lantern-top"]).toBe("68%");
      expect(vars["--lantern-scale"]).toBe("0.8");
      expect(vars["--lantern-rotate"]).toBe("-6deg");
      expect(vars["--lantern-opacity"]).toBe("0.5");
    });

    it("maps translate transform to CSS vars", () => {
      const vars = lanternTransformToCssVars({
        x: 10,
        y: -20,
        scale: 0.8,
        rotate: -6,
        positionMode: "translate",
      }) as Record<string, string>;
      expect(vars["--lantern-x"]).toBe("10px");
      expect(vars["--lantern-y"]).toBe("-20px");
      expect(vars["--lantern-opacity"]).toBe("1");
    });
  });
});
