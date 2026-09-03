import {
  LANTERN_LABEL_RING_MAX,
  rotateLabelsWindow,
  sourceDirectionFromOutwardAngle,
} from "./lanternLabelRingLayout";

describe("lanternLabelRingLayout", () => {
  it("returns all items when under the max window", () => {
    expect(rotateLabelsWindow(["a", "b", "c"], 0, LANTERN_LABEL_RING_MAX)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("rotates a circular window", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];
    expect(rotateLabelsWindow(items, 0, 3)).toEqual(["a", "b", "c"]);
    expect(rotateLabelsWindow(items, 5, 3)).toEqual(["f", "g", "a"]);
  });

  it("maps outward angles to inward source directions (screen y-down)", () => {
    expect(sourceDirectionFromOutwardAngle(0)).toBe("left");
    expect(sourceDirectionFromOutwardAngle(Math.PI / 2)).toBe("top");
    expect(sourceDirectionFromOutwardAngle(Math.PI)).toBe("right");
    expect(sourceDirectionFromOutwardAngle(-Math.PI / 2)).toBe("bottom");
  });
});
