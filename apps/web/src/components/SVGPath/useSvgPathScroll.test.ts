import { act, renderHook } from "@testing-library/react";
import { useSvgPathScroll } from "./useSvgPathScroll";

jest.mock("motion/react", () => ({
  animate: (_from: number, _to: number, options: { onUpdate?: (v: number) => void; onComplete?: () => void }) => {
    options.onUpdate?.(1);
    options.onComplete?.();
    return { stop: jest.fn() };
  },
}));

describe("useSvgPathScroll creation slot", () => {
  it("runs the creation fly-in scroll on an empty path, then snaps back to 0 on save", () => {
    const { result } = renderHook(() => useSvgPathScroll(0, 300, { creationSlotDurationMs: 2500 }));

    let started = false;
    act(() => {
      started = result.current.scrollToCreationSlot();
    });
    expect(started).toBe(true);
    expect(result.current.focusIndex).toBe(-1);
    expect(result.current.fromFocusIndex).toBe(-1);

    act(() => {
      result.current.snapToTop();
    });
    expect(result.current.focusIndex).toBe(0);
  });

  it("still scrolls to the creation slot on a non-empty path", () => {
    const { result } = renderHook(() => useSvgPathScroll(3, 300));
    act(() => {
      result.current.scrollToCreationSlot();
    });
    expect(result.current.focusIndex).toBe(-1);
  });
});
