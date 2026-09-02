import {
  formatHms,
  getHitsMeterDisplay,
  getTimeMeterDisplay,
  SHARE_LINK_CLOCK_THRESHOLD_MS,
  shouldTickShareLinkClock,
} from "./shareLinkDisplay";

describe("formatHms", () => {
  it("pads hours, minutes, and seconds", () => {
    expect(formatHms(0)).toBe("00:00:00");
    expect(formatHms(3661000)).toBe("01:01:01");
    expect(formatHms(99 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000)).toBe("99:59:59");
  });

  it("clamps negative durations to zero", () => {
    expect(formatHms(-5000)).toBe("00:00:00");
  });
});

describe("getHitsMeterDisplay", () => {
  it("uses infinity when maxViews is unset", () => {
    expect(getHitsMeterDisplay({ maxViews: null, viewCount: 3 })).toEqual({ kind: "unlimited" });
  });

  it("returns remaining visits", () => {
    expect(getHitsMeterDisplay({ maxViews: 10, viewCount: 3 })).toEqual({ kind: "remaining", count: 7 });
  });

  it("returns empty heart at zero remaining", () => {
    expect(getHitsMeterDisplay({ maxViews: 5, viewCount: 5 })).toEqual({ kind: "empty", count: 0 });
    expect(getHitsMeterDisplay({ maxViews: 2, viewCount: 9 })).toEqual({ kind: "empty", count: 0 });
  });
});

describe("getTimeMeterDisplay", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("uses infinity when there is no expiration", () => {
    expect(getTimeMeterDisplay(null, now, "en")).toEqual({ kind: "unlimited" });
  });

  it("waits for a client now before filling the clock", () => {
    expect(getTimeMeterDisplay("2026-01-01T02:00:00.000Z", null, "en")).toEqual({
      kind: "clock",
      text: "",
    });
  });

  it("shows 00:00:00 when expired", () => {
    expect(getTimeMeterDisplay("2025-12-31T00:00:00.000Z", now, "en")).toEqual({
      kind: "clock",
      text: "00:00:00",
    });
  });

  it("uses HH:MM:SS under the 100h threshold", () => {
    expect(getTimeMeterDisplay("2026-01-01T02:00:00.000Z", now, "en")).toEqual({
      kind: "clock",
      text: "02:00:00",
    });
    const justUnder = new Date(now.getTime() + SHARE_LINK_CLOCK_THRESHOLD_MS - 1000).toISOString();
    expect(getTimeMeterDisplay(justUnder, now, "en").kind).toBe("clock");
  });

  it("uses Intl relative time at or above 100 hours", () => {
    const tenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeMeterDisplay(tenDays, now, "en")).toEqual({
      kind: "relative",
      text: "in 10 days",
    });
    const atThreshold = new Date(now.getTime() + SHARE_LINK_CLOCK_THRESHOLD_MS).toISOString();
    expect(getTimeMeterDisplay(atThreshold, now, "en").kind).toBe("relative");
  });
});

describe("shouldTickShareLinkClock", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("ticks for short remaining time and expired links", () => {
    expect(shouldTickShareLinkClock("2026-01-01T02:00:00.000Z", now)).toBe(true);
    expect(shouldTickShareLinkClock("2025-12-01T00:00:00.000Z", now)).toBe(true);
  });

  it("does not tick for permanent or long-dated links", () => {
    expect(shouldTickShareLinkClock(null, now)).toBe(false);
    expect(shouldTickShareLinkClock("2026-01-20T00:00:00.000Z", now)).toBe(false);
  });
});
