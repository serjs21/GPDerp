import { render } from "@testing-library/react";
import type { HaikuDto } from "@/api/haikus";
import { WisdomForestV2Cards } from "./WisdomForestV2Cards";

const PreviewCard = ({ haiku }: { haiku?: HaikuDto }) => (
  <div data-testid="preview">{haiku?.title ?? "draft"}</div>
);

const mockHaiku = (id: string): HaikuDto =>
  ({
    id,
    title: `Haiku ${id}`,
    body: "line one",
    titleSuffix: 0,
    createdAt: new Date().toISOString(),
    accountId: "a",
    createdById: "b",
    labels: [],
  }) as HaikuDto;

describe("WisdomForestV2Cards", () => {
  it("renders one list item per haiku", () => {
    const { container } = render(
      <WisdomForestV2Cards
        haikus={[mockHaiku("1"), mockHaiku("2")]}
        generatingDraft={null}
        PreviewCard={PreviewCard}
      />,
    );

    const list = container.querySelector("ol");
    expect(list).toHaveStyle({ "--numcards": "2" });
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
