import {
  computeStackStep,
  getActiveCardIndex,
  getAnimationRangePercents,
  getCardsListBottomPaddingPx,
  getDefaultScrollTop,
  getMaxContentScrollTop,
  getReverseIndex,
  getWisdomForestCardCount,
  getReverseIndex0,
  getScrollTopForCardIndex,
  getStackPaddingTopRem,
  getStackScale,
  getStackSlotHeightPx,
  getStackTabStepPx,
  STACK_SCALE_BASE,
  STACK_SCALE_STEP,
  STACK_SLOT_HEIGHT_REM,
  STACK_TAB_STEP_REM,
} from "./wisdomForestStackScroll";

const ROOT_FONT_SIZE = 16;
const VIEWPORT = 600;

describe("getWisdomForestCardCount", () => {
  it("counts haikus plus generating draft", () => {
    expect(getWisdomForestCardCount([], null)).toBe(0);
    expect(getWisdomForestCardCount([{ id: "1" } as never], null)).toBe(1);
    expect(
      getWisdomForestCardCount([], {
        requestId: "r",
        subject: "s",
        content: "c",
        createdAtLabel: "t",
      }),
    ).toBe(1);
  });
});

describe("getStackSlotHeightPx", () => {
  it("returns rem-based slot height in pixels", () => {
    expect(getStackSlotHeightPx(ROOT_FONT_SIZE)).toBe(STACK_SLOT_HEIGHT_REM * ROOT_FONT_SIZE);
  });
});

describe("getCardsListBottomPaddingPx", () => {
  it("pads list so the last card can reach sticky top", () => {
    const cardCount = 6;
    const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);
    const tabStep = getStackTabStepPx(ROOT_FONT_SIZE);
    expect(getCardsListBottomPaddingPx(VIEWPORT, cardCount, ROOT_FONT_SIZE)).toBe(
      cardCount * tabStep + VIEWPORT - slot,
    );
  });
});

describe("getMaxContentScrollTop", () => {
  it("returns scroll offset for the last card", () => {
    const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);
    expect(getMaxContentScrollTop(6, slot)).toBe(slot * 5);
    expect(getDefaultScrollTop(6, slot)).toBe(slot * 5);
  });
});

describe("getActiveCardIndex", () => {
  const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);

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
  const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);
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
    const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);
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

describe("getStackPaddingTopRem", () => {
  it("offsets each card padding-top to form visible stack tabs", () => {
    expect(getStackPaddingTopRem(1)).toBe(STACK_TAB_STEP_REM);
    expect(getStackPaddingTopRem(2)).toBe(STACK_TAB_STEP_REM * 2);
    expect(getStackPaddingTopRem(4)).toBe(STACK_TAB_STEP_REM * 4);
  });
});

describe("getStackScale", () => {
  it("mirrors CSS keyframe scale reduction", () => {
    expect(getStackScale(1)).toBe(STACK_SCALE_BASE - STACK_SCALE_STEP);
    expect(getStackScale(4)).toBeCloseTo(STACK_SCALE_BASE - STACK_SCALE_STEP * 4);
  });

  it("matches reverse index from card position", () => {
    expect(getReverseIndex(1, 4)).toBe(4);
    expect(getStackScale(getReverseIndex(1, 4))).toBeCloseTo(STACK_SCALE_BASE - STACK_SCALE_STEP * 4);
    expect(getReverseIndex0(4, 4)).toBe(0);
    expect(getStackScale(getReverseIndex(4, 4))).toBe(1);
  });
});
