import { sprayPaintSeedFromDate } from "./sprayPaintSeed";

describe("sprayPaintSeedFromDate", () => {
  it("returns a stable seed for the same date string", () => {
    const a = sprayPaintSeedFromDate("2026-01-15T10:00:00.000Z");
    const b = sprayPaintSeedFromDate("2026-01-15T10:00:00.000Z");
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
  });

  it("differs across distinct dates", () => {
    expect(sprayPaintSeedFromDate("2026-01-15T10:00:00.000Z")).not.toBe(
      sprayPaintSeedFromDate("2026-06-01T10:00:00.000Z"),
    );
  });

  it("honors an explicit seed override", () => {
    expect(sprayPaintSeedFromDate("2026-01-15T10:00:00.000Z", 42)).toBe(42);
  });
});
