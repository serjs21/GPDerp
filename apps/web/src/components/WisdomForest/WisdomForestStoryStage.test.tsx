import { fireEvent, render, screen } from "@testing-library/react";
import type { RefObject } from "react";
import { getDefaultScrollTop, getStackSlotHeightPx } from "./wisdomForestStackScroll";
import { WisdomForestStoryStage } from "./WisdomForestStoryStage";

const ROOT_FONT_SIZE = 16;
const CLIENT_HEIGHT = 600;

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
    const slotHeight = getStackSlotHeightPx(ROOT_FONT_SIZE);
    const cardCount = 6;
    const defaultScrollTop = getDefaultScrollTop(cardCount, slotHeight);

    const bindRef = (node: HTMLDivElement | null) => {
      if (scrollRootRef) {
        scrollRootRef.current = node;
      }
      if (!node || (node as HTMLDivElement & { __bound?: boolean }).__bound) return;
      (node as HTMLDivElement & { __bound?: boolean }).__bound = true;
      Object.defineProperty(node, "clientHeight", { configurable: true, value: CLIENT_HEIGHT });
      Object.defineProperty(node, "scrollHeight", {
        configurable: true,
        value: defaultScrollTop + CLIENT_HEIGHT,
      });
      Object.defineProperty(node, "scrollTop", {
        configurable: true,
        writable: true,
        value: defaultScrollTop,
      });
      onActiveCardIndexChange?.(cardCount - 1);
    };

    return (
      <div
        ref={bindRef}
        data-testid="forest"
        className={className}
        aria-label="Haiku preview forest"
        style={{ height: CLIENT_HEIGHT, overflow: "auto", fontSize: `${ROOT_FONT_SIZE}px` }}
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop;
          const index = Math.round(top / slotHeight);
          onActiveCardIndexChange?.(index);
        }}
      >
        <div data-testid="scroll-list" style={{ height: defaultScrollTop + CLIENT_HEIGHT }} />
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
  it("starts at the last card", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    expect(screen.getByText(cardLabel(6, 6))).toBeInTheDocument();
  });

  it("updates card label when Newer is pressed from the default bottom position", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Newer" }));

    expect(screen.getByText(cardLabel(5, 6))).toBeInTheDocument();
  });

  it("updates card label when Older is pressed after stepping newer", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Newer" }));
    fireEvent.click(screen.getByRole("button", { name: "Older" }));

    expect(screen.getByText(cardLabel(6, 6))).toBeInTheDocument();
  });

  it("disables Newer at the first card", () => {
    render(<WisdomForestStoryStage {...stageProps} />);
    const newer = screen.getByRole("button", { name: "Newer" });

    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(newer);
    }

    expect(screen.getByText(cardLabel(1, 6))).toBeInTheDocument();
    expect(newer).toBeDisabled();
  });
});
