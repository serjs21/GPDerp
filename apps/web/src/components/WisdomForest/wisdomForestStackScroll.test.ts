import {
  computeStackStep,
  getActiveCardIndex,
  getAnimationRangePercents,
  getCardsListBottomPaddingPx,
  getReverseIndex0,
  getScrollTopForCardIndex,
  getStackScale,
  getStackSlotHeightPx,
  getStackStickyTopRem,
  STACK_SCALE_STEP,
  STACK_TAB_STEP_REM,
  STACK_TOP_REM,
} from "./wisdomForestStackScroll";

const VIEWPORT = 600;

describe("getStackSlotHeightPx", () => {
  it("returns 12vh of viewport height in pixels", () => {
    expect(getStackSlotHeightPx(VIEWPORT)).toBe(72);
  });
});

describe("getCardsListBottomPaddingPx", () => {
  it("pads list so the last card can reach sticky top", () => {
    expect(getCardsListBottomPaddingPx(VIEWPORT)).toBe(528);
  });
});

describe("getActiveCardIndex", () => {
  const slot = getStackSlotHeightPx(VIEWPORT);

  it("returns 0 at scroll top", () => {
    expect(getActiveCardIndex(0, slot, 6)).toBe(0);
  });

  it("steps with slot height", () => {
    expect(getActiveCardIndex(slot, slot, 6)).toBe(1);
    expect(getActiveCardIndex(slot * 3, slot, 6)).toBe(3);
  });

  it("clamps to last card", () => {
    expect(getActiveCardIndex(slot * 100, slot, 6)).toBe(5);
  });
});

describe("computeStackStep", () => {
  const slot = getStackSlotHeightPx(VIEWPORT);
  const maxScroll = slot * 5;

  it("steps forward one card slot", () => {
    const result = computeStackStep(0, 1, slot, maxScroll, 6);
    expect(result.scrollTop).toBe(slot);
    expect(result.activeCardIndex).toBe(1);
  });

  it("steps backward one card slot", () => {
    const result = computeStackStep(slot, -1, slot, maxScroll, 6);
    expect(result.scrollTop).toBe(0);
    expect(result.activeCardIndex).toBe(0);
  });
});

describe("getScrollTopForCardIndex", () => {
  it("maps index to slot offsets", () => {
    const slot = getStackSlotHeightPx(VIEWPORT);
    expect(getScrollTopForCardIndex(2, slot)).toBe(slot * 2);
  });
});

describe("getAnimationRangePercents", () => {
  it("splits timeline into equal segments per card", () => {
    expect(getAnimationRangePercents(1, 4)).toEqual({ start: "0%", end: "25%" });
    expect(getAnimationRangePercents(2, 4)).toEqual({ start: "25%", end: "50%" });
    expect(getAnimationRangePercents(4, 4)).toEqual({ start: "75%", end: "100%" });
  });
});

describe("getStackStickyTopRem", () => {
  it("offsets each card sticky anchor to form visible stack tabs", () => {
    expect(getStackStickyTopRem(1)).toBe(STACK_TOP_REM);
    expect(getStackStickyTopRem(2)).toBe(STACK_TOP_REM + STACK_TAB_STEP_REM);
    expect(getStackStickyTopRem(4)).toBe(STACK_TOP_REM + STACK_TAB_STEP_REM * 3);
  });
});

describe("getStackScale", () => {
  it("mirrors CSS keyframe scale reduction", () => {
    expect(getStackScale(0)).toBe(1);
    expect(getStackScale(1)).toBeCloseTo(1 - STACK_SCALE_STEP);
  });

  it("matches reverse index from card position", () => {
    expect(getReverseIndex0(1, 4)).toBe(3);
    expect(getStackScale(getReverseIndex0(1, 4))).toBeCloseTo(1 - STACK_SCALE_STEP * 3);
  });
});
