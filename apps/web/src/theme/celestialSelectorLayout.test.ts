import {
  clampDialBodyCenterToFace,
  earthSunGradientAngleDeg,
  getSelectorDialLayoutFromSlot,
  selectorButtonModeFromSunY,
  selectorLayoutToBackgroundBodies,
  selectorSelectionBorderPosition,
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

  it("classifies button mode from sun dial y", () => {
    expect(selectorButtonModeFromSunY(12)).toBe("day");
    expect(selectorButtonModeFromSunY(50)).toBe("day");
    expect(selectorButtonModeFromSunY(88)).toBe("night");
  });

  it("places selection marker on the controller border at the slot angle", () => {
    const layout = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const border = selectorSelectionBorderPosition(layout, 6);

    expect(border.x).toBeCloseTo(50, 0);
    expect(border.y).toBeCloseTo(3, 0);

    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const midnightBorder = selectorSelectionBorderPosition(midnight, 6);

    expect(midnightBorder.x).toBeCloseTo(50, 0);
    expect(midnightBorder.y).toBeCloseTo(97, 0);
  });

  it("clamps dial bodies inside the circular face", () => {
    const layout = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const sun = clampDialBodyCenterToFace(layout.sun.x, layout.sun.y, 20, 4);
    const moon = clampDialBodyCenterToFace(layout.moon.x, layout.moon.y, 12, 3);

    for (const body of [sun, moon]) {
      const radius = Math.hypot(body.x - 50, body.y - 50);
      expect(radius).toBeLessThanOrEqual(50);
    }
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
    expect(bodies.sun.opacity).toBeGreaterThan(0);
  });

  it("hides background sun on the dial bottom arc and shows full moon", () => {
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const midnightBodies = selectorLayoutToBackgroundBodies(midnight, 0);
    const noonBodies = selectorLayoutToBackgroundBodies(noon, 0);

    expect(midnightBodies.sun.opacity).toBe(0);
    expect(midnightBodies.moon.opacity).toBe(1);
    expect(noonBodies.sun.opacity).toBeGreaterThan(0);
  });

  it("aims earth sky gradient toward the dial sun after earth rotation", () => {
    for (const slot of [0, 24, 48, 72]) {
      const layout = getSelectorDialLayoutFromSlot(slot, BANGKOK_COORDINATES);
      const dx = layout.sun.x - 50;
      const dy = layout.sun.y - 50;
      const dialAngleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const earthAngle = earthSunGradientAngleDeg(layout);
      const effectiveAngle = earthAngle + layout.earthRotationDeg;

      expect(effectiveAngle).toBeCloseTo(dialAngleDeg, 0);
    }
  });
});
