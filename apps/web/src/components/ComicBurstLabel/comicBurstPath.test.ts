import { buildComicBurstPath, layoutComicBurstLabel } from "./comicBurstPath";
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
});
