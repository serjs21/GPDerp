import {
  isLabelPlacementInBuffer,
  LABEL_PLACEMENT_CONTENT,
  pickLeastOccupiedLabelPlacement,
} from "./haikuLabelPlacement";

describe("pickLeastOccupiedLabelPlacement", () => {
  it("returns a placement inside the drop-area buffer (not over content)", () => {
    const placement = pickLeastOccupiedLabelPlacement([], () => 0.5);
    expect(placement.xPercent).toBeGreaterThanOrEqual(0);
    expect(placement.xPercent).toBeLessThanOrEqual(100);
    expect(placement.yPercent).toBeGreaterThanOrEqual(0);
    expect(placement.yPercent).toBeLessThanOrEqual(100);
    expect(isLabelPlacementInBuffer(placement.xPercent, placement.yPercent)).toBe(
      true,
    );
    expect(Number.isFinite(placement.rotateDeg)).toBe(true);
  });

  it("never places inside the lantern content face", () => {
    const rngValues = [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
    let i = 0;
    const rng = () => {
      const value = rngValues[i % rngValues.length]!;
      i += 1;
      return value;
    };
    for (let n = 0; n < 20; n += 1) {
      const placement = pickLeastOccupiedLabelPlacement([], rng);
      const { x0, x1, y0, y1 } = LABEL_PLACEMENT_CONTENT;
      const overContent =
        placement.xPercent >= x0 &&
        placement.xPercent <= x1 &&
        placement.yPercent >= y0 &&
        placement.yPercent <= y1;
      expect(overContent).toBe(false);
      expect(placement.yPercent).toBeLessThanOrEqual(y1);
    }
  });

  it("prefers distance from a crowded cluster", () => {
    const existing = [
      { xPercent: 8, yPercent: 8 },
      { xPercent: 10, yPercent: 10 },
      { xPercent: 6, yPercent: 12 },
    ];
    const placement = pickLeastOccupiedLabelPlacement(existing, () => 0.1);
    expect(isLabelPlacementInBuffer(placement.xPercent, placement.yPercent)).toBe(
      true,
    );
    const minDist = Math.min(
      ...existing.map((point) =>
        Math.hypot(
          placement.xPercent - point.xPercent,
          placement.yPercent - point.yPercent,
        ),
      ),
    );
    expect(minDist).toBeGreaterThan(12);
  });
});

describe("isLabelPlacementInBuffer", () => {
  it("accepts top and side pads", () => {
    expect(isLabelPlacementInBuffer(50, 8)).toBe(true);
    expect(isLabelPlacementInBuffer(8, 40)).toBe(true);
    expect(isLabelPlacementInBuffer(92, 40)).toBe(true);
  });

  it("rejects content center and bottom actions strip", () => {
    expect(isLabelPlacementInBuffer(50, 48)).toBe(false);
    expect(isLabelPlacementInBuffer(50, 90)).toBe(false);
  });
});
