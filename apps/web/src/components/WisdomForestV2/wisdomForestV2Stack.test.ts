import {
  getActiveCardIndex,
  getAnimationRangePercents,
  getDefaultScrollTop,
  getMaxContentScrollTop,
  getReverseIndex0,
  getScrollTopForCardIndex,
  getStackLiftRem,
  getStackScale,
  getStackSlotHeightPx,
  STACK_SCALE_BASE,
  STACK_SCALE_STEP,
} from "./wisdomForestV2Stack";

describe("wisdomForestV2Stack", () => {
  const slotHeightPx = getStackSlotHeightPx(16);

  it("defaults scroll to the latest card", () => {
    expect(getDefaultScrollTop(5, slotHeightPx)).toBe(getScrollTopForCardIndex(4, slotHeightPx));
    expect(getDefaultScrollTop(1, slotHeightPx)).toBe(0);
  });

  it("round-trips active card index with slot height", () => {
    for (let index = 0; index < 4; index++) {
      const scrollTop = getScrollTopForCardIndex(index, slotHeightPx);
      expect(getActiveCardIndex(scrollTop, slotHeightPx, 4)).toBe(index);
    }
  });

  it("decreases scale as depth increases", () => {
    expect(getStackScale(0)).toBe(STACK_SCALE_BASE);
    expect(getStackScale(1)).toBe(STACK_SCALE_BASE - STACK_SCALE_STEP);
    expect(getStackScale(2)).toBeLessThan(getStackScale(1));
  });

  it("increases lift as depth increases", () => {
    expect(getStackLiftRem(0)).toBe(0);
    expect(getStackLiftRem(2)).toBeGreaterThan(getStackLiftRem(1));
  });

  it("partitions animation ranges across cards", () => {
    const ranges = [1, 2, 3, 4].map((index) => getAnimationRangePercents(index, 4));
    expect(ranges[0]).toEqual({ start: "0%", end: "25%" });
    expect(ranges[3]).toEqual({ start: "75%", end: "100%" });
  });

  it("computes max scroll for card count", () => {
    expect(getMaxContentScrollTop(3, slotHeightPx)).toBe(2 * slotHeightPx);
  });

  it("computes reverse index from front", () => {
    expect(getReverseIndex0(4, 4)).toBe(0);
    expect(getReverseIndex0(1, 4)).toBe(3);
  });
});
