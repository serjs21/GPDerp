import {
  clampDialBodyCenterToFace,
  dialBodyDepthScale,
  earthSunGradientAngleDeg,
  getSelectorDialLayoutFromSlot,
  selectorButtonModeFromSunY,
  selectorLayoutToBackgroundBodies,
  selectorOrbitBodiesFromButtonStack,
  selectorOrbitDisplayLayout,
  selectorSelectionBorderPosition,
  slotToEarthRotationDeg,
  slotToSunDialPosition,
} from "./celestialSelectorLayout";
import {
  CELESTIAL_SELECTOR_BUTTON_DAY,
  CELESTIAL_SELECTOR_ORBIT_SPREAD_FACTOR,
  buttonPlacementOffsetFromCenter,
} from "@/components/CelestialThemeSelector/celestialSelectorButton.config";
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

  it("scales moon up and sun down on the bottom night arc", () => {
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const moonScale = dialBodyDepthScale(midnight.sun.y, "moon");
    const sunScale = dialBodyDepthScale(midnight.sun.y, "sun");

    expect(moonScale).toBeGreaterThan(sunScale);
    expect(sunScale).toBeCloseTo(0.7, 1);
    expect(moonScale).toBeCloseTo(1.3, 1);
  });

  it("scales sun up and moon down on the top day arc", () => {
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const moonScale = dialBodyDepthScale(noon.sun.y, "moon");
    const sunScale = dialBodyDepthScale(noon.sun.y, "sun");

    expect(sunScale).toBeGreaterThan(moonScale);
    expect(sunScale).toBeCloseTo(1.15, 1);
    expect(moonScale).toBeCloseTo(0.85, 1);
  });

  it("keeps scaled sun inside the dial face at midnight", () => {
    const layout = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const sunScale = dialBodyDepthScale(layout.sun.y, "sun");
    const sunEffectiveSize = 20 * sunScale;
    const sun = clampDialBodyCenterToFace(
      layout.sun.x,
      layout.sun.y,
      sunEffectiveSize,
      4,
    );
    const outerRadius = Math.hypot(sun.x - 50, sun.y - 50) + sunEffectiveSize / 2;

    expect(outerRadius).toBeLessThanOrEqual(50);
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
      const displayLayout = selectorOrbitDisplayLayout(slot, layout);
      const dx = displayLayout.sun.x - 50;
      const dy = displayLayout.sun.y - 50;
      const dialAngleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const earthAngle = earthSunGradientAngleDeg(displayLayout);
      const effectiveAngle = earthAngle + displayLayout.earthRotationDeg;

      expect(effectiveAngle).toBeCloseTo(dialAngleDeg, 0);
    }
  });

  it("spaces orbit bodies farther from earth than the closed button stacks", () => {
    const layout = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const mode = selectorButtonModeFromSunY(layout.sun.y);
    const orbit = selectorOrbitBodiesFromButtonStack(48, mode);
    const sunOff = buttonPlacementOffsetFromCenter(CELESTIAL_SELECTOR_BUTTON_DAY.sun);
    const buttonRadius = Math.hypot(sunOff.dx, sunOff.dy);
    const orbitRadius = Math.hypot(orbit.sun.x - 50, orbit.sun.y - 50);

    expect(orbitRadius).toBeGreaterThan(buttonRadius);
    expect(orbitRadius).toBeCloseTo(
      buttonRadius * CELESTIAL_SELECTOR_ORBIT_SPREAD_FACTOR,
      0,
    );
  });

  it("preserves moon offset distance from sun relative to the button stack in orbit mode", () => {
    const mode = "day" as const;
    const orbit = selectorOrbitBodiesFromButtonStack(24, mode);
    const sunOff = buttonPlacementOffsetFromCenter(CELESTIAL_SELECTOR_BUTTON_DAY.sun);
    const moonOff = buttonPlacementOffsetFromCenter(CELESTIAL_SELECTOR_BUTTON_DAY.moon);
    const buttonSeparation = Math.hypot(moonOff.dx - sunOff.dx, moonOff.dy - sunOff.dy);
    const orbitSeparation = Math.hypot(
      orbit.moon.x - orbit.sun.x,
      orbit.moon.y - orbit.sun.y,
    );

    expect(orbitSeparation).toBeCloseTo(
      buttonSeparation * CELESTIAL_SELECTOR_ORBIT_SPREAD_FACTOR,
      0,
    );
  });
});
