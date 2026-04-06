import { render, act } from "@testing-library/react";
import { useRef } from "react";
import { useEndOfContentScroll } from "./useEndOfContentScroll";

type IoInstance = {
  callback: IntersectionObserverCallback;
  observe: jest.Mock;
  disconnect: jest.Mock;
};

let lastIo: IoInstance | null = null;

beforeEach(() => {
  lastIo = null;
  global.IntersectionObserver = class IntersectionObserverMock {
    callback: IntersectionObserverCallback;
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    takeRecords = () => [] as IntersectionObserverEntry[];
    root: Element | null = null;
    rootMargin = "";
    thresholds: readonly number[] = [];

    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
      lastIo = { callback: cb, observe: this.observe, disconnect: this.disconnect };
    }
  } as unknown as typeof IntersectionObserver;
});

function Harness({
  onEnd,
  enabled,
}: {
  onEnd: () => void;
  enabled?: boolean;
}) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEndOfContentScroll(scrollRootRef, sentinelRef, onEnd, { enabled });
  return (
    <div ref={scrollRootRef} data-testid="root" style={{ height: 80, overflow: "auto" }}>
      <div style={{ height: 200 }} />
      <div ref={sentinelRef} data-testid="sentinel" />
    </div>
  );
}

describe("useEndOfContentScroll", () => {
  it("calls onEnd when the observer reports the sentinel intersecting", () => {
    const onEnd = jest.fn();
    render(<Harness onEnd={onEnd} />);

    expect(lastIo).not.toBeNull();

    act(() => {
      lastIo!.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("does not call onEnd when intersecting is false", () => {
    const onEnd = jest.fn();
    render(<Harness onEnd={onEnd} />);

    act(() => {
      lastIo!.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(onEnd).not.toHaveBeenCalled();
  });

  it("does not attach the observer when enabled is false", () => {
    const onEnd = jest.fn();
    render(<Harness onEnd={onEnd} enabled={false} />);

    expect(lastIo).toBeNull();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("disconnects on unmount", () => {
    const onEnd = jest.fn();
    const { unmount } = render(<Harness onEnd={onEnd} />);

    const disconnect = lastIo!.disconnect;
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
