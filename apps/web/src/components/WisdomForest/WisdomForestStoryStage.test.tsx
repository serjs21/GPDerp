import { fireEvent, render, screen } from "@testing-library/react";
import type { RefObject } from "react";
import {
  computeStackStep,
  getStackSlotHeightPx,
} from "./wisdomForestStackScroll";
import { WisdomForestStoryStage } from "./WisdomForestStoryStage";

jest.mock("./WisdomForestView", () => ({
  WisdomForestView: ({
    scrollRootRef,
    className,
    onActiveCardIndexChange,
  }: {
    scrollRootRef?: RefObject<HTMLDivElement | null>;
    className?: string;
    onActiveCardIndexChange?: (index: number) => void;
  }) => {
    const clientHeight = 600;
    const slotHeight = getStackSlotHeightPx(clientHeight);
    const cardCount = 6;
    const listHeight = slotHeight * cardCount + (clientHeight - slotHeight);

    const bindRef = (node: HTMLDivElement | null) => {
      if (scrollRootRef) {
        scrollRootRef.current = node;
      }
      if (!node || (node as HTMLDivElement & { __bound?: boolean }).__bound) return;
      (node as HTMLDivElement & { __bound?: boolean }).__bound = true;
      Object.defineProperty(node, "clientHeight", { configurable: true, value: clientHeight });
      Object.defineProperty(node, "scrollHeight", { configurable: true, value: listHeight });
      Object.defineProperty(node, "scrollTop", { configurable: true, writable: true, value: 0 });
    };

    return (
      <div
        ref={bindRef}
        data-testid="forest"
        className={className}
        aria-label="Haiku preview forest"
        style={{ height: clientHeight, overflow: "auto" }}
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop;
          const index = Math.round(top / slotHeight);
          onActiveCardIndexChange?.(index);
        }}
      >
        <div data-testid="scroll-list" style={{ height: listHeight }} />
      </div>
    );
  },
}));

const mockHaikus = Array.from({ length: 6 }, (_, i) => ({
  id: `haiku-${i}`,
  body: `line one\nline two\nline three`,
  title: `Haiku ${i + 1}`,
  titleSuffix: 0,
  createdAt: new Date().toISOString(),
  accountId: "00000000-0000-4000-8000-000000000001",
  createdById: "00000000-0000-4000-8000-000000000002",
  labels: [],
}));

const stageProps = {
  haikus: mockHaikus,
  isInitialLoading: false,
  isFetchingNextPage: false,
  isError: false,
  hasNextPage: false,
  onLoadMore: jest.fn(),
  onRetry: jest.fn(),
  PreviewCard: () => null,
  Loader: () => null,
};

function cardLabel(active: number, total: number): string {
  return `Card ${active} of ${total} (newest → oldest)`;
}

describe("WisdomForestStoryStage", () => {
  it("updates card label when Older is pressed", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    expect(screen.getByText(cardLabel(1, 6))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Older" }));

    expect(screen.getByText(cardLabel(2, 6))).toBeInTheDocument();
  });

  it("updates card label when Newer is pressed after stepping older", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Older" }));
    fireEvent.click(screen.getByRole("button", { name: "Newer" }));

    expect(screen.getByText(cardLabel(1, 6))).toBeInTheDocument();
  });

  it("disables Older at the last card", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    const older = screen.getByRole("button", { name: "Older" });
    const slot = getStackSlotHeightPx(600);

    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(older);
    }

    expect(computeStackStep(slot * 5, 1, slot, slot * 5, 6).activeCardIndex).toBe(5);
    expect(screen.getByText(cardLabel(6, 6))).toBeInTheDocument();
    expect(older).toBeDisabled();
  });
});
