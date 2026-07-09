import {
  LANTERN_DEFAULT_MAX_STEPS,
  LANTERN_ROTATE_DEG,
  LANTERN_SCALE_PER_STEP,
  LANTERN_STEP_X_PX,
  LANTERN_STEP_Y_PX,
} from "./constants";
import {
  easeInOutCubic,
  getLanternTransformAtProgress,
  getLanternTransformAtStep,
  lanternTransformToCssVars,
  lerp,
} from "./lanternTransform";

describe("lanternTransform", () => {
  describe("getLanternTransformAtStep", () => {
    it("keeps step 0 as the primary upright lantern", () => {
      expect(getLanternTransformAtStep(0)).toEqual({
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      });
    });

    it("scales down by LANTERN_SCALE_PER_STEP each step", () => {
      expect(getLanternTransformAtStep(1).scale).toBeCloseTo(LANTERN_SCALE_PER_STEP);
      expect(getLanternTransformAtStep(2).scale).toBeCloseTo(LANTERN_SCALE_PER_STEP ** 2);
      expect(getLanternTransformAtStep(3).scale).toBeCloseTo(LANTERN_SCALE_PER_STEP ** 3);
    });

    it("alternates rotation between -6 and +6 after step 0", () => {
      expect(getLanternTransformAtStep(1).rotate).toBe(-LANTERN_ROTATE_DEG);
      expect(getLanternTransformAtStep(2).rotate).toBe(LANTERN_ROTATE_DEG);
      expect(getLanternTransformAtStep(3).rotate).toBe(-LANTERN_ROTATE_DEG);
      expect(getLanternTransformAtStep(4).rotate).toBe(LANTERN_ROTATE_DEG);
    });

    it("moves diagonally up-right per step", () => {
      const step2 = getLanternTransformAtStep(2);
      expect(step2.x).toBe(2 * LANTERN_STEP_X_PX);
      expect(step2.y).toBe(2 * LANTERN_STEP_Y_PX);
      expect(step2.y).toBeLessThan(0);
      expect(step2.x).toBeGreaterThan(0);
    });

    it("floors fractional and clamps negative steps", () => {
      expect(getLanternTransformAtStep(1.9)).toEqual(getLanternTransformAtStep(1));
      expect(getLanternTransformAtStep(-3)).toEqual(getLanternTransformAtStep(0));
    });
  });

  describe("getLanternTransformAtProgress", () => {
    it("matches step endpoints at 0 and 1", () => {
      const start = getLanternTransformAtProgress(0, 4);
      const end = getLanternTransformAtProgress(1, 4);
      expect(start).toEqual(getLanternTransformAtStep(0));
      expect(end.scale).toBeCloseTo(getLanternTransformAtStep(4).scale);
      expect(end.x).toBeCloseTo(getLanternTransformAtStep(4).x);
      expect(end.y).toBeCloseTo(getLanternTransformAtStep(4).y);
    });

    it("interpolates continuously between adjacent steps", () => {
      const mid = getLanternTransformAtProgress(0.5 / LANTERN_DEFAULT_MAX_STEPS, LANTERN_DEFAULT_MAX_STEPS);
      // Near the start of the path (before heavy easing pulls), values sit between 0 and 1.
      const a = getLanternTransformAtStep(0);
      const b = getLanternTransformAtStep(1);
      expect(mid.scale).toBeLessThanOrEqual(a.scale);
      expect(mid.scale).toBeGreaterThanOrEqual(b.scale);
    });

    it("clamps progress outside 0–1", () => {
      expect(getLanternTransformAtProgress(-1, 3)).toEqual(getLanternTransformAtProgress(0, 3));
      expect(getLanternTransformAtProgress(2, 3)).toEqual(getLanternTransformAtProgress(1, 3));
    });

    it("defaults maxSteps to LANTERN_DEFAULT_MAX_STEPS", () => {
      expect(getLanternTransformAtProgress(1)).toEqual(
        getLanternTransformAtProgress(1, LANTERN_DEFAULT_MAX_STEPS),
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

    it("maps transform to CSS vars", () => {
      const vars = lanternTransformToCssVars({
        x: 10,
        y: -20,
        scale: 0.8,
        rotate: -6,
      }) as Record<string, string>;
      expect(vars["--lantern-x"]).toBe("10px");
      expect(vars["--lantern-y"]).toBe("-20px");
      expect(vars["--lantern-scale"]).toBe("0.8");
      expect(vars["--lantern-rotate"]).toBe("-6deg");
    });
  });
});
