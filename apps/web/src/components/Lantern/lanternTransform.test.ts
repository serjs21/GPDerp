import { LANTERN_DEFAULT_MAX_STEPS } from "./constants";
import { LANTERN_FLIGHT_PATH_INITIAL } from "./lanternFlightPath.config";
import {
  easeInOutCubic,
  getLanternTransformAtProgress,
  getLanternTransformAtStep,
  lanternTransformToCssVars,
  lerp,
} from "./lanternTransform";

describe("lanternTransform", () => {
  describe("getLanternTransformAtStep", () => {
    it("keeps step 0 at the path start with percent positioning", () => {
      const start = getLanternTransformAtStep(0);
      expect(start.positionMode).toBe("percent");
      expect(start.scale).toBeLessThan(1);
      expect(start.opacity).toBe(1);
    });

    it("maps the final step near the path exit", () => {
      const end = getLanternTransformAtStep(LANTERN_DEFAULT_MAX_STEPS, LANTERN_DEFAULT_MAX_STEPS);
      const initial = getLanternTransformAtStep(
        Math.round(LANTERN_FLIGHT_PATH_INITIAL * LANTERN_DEFAULT_MAX_STEPS),
        LANTERN_DEFAULT_MAX_STEPS,
      );
      expect(end.scale).toBeGreaterThan(initial.scale);
    });

    it("floors fractional and clamps negative steps", () => {
      expect(getLanternTransformAtStep(1.9).scale).toBe(getLanternTransformAtStep(1).scale);
      expect(getLanternTransformAtStep(-3)).toEqual(getLanternTransformAtStep(0));
    });
  });

  describe("getLanternTransformAtProgress", () => {
    it("matches the initial trough at the configured progress", () => {
      const initial = getLanternTransformAtProgress(LANTERN_FLIGHT_PATH_INITIAL);
      expect(initial.scale).toBeCloseTo(1, 1);
      expect(initial.opacity).toBe(1);
    });

    it("fades after the initial point when the next lantern has not arrived", () => {
      const faded = getLanternTransformAtProgress(LANTERN_FLIGHT_PATH_INITIAL + 0.05);
      expect(faded.opacity).toBeLessThan(1);
    });

    it("hides when the next lantern reaches initial", () => {
      const hidden = getLanternTransformAtProgress(LANTERN_FLIGHT_PATH_INITIAL + 0.05, {
        nextLanternPathProgress: LANTERN_FLIGHT_PATH_INITIAL,
      });
      expect(hidden.opacity).toBe(0);
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
