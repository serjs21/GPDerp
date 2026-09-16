import { PATTERN_TRIANGLES, triangleArea } from "./creasePattern";

describe("creasePattern triangulation", () => {
  it("produces only triangles", () => {
    for (const panel of PATTERN_TRIANGLES) {
      expect(panel.points).toHaveLength(3);
    }
  });

  it("triangulates 24 faces into 36 triangles", () => {
    expect(PATTERN_TRIANGLES).toHaveLength(36);
  });

  it("gives every triangle positive area", () => {
    for (const panel of PATTERN_TRIANGLES) {
      expect(triangleArea(panel.points)).toBeGreaterThan(1);
    }
  });

  it("has no duplicate triangles", () => {
    const keys = PATTERN_TRIANGLES.map((panel) =>
      panel.points
        .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
        .sort()
        .join("|"),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("records three connection edges per panel", () => {
    for (const panel of PATTERN_TRIANGLES) {
      expect(panel.edges).toHaveLength(3);
    }
  });
});
