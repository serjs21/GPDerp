import {
  angleToSlot,
  CELESTIAL_FIXED_DATE,
  CELESTIAL_SLOTS_PER_DAY,
  dateToSlot,
  formatClockLabel,
  isOnFixedCelestialDate,
  slotToDate,
  slotToHandDegrees,
} from "./celestialTime";
import { getCelestialPresetDate } from "./celestialPresets";
import { BANGKOK_COORDINATES } from "./useCelestialScene";

describe("celestialTime", () => {
  it("round-trips slot 0 as midnight on the fixed date", () => {
    const date = slotToDate(0);
    expect(formatClockLabel(0)).toBe("00:00");
    expect(isOnFixedCelestialDate(date)).toBe(true);
    expect(dateToSlot(date)).toBe(0);
  });

  it("round-trips slot 72 as 18:00", () => {
    const date = slotToDate(72);
    expect(formatClockLabel(72)).toBe("18:00");
    expect(dateToSlot(date)).toBe(72);
  });

  it("clamps out-of-range slots", () => {
    expect(slotToDate(-3).getTime()).toBe(slotToDate(0).getTime());
    expect(slotToDate(120).getTime()).toBe(slotToDate(95).getTime());
  });

  it("places slot 0 hand at six o'clock after the 180 degree dial offset", () => {
    expect(slotToHandDegrees(0)).toBe(90);
    expect(slotToHandDegrees(24)).toBe(180);
  });

  it("converts dial angles back to slots", () => {
    expect(angleToSlot(90)).toBe(0);
    expect(angleToSlot(180)).toBe(24);
    expect(angleToSlot(-90)).toBe(48);
    expect(angleToSlot(0)).toBe(72);
  });

  it("maps the evening quadrant without collapsing to midnight", () => {
    expect(angleToSlot(135)).toBe(12);
    expect(angleToSlot(170)).toBe(21);
  });

  it("wraps the end of the day back to slot 0", () => {
    expect(angleToSlot(slotToHandDegrees(95))).toBe(95);
    expect(angleToSlot(slotToHandDegrees(0))).toBe(0);
    expect(angleToSlot(86.25)).toBe(95);
  });

  it("keeps preset dates on the fixed reference day", () => {
    const sunset = getCelestialPresetDate("sunset", BANGKOK_COORDINATES, CELESTIAL_FIXED_DATE);
    expect(isOnFixedCelestialDate(sunset)).toBe(true);
    expect(dateToSlot(sunset)).toBeGreaterThanOrEqual(0);
    expect(dateToSlot(sunset)).toBeLessThan(CELESTIAL_SLOTS_PER_DAY);
  });
});
