import { planPreferenceSync } from "./preferenceSync";
import { localClockSlot } from "@/theme/celestialTime";

describe("planPreferenceSync", () => {
  it("applies the server value when there is no local choice", () => {
    expect(planPreferenceSync(null, "ja")).toEqual({ apply: "ja", push: null });
  });

  it("does nothing when neither side has a value", () => {
    expect(planPreferenceSync<number>(null, null)).toEqual({ apply: null, push: null });
  });

  it("pushes a local choice that differs from the server", () => {
    expect(planPreferenceSync(40, null)).toEqual({ apply: null, push: 40 });
    expect(planPreferenceSync("th", "en")).toEqual({ apply: null, push: "th" });
  });

  it("does nothing when local and server agree", () => {
    expect(planPreferenceSync(12, 12)).toEqual({ apply: null, push: null });
  });
});

describe("localClockSlot", () => {
  it("floors local wall-clock time to 15-minute slots", () => {
    expect(localClockSlot(new Date(2026, 0, 1, 0, 0))).toBe(0);
    expect(localClockSlot(new Date(2026, 0, 1, 6, 14))).toBe(24);
    expect(localClockSlot(new Date(2026, 0, 1, 6, 15))).toBe(25);
    expect(localClockSlot(new Date(2026, 0, 1, 23, 59))).toBe(95);
  });
});
