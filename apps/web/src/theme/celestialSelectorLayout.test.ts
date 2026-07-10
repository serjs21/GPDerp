import {
  CELESTIAL_OPPOSITION_RADIUS_PERCENT,
} from "@/components/CelestialThemeSelector/celestialSelectorOpposition.config";
import {
  clampDialBodyCenterToFace,
  dialBodyDepthScale,
  earthSunGradientAngleDeg,
  getSelectorDialLayoutFromSlot,
  selectorButtonModeFromSunY,
  selectorCosmicRotationDeg,
  selectorLayoutToBackgroundBodies,
  selectorOppositionLocalBodies,
  selectorOppositionViewerBodies,
  selectorSelectionBorderPosition,
  selectorViewerSunYPercent,
  slotToSunDialPosition,
} from "./celestialSelectorLayout";
import { angleToSlot, slotToHandDegrees } from "./celestialTime";
import { BANGKOK_COORDINATES } from "./useCelestialScene";

describe("celestialSelectorLayout", () => {
  it("keeps sun and moon fixed in the local cosmic frame on opposite sides", () => {
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);

    expect(noon.sun.x).toBe(midnight.sun.x);
    expect(noon.sun.y).toBe(midnight.sun.y);
    expect(noon.moon.x).toBe(midnight.moon.x);
    expect(noon.moon.y).toBe(midnight.moon.y);

    const local = selectorOppositionLocalBodies();
    const separation = Math.hypot(
      local.moon.x - local.sun.x,
      local.moon.y - local.sun.y,
    );

    expect(separation).toBeCloseTo(2 * CELESTIAL_OPPOSITION_RADIUS_PERCENT, 0);
    expect(local.sun.x).toBeCloseTo(50, 0);
    expect(local.sun.y).toBeCloseTo(50 - CELESTIAL_OPPOSITION_RADIUS_PERCENT, 0);
    expect(local.moon.x).toBeCloseTo(50, 0);
    expect(local.moon.y).toBeCloseTo(50 + CELESTIAL_OPPOSITION_RADIUS_PERCENT, 0);
  });

  it("pins earth rotation to zero in the rotating cosmic frame", () => {
    const layout = getSelectorDialLayoutFromSlot(24, BANGKOK_COORDINATES);
    expect(layout.earthRotationDeg).toBe(0);
  });

  it("rotates the cosmic frame with slot relative to noon reference", () => {
    expect(selectorCosmicRotationDeg(48)).toBeCloseTo(0, 0);
    expect(Math.abs(selectorCosmicRotationDeg(0))).toBeCloseTo(180, 0);
  });

  it("places viewer sun above center at noon and below at midnight", () => {
    const noonViewer = selectorOppositionViewerBodies(48);
    const midnightViewer = selectorOppositionViewerBodies(0);

    expect(noonViewer.sun.y).toBeLessThan(50);
    expect(midnightViewer.sun.y).toBeGreaterThan(50);
  });

  it("classifies button mode from viewer sun y", () => {
    expect(selectorButtonModeFromSunY(12)).toBe("day");
    expect(selectorButtonModeFromSunY(50)).toBe("day");
    expect(selectorButtonModeFromSunY(88)).toBe("night");
    expect(selectorButtonModeFromSunY(selectorViewerSunYPercent(48))).toBe("day");
    expect(selectorButtonModeFromSunY(selectorViewerSunYPercent(0))).toBe("night");
  });

  it("places selection marker on the controller border at the slot angle", () => {
    const border = selectorSelectionBorderPosition(48, 6);

    expect(border.x).toBeCloseTo(50, 0);
    expect(border.y).toBeCloseTo(3, 0);

    const midnightBorder = selectorSelectionBorderPosition(0, 6);

    expect(midnightBorder.x).toBeCloseTo(50, 0);
    expect(midnightBorder.y).toBeCloseTo(97, 0);
  });

  it("clamps dial bodies inside the circular face", () => {
    const viewer = selectorOppositionViewerBodies(0);
    const sun = clampDialBodyCenterToFace(viewer.sun.x, viewer.sun.y, 20, 4);
    const moon = clampDialBodyCenterToFace(viewer.moon.x, viewer.moon.y, 12, 3);

    for (const body of [sun, moon]) {
      const radius = Math.hypot(body.x - 50, body.y - 50);
      expect(radius).toBeLessThanOrEqual(50);
    }
  });

  it("scales moon up and sun down on the bottom night arc", () => {
    const viewerSunY = selectorViewerSunYPercent(0);
    const moonScale = dialBodyDepthScale(viewerSunY, "moon");
    const sunScale = dialBodyDepthScale(viewerSunY, "sun");

    expect(moonScale).toBeGreaterThan(sunScale);
    expect(sunScale).toBeCloseTo(0.7, 1);
    expect(moonScale).toBeCloseTo(1.3, 1);
  });

  it("scales sun up and moon down on the top day arc", () => {
    const viewerSunY = selectorViewerSunYPercent(48);
    const moonScale = dialBodyDepthScale(viewerSunY, "moon");
    const sunScale = dialBodyDepthScale(viewerSunY, "sun");

    expect(sunScale).toBeGreaterThan(moonScale);
    expect(sunScale).toBeCloseTo(1.15, 1);
    expect(moonScale).toBeCloseTo(0.85, 1);
  });

  it("keeps scaled sun inside the dial face at midnight", () => {
    const viewer = selectorOppositionViewerBodies(0);
    const viewerSunY = selectorViewerSunYPercent(0);
    const sunScale = dialBodyDepthScale(viewerSunY, "sun");
    const sunEffectiveSize = 20 * sunScale;
    const sun = clampDialBodyCenterToFace(
      viewer.sun.x,
      viewer.sun.y,
      sunEffectiveSize,
      4,
    );
    const outerRadius = Math.hypot(sun.x - 50, sun.y - 50) + sunEffectiveSize / 2;

    expect(outerRadius).toBeLessThanOrEqual(50);
  });

  it("keeps viewer opposition positions inside the dial bounds", () => {
    for (const slot of [0, 24, 48, 72, 95]) {
      const viewer = selectorOppositionViewerBodies(slot);

      for (const body of [viewer.sun, viewer.moon]) {
        expect(body.x).toBeGreaterThanOrEqual(8);
        expect(body.x).toBeLessThanOrEqual(92);
        expect(body.y).toBeGreaterThanOrEqual(8);
        expect(body.y).toBeLessThanOrEqual(92);
      }
    }
  });

  it("preserves constant moon-sun separation in viewer space across slots", () => {
    const local = selectorOppositionLocalBodies();
    const localSeparation = Math.hypot(
      local.moon.x - local.sun.x,
      local.moon.y - local.sun.y,
    );

    for (const slot of [0, 24, 48, 72]) {
      const viewer = selectorOppositionViewerBodies(slot);
      const viewerSeparation = Math.hypot(
        viewer.moon.x - viewer.sun.x,
        viewer.moon.y - viewer.sun.y,
      );
      expect(viewerSeparation).toBeCloseTo(localSeparation, 0);
    }
  });

  it("fades but does not hide the sun below the horizon", () => {
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);

    expect(midnight.sun.opacity).toBeGreaterThan(0);
    expect(midnight.sun.opacity).toBeLessThan(noon.sun.opacity);
  });

  it("round-trips slot angles through angleToSlot", () => {
    for (const slot of [0, 24, 48, 72, 95]) {
      expect(angleToSlot(slotToHandDegrees(slot))).toBe(slot);
    }
  });

  it("maps selector layout to viewer background body coordinates", () => {
    const slot = 48;
    const layout = getSelectorDialLayoutFromSlot(slot, BANGKOK_COORDINATES);
    const viewer = selectorOppositionViewerBodies(slot);
    const bodies = selectorLayoutToBackgroundBodies(slot, layout, 12);

    expect(bodies.sun.x).toBe(viewer.sun.x);
    expect(bodies.sun.y).toBe(viewer.sun.y);
    expect(bodies.moon.x).toBe(viewer.moon.x);
    expect(bodies.moon.y).toBe(viewer.moon.y);
    expect(bodies.moon.limbAngleDeg).toBe(12);
    expect(bodies.sun.opacity).toBeGreaterThan(0);
  });

  it("hides background sun on the dial bottom arc and shows full moon", () => {
    const midnight = getSelectorDialLayoutFromSlot(0, BANGKOK_COORDINATES);
    const noon = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const midnightBodies = selectorLayoutToBackgroundBodies(
      0,
      midnight,
      0,
    );
    const noonBodies = selectorLayoutToBackgroundBodies(48, noon, 0);

    expect(midnightBodies.sun.opacity).toBe(0);
    expect(midnightBodies.moon.opacity).toBe(1);
    expect(noonBodies.sun.opacity).toBeGreaterThan(0);
  });

  it("aims earth sky gradient toward the local sun in the rotating frame", () => {
    const layout = getSelectorDialLayoutFromSlot(48, BANGKOK_COORDINATES);
    const dx = layout.sun.x - 50;
    const dy = layout.sun.y - 50;
    const dialAngleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;

    expect(earthSunGradientAngleDeg(layout)).toBeCloseTo(dialAngleDeg, 0);
  });

  it("derives virtual viewer sun y from slot hand position", () => {
    expect(selectorViewerSunYPercent(48)).toBeCloseTo(
      slotToSunDialPosition(48).y,
      0,
    );
    expect(selectorViewerSunYPercent(0)).toBeCloseTo(
      slotToSunDialPosition(0).y,
      0,
    );
  });
});
