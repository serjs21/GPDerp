import { renderHook } from "@testing-library/react";
import { useScrollOnContent } from "./useScrollOnContent";

let mockResizeObserver: { observe: jest.Mock; disconnect: jest.Mock };
let mockMutationObserver: { observe: jest.Mock; disconnect: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();

  mockResizeObserver = { observe: jest.fn(), disconnect: jest.fn() };
  global.ResizeObserver = jest.fn(() => mockResizeObserver) as any;

  mockMutationObserver = { observe: jest.fn(), disconnect: jest.fn() };
  global.MutationObserver = jest.fn(() => mockMutationObserver) as any;
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const makeTextarea = (): HTMLTextAreaElement => {
  const el = document.createElement("textarea");
  Object.defineProperty(el, "scrollHeight", { value: 500, writable: true });
  el.value = "initial";
  return el;
};

describe("useScrollOnContent", () => {
  it("observes resize and mutation on mount", () => {
    const el = makeTextarea();
    const ref = { current: el };

    renderHook(() => useScrollOnContent(ref));

    expect(mockResizeObserver.observe).toHaveBeenCalledWith(el);
    expect(mockMutationObserver.observe).toHaveBeenCalledWith(el, {
      attributes: true,
      attributeFilter: ["value"],
    });
  });

  it("adds input event listener on mount", () => {
    const el = makeTextarea();
    const spy = jest.spyOn(el, "addEventListener");
    const ref = { current: el };

    renderHook(() => useScrollOnContent(ref));

    expect(spy).toHaveBeenCalledWith("input", expect.any(Function));
  });

  it("cleans up all listeners and observers on unmount", () => {
    const el = makeTextarea();
    const removeSpy = jest.spyOn(el, "removeEventListener");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const ref = { current: el };

    const { unmount } = renderHook(() => useScrollOnContent(ref));
    unmount();

    expect(mockResizeObserver.disconnect).toHaveBeenCalled();
    expect(mockMutationObserver.disconnect).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith("input", expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("scrolls to end when input event fires", () => {
    const el = makeTextarea();
    const ref = { current: el };

    renderHook(() => useScrollOnContent(ref));
    el.dispatchEvent(new Event("input"));

    expect(el.scrollTop).toBe(500);
  });

  it("scrolls to end on polling when value changes", () => {
    const el = makeTextarea();
    const ref = { current: el };

    renderHook(() => useScrollOnContent(ref));

    el.value = "new content";
    jest.advanceTimersByTime(100);

    expect(el.scrollTop).toBe(500);
  });

  it("does nothing when ref is null", () => {
    const ref = { current: null };

    renderHook(() => useScrollOnContent(ref));

    expect(mockResizeObserver.observe).not.toHaveBeenCalled();
  });
});
