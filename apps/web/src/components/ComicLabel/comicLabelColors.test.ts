import { pickComicLabelInk, resolveComicLabelFill } from "./comicLabelColors";

describe("comicLabelColors", () => {
  it("passes through hex and expands short hex", () => {
    expect(resolveComicLabelFill("#1677ff")).toBe("#1677ff");
    expect(resolveComicLabelFill("#fff")).toBe("#ffffff");
  });

  it("maps Ant Tag names", () => {
    expect(resolveComicLabelFill("green")).toBe("#52c41a");
    expect(resolveComicLabelFill("default")).toBe("#f5f5f5");
  });

  it("picks dark ink on light fills and light ink on dark fills", () => {
    expect(pickComicLabelInk("#ffffff")).toBe("#17131A");
    expect(pickComicLabelInk("#17131A")).toBe("#FFFDF8");
  });
});
