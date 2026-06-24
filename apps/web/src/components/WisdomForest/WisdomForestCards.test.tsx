import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { WisdomForestCards } from "./WisdomForestCards";

const mockHaikus = [
  {
    id: "haiku-1",
    body: "one\ntwo\nthree",
    title: "Haiku 1",
    titleSuffix: 0,
    createdAt: new Date().toISOString(),
    accountId: "00000000-0000-4000-8000-000000000001",
    createdById: "00000000-0000-4000-8000-000000000002",
    labels: [],
  },
  {
    id: "haiku-2",
    body: "four\nfive\nsix",
    title: "Haiku 2",
    titleSuffix: 0,
    createdAt: new Date().toISOString(),
    accountId: "00000000-0000-4000-8000-000000000001",
    createdById: "00000000-0000-4000-8000-000000000002",
    labels: [],
  },
];

describe("WisdomForestCards", () => {
  it("renders sticky stack list with index vars", () => {
    const sentinelRef = createRef<HTMLLIElement>();
    const { container } = render(
      <WisdomForestCards
        haikus={mockHaikus}
        generatingDraft={null}
        isFetchingNextPage={false}
        PreviewCard={() => <div data-testid="card">card</div>}
        Loader={() => null}
        sentinelRef={sentinelRef}
      />,
    );

    const list = container.querySelector("ol");
    expect(list).toBeInTheDocument();

    const cards = Array.from(container.querySelectorAll("li")).filter(
      (li) => !li.hasAttribute("aria-hidden") && !li.textContent?.includes("loading"),
    );
    expect(cards).toHaveLength(2);
    expect(cards[0]?.getAttribute("style")).toContain("--index");
    expect(container.querySelectorAll('[class*="cardContent"]')).toHaveLength(2);
  });

  it("renders loader row when paginating", () => {
    const sentinelRef = createRef<HTMLLIElement>();
    render(
      <WisdomForestCards
        haikus={mockHaikus}
        generatingDraft={null}
        isFetchingNextPage
        PreviewCard={() => null}
        Loader={() => <span>loading</span>}
        sentinelRef={sentinelRef}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});
