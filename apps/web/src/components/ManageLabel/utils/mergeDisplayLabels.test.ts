import type { LabelDto } from "@/api/labels";
import { labelSortPlacement, mergeDisplayLabels } from "./mergeDisplayLabels";

const label = (id: string) => ({ id, name: id }) as LabelDto;

describe("mergeDisplayLabels", () => {
  it("uses live API order when nothing is exiting", () => {
    const { order } = mergeDisplayLabels([], [label("a"), label("b")], {});
    expect(order).toEqual(["a", "b"]);
  });

  it("keeps an exiting row after the neighbor it followed", () => {
    const { order, labels } = mergeDisplayLabels(["a", "x", "b"], [label("a"), label("b")], { x: label("x") });
    expect(order).toEqual(["a", "x", "b"]);
    expect(labels.map((l) => l.id)).toEqual(["a", "x", "b"]);
  });

  it("puts an exiting row first when it was first or its neighbors are gone", () => {
    expect(mergeDisplayLabels(["x", "a"], [label("a")], { x: label("x") }).order).toEqual(["x", "a"]);
    expect(mergeDisplayLabels(["gone", "x"], [label("a")], { x: label("x") }).order).toEqual(["x", "a"]);
  });
});

describe("labelSortPlacement", () => {
  it("places sort in the side panel only when a target exists", () => {
    expect(labelSortPlacement(false, null)).toBe("none");
    expect(labelSortPlacement(true, null)).toBe("frame");
    expect(labelSortPlacement(true, {} as HTMLElement)).toBe("side");
  });
});
