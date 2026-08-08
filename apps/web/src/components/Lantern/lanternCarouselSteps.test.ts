import {
  buildCarouselLanternJourneyS,
  clampCarouselStepIndex,
  getCarouselLanternStopIndex,
  getCarouselStepBounds,
  hasLanternOnStop1,
  isCarouselLanternVisibleAtStep,
  isCarouselStepAllowed,
} from "./lanternCarouselSteps";
import { journeySForCarouselStep } from "./lanternRouteStops";

describe("lanternCarouselSteps", () => {
  describe("getCarouselStepBounds", () => {
    it("returns empty range for zero lanterns", () => {
      expect(getCarouselStepBounds(0)).toEqual({ minStepIndex: 0, maxStepIndex: -1 });
    });

    it("locks a single lantern to stop-1", () => {
      expect(getCarouselStepBounds(1)).toEqual({ minStepIndex: 0, maxStepIndex: 0 });
    });

    it("deploys three lanterns from stop-1 through stop-3", () => {
      expect(getCarouselStepBounds(3)).toEqual({ minStepIndex: 0, maxStepIndex: 2 });
    });
  });

  describe("clampCarouselStepIndex", () => {
    it("clamps below min and above max for three lanterns", () => {
      expect(clampCarouselStepIndex(-1, 3)).toBe(0);
      expect(clampCarouselStepIndex(2, 3)).toBe(2);
      expect(clampCarouselStepIndex(20, 3)).toBe(2);
    });

    it("keeps a single lantern on step 0", () => {
      expect(clampCarouselStepIndex(-2, 1)).toBe(0);
      expect(clampCarouselStepIndex(5, 1)).toBe(0);
    });
  });

  describe("isCarouselStepAllowed", () => {
    it("rejects steps when lantern count is zero", () => {
      expect(isCarouselStepAllowed(0, 0)).toBe(false);
    });

    it("allows only step 0 for a single lantern", () => {
      expect(isCarouselStepAllowed(0, 1)).toBe(true);
      expect(isCarouselStepAllowed(1, 1)).toBe(false);
    });

    it("allows deploy steps 0 through 2 for three lanterns", () => {
      expect(isCarouselStepAllowed(0, 3)).toBe(true);
      expect(isCarouselStepAllowed(2, 3)).toBe(true);
      expect(isCarouselStepAllowed(3, 3)).toBe(false);
    });
  });

  describe("isCarouselLanternVisibleAtStep", () => {
    it("shows only the lead lantern at step 0", () => {
      expect(isCarouselLanternVisibleAtStep(0, 0)).toBe(true);
      expect(isCarouselLanternVisibleAtStep(0, 1)).toBe(false);
    });

    it("shows all lanterns when fully deployed", () => {
      expect(isCarouselLanternVisibleAtStep(2, 2)).toBe(true);
      expect(isCarouselLanternVisibleAtStep(2, 0)).toBe(true);
    });
  });

  describe("hasLanternOnStop1", () => {
    it("is false when the list is empty", () => {
      expect(hasLanternOnStop1(2, 0)).toBe(false);
    });

    it("is true at the minimum deploy step for three lanterns", () => {
      expect(hasLanternOnStop1(0, 3)).toBe(true);
    });

    it("is true when the queue is fully deployed with oldest on stop-1", () => {
      expect(hasLanternOnStop1(2, 3)).toBe(true);
    });

    it("is false when the queue advances past stop-1 occupancy", () => {
      expect(hasLanternOnStop1(3, 3)).toBe(false);
    });
  });

  describe("buildCarouselLanternJourneyS", () => {
    it("returns an empty array for zero lanterns", () => {
      expect(buildCarouselLanternJourneyS(2, 0)).toEqual([]);
    });

    it("places a single lantern on stop-1", () => {
      const journey = buildCarouselLanternJourneyS(0, 1);
      expect(journey).toHaveLength(1);
      expect(journey[0]).toBeCloseTo(journeySForCarouselStep(0), 5);
    });

    it("places three lanterns on stops 3, 2, and 1 when fully deployed", () => {
      const journey = buildCarouselLanternJourneyS(2, 3);
      expect(journey).toHaveLength(3);
      expect(journey[0]).toBeCloseTo(journeySForCarouselStep(2), 5);
      expect(journey[1]).toBeCloseTo(journeySForCarouselStep(1), 5);
      expect(journey[2]).toBeCloseTo(journeySForCarouselStep(0), 5);
    });

    it("places the lead on stop-1 at the minimum deploy step", () => {
      const journey = buildCarouselLanternJourneyS(0, 3);
      expect(journey[0]).toBeCloseTo(journeySForCarouselStep(0), 5);
    });
  });

  describe("getCarouselLanternStopIndex", () => {
    it("maps lead offset to the step index", () => {
      expect(getCarouselLanternStopIndex(4, 0)).toBe(4);
      expect(getCarouselLanternStopIndex(4, 2)).toBe(2);
    });
  });
});
