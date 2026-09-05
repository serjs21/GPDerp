import {
  buildComicBurstPath,
  layoutComicBurstLabel,
  silhouetteDetailForTextLength,
} from "./comicBurstPath";
import { hashSeed } from "./comicBurstSeed";

describe("comicBurstSeed", () => {
  it("hashes the same string to the same seed", () => {
    expect(hashSeed("MOONLIGHT!")).toBe(hashSeed("MOONLIGHT!"));
    expect(hashSeed("MOONLIGHT!")).not.toBe(hashSeed("POND!"));
  });
});

describe("buildComicBurstPath", () => {
  const base = {
    width: 160,
    height: 64,
    spikeCount: 12,
    randomness: 0.18,
    seedKey: "MOONLIGHT!",
  };

  it("is deterministic for the same seed and geometry", () => {
    const a = buildComicBurstPath(base);
    const b = buildComicBurstPath(base);
    expect(a.d).toBe(b.d);
    expect(a.cx).toBe(80);
    expect(a.cy).toBe(32);
  });

  it("produces different silhouettes for different texts", () => {
    const a = buildComicBurstPath({ ...base, seedKey: "CROW!" });
    const b = buildComicBurstPath({ ...base, seedKey: "AUTUMN!" });
    expect(a.d).not.toBe(b.d);
  });

  it("uses quadratic curves and closes the path", () => {
    const { d } = buildComicBurstPath(base);
    expect(d.startsWith("M ")).toBe(true);
    expect(d.includes("Q ")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  it("builds circle, square, and thought kinds", () => {
    const circle = buildComicBurstPath({ ...base, kind: "circle" });
    const square = buildComicBurstPath({ ...base, kind: "square" });
    const thought = buildComicBurstPath({ ...base, kind: "thought" });
    expect(circle.d).toContain("A ");
    expect(square.d).toContain("Q ");
    expect(thought.d).toContain("Q ");
    expect(circle.d).not.toBe(square.d);
    expect(square.d).not.toBe(thought.d);
  });

  it("keeps layoutComicBurstLabel width at least text + padding", () => {
    const layout = layoutComicBurstLabel({
      textWidth: 100,
      fontSize: 28,
      paddingX: 18,
      paddingY: 14,
      spikeCount: 12,
      randomness: 0.18,
      seedKey: "POND!",
    });
    expect(layout.width).toBe(136);
    expect(layout.height).toBeGreaterThanOrEqual(48);
  });

  it("adds silhouette detail for longer text", () => {
    expect(silhouetteDetailForTextLength(12, "HI")).toBe(12);
    expect(silhouetteDetailForTextLength(12, "LONGER!!")).toBe(16);
    expect(silhouetteDetailForTextLength(12, "VERYLONGTEXT")).toBe(20);
  });
});
