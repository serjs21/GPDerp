import {
  BACKGROUND_SCENE_SOURCE_SIZE,
  BACKGROUND_SCENE_SOURCE_WIDTH,
  backgroundSceneMaskLayout,
} from "./backgroundSceneMaskLayout";

describe("backgroundSceneMaskLayout", () => {
  it("scales mask height from display width using shared source width", () => {
    const displayWidth = 836;
    const layout = backgroundSceneMaskLayout(displayWidth);

    expect(layout.scale).toBeCloseTo(0.5);
    expect(layout.maskWidthPx).toBe(836);
    expect(layout.maskHeightPx).toBeCloseTo(470.5);
    expect(layout.maskPosition).toBe("center bottom");
  });

  it("uses native width as scale denominator", () => {
    const layout = backgroundSceneMaskLayout(BACKGROUND_SCENE_SOURCE_WIDTH);

    expect(layout.scale).toBe(1);
    expect(layout.maskWidthPx).toBe(BACKGROUND_SCENE_SOURCE_WIDTH);
    expect(layout.maskHeightPx).toBe(BACKGROUND_SCENE_SOURCE_SIZE.maskHeight);
  });
});
