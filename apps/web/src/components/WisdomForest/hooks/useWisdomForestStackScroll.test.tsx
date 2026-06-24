import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { getStackSlotHeightPx } from "../wisdomForestStackScroll";
import { useWisdomForestStackScroll } from "./useWisdomForestStackScroll";

type IoInstance = {
  callback: IntersectionObserverCallback;
  observe: jest.Mock;
  disconnect: jest.Mock;
};

let lastIo: IoInstance | null = null;

beforeEach(() => {
  lastIo = null;
  global.ResizeObserver = class ResizeObserverMock {
    private readonly callback: ResizeObserverCallback;
    observe = jest.fn((target: Element) => {
      this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
    });
    disconnect = jest.fn();
    unobserve = jest.fn();
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
  } as unknown as typeof ResizeObserver;

  global.IntersectionObserver = class IntersectionObserverMock {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    takeRecords = () => [] as IntersectionObserverEntry[];
    root = null;
    rootMargin = "";
    thresholds = [];
    constructor(cb: IntersectionObserverCallback) {
      lastIo = { callback: cb, observe: this.observe, disconnect: this.disconnect };
    }
  } as unknown as typeof IntersectionObserver;
});

function Harness({
  cardCount = 6,
  onLoadMore = jest.fn(),
  hasNextPage = true,
}: {
  cardCount?: number;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
}) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const clientHeight = 600;
  const slotHeight = getStackSlotHeightPx(clientHeight);
  const { activeCardIndex, sentinelRef } = useWisdomForestStackScroll({
    scrollRootRef,
    cardCount,
    hasNextPage,
    isFetchingNextPage: false,
    onLoadMore,
  });

  const bindForestRef = (node: HTMLDivElement | null) => {
    scrollRootRef.current = node;
    if (!node) return;
    Object.defineProperty(node, "clientHeight", { configurable: true, value: clientHeight });
    Object.defineProperty(node, "scrollHeight", {
      configurable: true,
      value: slotHeight * cardCount + (clientHeight - slotHeight),
    });
  };

  return (
    <div>
      <div
        ref={bindForestRef}
        data-testid="forest"
        style={{ height: clientHeight, overflow: "auto" }}
      >
        {Array.from({ length: cardCount }, (_, i) => (
          <div key={i} style={{ height: slotHeight }} />
        ))}
        <li ref={sentinelRef} data-testid="sentinel" />
      </div>
      <p data-testid="active-index">{activeCardIndex}</p>
    </div>
  );
}

describe("useWisdomForestStackScroll", () => {
  it("reports active card index from scroll position", async () => {
    render(<Harness />);
    const forest = screen.getByTestId("forest");
    const slot = getStackSlotHeightPx(600);

    await act(async () => {
      Object.defineProperty(forest, "scrollTop", { configurable: true, value: slot * 2, writable: true });
      fireEvent.scroll(forest);
    });

    expect(screen.getByTestId("active-index")).toHaveTextContent("2");
  });

  it("calls onLoadMore when sentinel intersects", () => {
    const onLoadMore = jest.fn();
    render(<Harness onLoadMore={onLoadMore} />);

    expect(lastIo).not.toBeNull();
    lastIo!.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
