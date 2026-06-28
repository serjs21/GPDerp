import {
  getSelectorDialLayoutFromSlot,
  selectorLayoutToBackgroundBodies,
  slotToEarthRotationDeg,
  slotToSunDialPosition,
} from "./celestialSelectorLayout";
import { angleToSlot, slotToHandDegrees } from "./celestialTime";
import { BANGKOK_COORDINATES } from "./useCelestialScene";

describe("celestialSelectorLayout", () => {
  it("places the sun at the slot angle on the dial ring", () => {
    const midnight = slotToSunDialPosition(0);
    const morning = slotToSunDialPosition(24);

    expect(midnight.x).toBeCloseTo(50, 0);
    expect(midnight.y).toBeCloseTo(88, 0);
    expect(morning.x).toBeCloseTo(12, 0);
    expect(morning.y).toBeCloseTo(50, 0);
  });

  it("rotates earth opposite the selected sun angle", () => {
    expect(slotToEarthRotationDeg(0)).toBe(-90);
    expect(slotToEarthRotationDeg(48)).toBe(-270);
  });

  it("keeps sun and moon positions inside the dial bounds", () => {
    const layout = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);

    for (const body of [layout.sun, layout.moon]) {
      expect(body.x).toBeGreaterThanOrEqual(8);
      expect(body.x).toBeLessThanOrEqual(92);
      expect(body.y).toBeGreaterThanOrEqual(8);
      expect(body.y).toBeLessThanOrEqual(92);
    }
  });

  it("places sun at different slot angles for dawn and dusk", () => {
    const dawn = getSelectorDialLayoutFromSlot(24, BANGKOK_COORDINATES);
    const dusk = getSelectorDialLayoutFromSlot(72, BANGKOK_COORDINATES);

    expect(dawn.sun.x).not.toBeCloseTo(dusk.sun.x, 0);
    expect(dawn.sun.x).toBeLessThan(50);
    expect(dusk.sun.x).toBeGreaterThan(50);
  });

  it("fades but does not hide the sun below the horizon", () => {
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);

    expect(midnight.sun.opacity).toBeGreaterThan(0);
    expect(midnight.sun.opacity).toBeLessThan(noon.sun.opacity);
  });

  it("changes moon offset between dawn and dusk while sun follows slot", () => {
    const dawn = getSelectorDialLayoutFromSlot(24, BANGKOK_COORDINATES);
    const dusk = getSelectorDialLayoutFromSlot(72, BANGKOK_COORDINATES);

    expect(dawn.moon.x).not.toBeCloseTo(dusk.moon.x, 0);
    expect(dawn.sun.x).toBeCloseTo(slotToSunDialPosition(24).x, 1);
    expect(dusk.sun.x).toBeCloseTo(slotToSunDialPosition(72).x, 1);
  });

  it("round-trips slot angles through angleToSlot", () => {
    for (const slot of [0, 24, 48, 72, 95]) {
      expect(angleToSlot(slotToHandDegrees(slot))).toBe(slot);
    }
  });

  it("maps selector layout to background body coordinates", () => {
    const layout = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const bodies = selectorLayoutToBackgroundBodies(layout, 12);

    expect(bodies.sun.x).toBe(layout.sun.x);
    expect(bodies.sun.y).toBe(layout.sun.y);
    expect(bodies.moon.x).toBe(layout.moon.x);
    expect(bodies.moon.y).toBe(layout.moon.y);
    expect(bodies.moon.limbAngleDeg).toBe(12);
  });
});
