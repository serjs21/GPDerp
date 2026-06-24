import { render } from "@testing-library/react";
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
    const { container } = render(
      <WisdomForestCards
        haikus={mockHaikus}
        generatingDraft={null}
        PreviewCard={() => <div data-testid="card">card</div>}
      />,
    );

    const list = container.querySelector("ol");
    expect(list).toBeInTheDocument();

    const cards = container.querySelectorAll("li");
    expect(cards).toHaveLength(2);
    expect(cards[0]?.getAttribute("style")).toContain("--index");
    expect(container.querySelectorAll('[class*="cardContent"]')).toHaveLength(2);
    expect(container.querySelector('[class*="sentinel"]')).not.toBeInTheDocument();
  });
});
