import { planIconBackfill } from "../iconBackfill";

const target = "public, max-age=31536000, immutable";

describe("planIconBackfill", () => {
  it("resizes icons larger than the upload cap, whatever their header", () => {
    expect(planIconBackfill({ width: 1024, height: 768, targetCacheControl: target })).toBe("resize");
    expect(planIconBackfill({ width: 200, height: 300, cacheControl: target, targetCacheControl: target })).toBe(
      "resize",
    );
  });

  it("only sets the header on small icons that lack it", () => {
    expect(planIconBackfill({ width: 256, height: 256, targetCacheControl: target })).toBe("set-cache-header");
    expect(
      planIconBackfill({ width: 128, height: 64, cacheControl: "max-age=0", targetCacheControl: target }),
    ).toBe("set-cache-header");
  });

  it("skips icons that are already small and cached (re-runs are no-ops)", () => {
    expect(planIconBackfill({ width: 256, height: 200, cacheControl: target, targetCacheControl: target })).toBe(
      "skip",
    );
  });
});
