import { pickLeastOccupiedLabelPlacement } from "./haikuLabelPlacement";

describe("pickLeastOccupiedLabelPlacement", () => {
  it("returns a placement inside the drop area", () => {
    const placement = pickLeastOccupiedLabelPlacement([], () => 0.5);
    expect(placement.xPercent).toBeGreaterThanOrEqual(0);
    expect(placement.xPercent).toBeLessThanOrEqual(100);
    expect(placement.yPercent).toBeGreaterThanOrEqual(0);
    expect(placement.yPercent).toBeLessThanOrEqual(100);
    expect(Number.isFinite(placement.rotateDeg)).toBe(true);
  });

  it("prefers distance from a crowded cluster", () => {
    const existing = [
      { xPercent: 20, yPercent: 50 },
      { xPercent: 22, yPercent: 48 },
      { xPercent: 18, yPercent: 52 },
    ];
    const placement = pickLeastOccupiedLabelPlacement(existing, () => 0.1);
    const minDist = Math.min(
      ...existing.map((point) =>
        Math.hypot(placement.xPercent - point.xPercent, placement.yPercent - point.yPercent),
      ),
    );
    expect(minDist).toBeGreaterThan(15);
  });
});
