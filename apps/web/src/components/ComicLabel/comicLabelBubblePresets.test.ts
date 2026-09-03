import {
  COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
  darkenComicLabelFill,
} from "./comicLabelBubblePresets";

describe("comicLabelBubblePresets", () => {
  it("defaults to pointedArcs burst style", () => {
    expect(COMIC_LABEL_DEFAULT_BUBBLE_STYLE).toBe("pointedArcs");
  });

  it("darkens hex fills for edge accent", () => {
    expect(darkenComicLabelFill("#ffffff")).toBe("#d1d1d1");
    expect(darkenComicLabelFill("#13c2c2")).toBe("#109f9f");
  });
});
