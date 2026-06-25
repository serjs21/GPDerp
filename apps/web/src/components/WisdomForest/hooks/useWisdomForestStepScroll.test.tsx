import { act, renderHook } from "@testing-library/react";
import { getDefaultScrollTop, getStackSlotHeightPx } from "../wisdomForestStackScroll";
import { useWisdomForestStepScroll } from "./useWisdomForestStepScroll";

const ROOT_FONT_SIZE = 16;
const mockHaikus = Array.from({ length: 6 }, (_, i) => ({
  id: `haiku-${i}`,
  body: "one\ntwo\nthree",
  title: `Haiku ${i + 1}`,
  titleSuffix: 0,
  createdAt: new Date().toISOString(),
  accountId: "00000000-0000-4000-8000-000000000001",
  createdById: "00000000-0000-4000-8000-000000000002",
  labels: [],
}));

describe("useWisdomForestStepScroll", () => {
  it("starts at the last card index", () => {
    const { result } = renderHook(() => useWisdomForestStepScroll({ haikus: mockHaikus }));
    expect(result.current.activeCardIndex).toBe(5);
    expect(result.current.cardCount).toBe(6);
  });

  it("steps to the previous card on Newer", () => {
    const slot = getStackSlotHeightPx(ROOT_FONT_SIZE);
    const { result } = renderHook(() => useWisdomForestStepScroll({ haikus: mockHaikus }));

    const root = document.createElement("div");
    Object.defineProperty(root, "scrollTop", { configurable: true, writable: true, value: 0 });
    Object.defineProperty(window, "getComputedStyle", {
      configurable: true,
      value: () => ({ fontSize: `${ROOT_FONT_SIZE}px` }),
    });
    result.current.forestRef.current = root;
    root.scrollTop = getDefaultScrollTop(6, slot);

    act(() => {
      result.current.stepScroll(-1);
    });

    expect(result.current.activeCardIndex).toBe(4);
    expect(root.scrollTop).toBe(slot * 4);
  });
});
