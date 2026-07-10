import * as SunCalc from "suncalc";
import { CELESTIAL_SELECTOR_BODY_SIZE } from "@/components/CelestialThemeSelector/celestialSelectorBodySize.config";
import { CELESTIAL_SELECTOR_DEPTH } from "@/components/CelestialThemeSelector/celestialSelectorDepth.config";
import {
  CELESTIAL_LOCAL_SUN_ANGLE_DEG,
  CELESTIAL_OPPOSITION_RADIUS_PERCENT,
  CELESTIAL_OPPOSITION_REFERENCE_SLOT,
} from "@/components/CelestialThemeSelector/celestialSelectorOpposition.config";
import { angleToSlot, clampSlot, slotToDate, slotToHandDegrees } from "./celestialTime";
import type { GeoCoordinates } from "./celestialTheme";

const DEG_TO_RAD = Math.PI / 180;
const BELOW_HORIZON_OPACITY = 0.28;

export const EARTH_ART_OFFSET_DEG = 0;
export const DEFAULT_ORBIT_RADIUS_PERCENT = 38;

export type SelectorDialBody = {
  x: number;
  y: number;
  opacity: number;
};

export type SelectorDialLayout = {
  sun: SelectorDialBody;
  earthRotationDeg: number;
  moon: SelectorDialBody;
};

export type SelectorDialOptions = {
  oppositionRadiusPercent?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function assertCoordinates({ latitude, longitude }: GeoCoordinates) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError("latitude must be a finite number between -90 and 90.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError("longitude must be a finite number between -180 and 180.");
  }
}

function sunOpacityFromAltitude(altitude: number) {
  const isAboveHorizon = altitude >= 0;
  const horizonFade = smoothstep((altitude + 6) / 6);
  return isAboveHorizon ? horizonFade : BELOW_HORIZON_OPACITY;
}

export function dialPositionFromAngleDeg(
  angleDeg: number,
  orbitRadiusPercent = DEFAULT_ORBIT_RADIUS_PERCENT,
) {
  const angleRad = angleDeg * DEG_TO_RAD;
  return {
    x: 50 + orbitRadiusPercent * Math.cos(angleRad),
    y: 50 + orbitRadiusPercent * Math.sin(angleRad),
  };
}

export function slotToSunDialPosition(
  slot: number,
  orbitRadiusPercent = DEFAULT_ORBIT_RADIUS_PERCENT,
) {
  return dialPositionFromAngleDeg(slotToHandDegrees(slot), orbitRadiusPercent);
}

function rotatePointAroundCenter(
  x: number,
  y: number,
  rotationDeg: number,
) {
  const dx = x - 50;
  const dy = y - 50;
  const angleRad = rotationDeg * DEG_TO_RAD;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: 50 + dx * cos - dy * sin,
    y: 50 + dx * sin + dy * cos,
  };
}

/** Fixed sun/moon in the local cosmic frame (180° apart). */
export function selectorOppositionLocalBodies(
  radiusPercent = CELESTIAL_OPPOSITION_RADIUS_PERCENT,
) {
  const sun = dialPositionFromAngleDeg(
    CELESTIAL_LOCAL_SUN_ANGLE_DEG,
    radiusPercent,
  );
  const moon = dialPositionFromAngleDeg(
    CELESTIAL_LOCAL_SUN_ANGLE_DEG + 180,
    radiusPercent,
  );
  return { sun, moon };
}

/** Whole cosmic frame rotation for the selected slot (0 at reference noon). */
export function selectorCosmicRotationDeg(
  slot: number,
  referenceSlot = CELESTIAL_OPPOSITION_REFERENCE_SLOT,
) {
  return slotToHandDegrees(slot) - slotToHandDegrees(referenceSlot);
}

/** Viewer-space sun/moon after cosmic frame rotation. */
export function selectorOppositionViewerBodies(
  slot: number,
  radiusPercent = CELESTIAL_OPPOSITION_RADIUS_PERCENT,
) {
  const local = selectorOppositionLocalBodies(radiusPercent);
  const rotationDeg = selectorCosmicRotationDeg(slot);
  return {
    sun: rotatePointAroundCenter(local.sun.x, local.sun.y, rotationDeg),
    moon: rotatePointAroundCenter(local.moon.x, local.moon.y, rotationDeg),
  };
}

/** Virtual sun y in viewer space for hemisphere / depth (slot-derived). */
export function selectorViewerSunYPercent(slot: number) {
  return slotToSunDialPosition(slot).y;
}

function getMoonOpacityFromSlot(
  date: Date,
  coordinates: GeoCoordinates,
): number {
  assertCoordinates(coordinates);

  const sunPosition = SunCalc.getPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const moonPosition = SunCalc.getMoonPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const isNight = sunPosition.altitude <= -6;
  const dayMoonVisibility = isNight ? 1 : 0.28;
  const moonBaseOpacity = sunOpacityFromAltitude(moonPosition.altitude);

  return (
    moonBaseOpacity *
    (0.25 + moonIllumination.fraction * 0.75) *
    dayMoonVisibility
  );
}

export function getSelectorDialLayoutFromSlot(
  slot: number,
  coordinates: GeoCoordinates,
  options: SelectorDialOptions = {},
): SelectorDialLayout {
  assertCoordinates(coordinates);

  const radiusPercent =
    options.oppositionRadiusPercent ?? CELESTIAL_OPPOSITION_RADIUS_PERCENT;
  const date = slotToDate(clampSlot(slot));
  const sunPosition = SunCalc.getPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const local = selectorOppositionLocalBodies(radiusPercent);

  return {
    sun: {
      ...local.sun,
      opacity: sunOpacityFromAltitude(sunPosition.altitude),
    },
    earthRotationDeg: 0,
    moon: {
      ...local.moon,
      opacity: getMoonOpacityFromSlot(date, coordinates),
    },
  };
}

export type SelectorBackgroundBodies = {
  sun: { x: number; y: number; opacity: number };
  moon: { x: number; y: number; opacity: number; limbAngleDeg: number };
};

const BACKGROUND_SUN_ARC_FADE_BAND_PERCENT = 8;

/** Sun hidden when viewer sun y is below horizon (50%); smooth fade near the line. */
export function backgroundSunVisibilityFromDialY(yPercent: number): number {
  const horizonY = 50;
  if (yPercent <= horizonY - BACKGROUND_SUN_ARC_FADE_BAND_PERCENT) return 1;
  if (yPercent >= horizonY + BACKGROUND_SUN_ARC_FADE_BAND_PERCENT) return 0;
  return (
    1 -
    smoothstep(
      (yPercent - (horizonY - BACKGROUND_SUN_ARC_FADE_BAND_PERCENT)) /
        (2 * BACKGROUND_SUN_ARC_FADE_BAND_PERCENT),
    )
  );
}

export function selectorLayoutToBackgroundBodies(
  slot: number,
  layout: SelectorDialLayout,
  moonLimbAngleDeg: number,
): SelectorBackgroundBodies {
  const viewer = selectorOppositionViewerBodies(slot);
  const { sunOpacity, moonOpacity } = complementaryCelestialOpacities(slot, layout);

  return {
    sun: {
      x: viewer.sun.x,
      y: viewer.sun.y,
      opacity: sunOpacity,
    },
    moon: {
      x: viewer.moon.x,
      y: viewer.moon.y,
      opacity: moonOpacity,
      limbAngleDeg: moonLimbAngleDeg,
    },
  };
}

/** Continuous sun/moon opacities that always sum to 1 (horizon crossfade). */
export function complementaryCelestialOpacities(
  slot: number,
  layout: SelectorDialLayout,
): { sunOpacity: number; moonOpacity: number } {
  const viewerSunY = selectorViewerSunYPercent(slot);
  const arcVisibility = backgroundSunVisibilityFromDialY(viewerSunY);
  const sunOpacity = clamp01(layout.sun.opacity * arcVisibility);
  return { sunOpacity, moonOpacity: 1 - sunOpacity };
}

/** Earth-local linear-gradient angle toward the local sun (constant in the rotating frame). */
export function earthSunGradientAngleDeg(layout: SelectorDialLayout): number {
  const dx = layout.sun.x - 50;
  const dy = layout.sun.y - 50;
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

/** Day (top arc) vs night (bottom arc) from viewer sun y. */
export function selectorButtonModeFromSunY(yPercent: number): "day" | "night" {
  return yPercent > 50 ? "night" : "day";
}

/** Viewer-space angle of the sun (and selection star) for a slot. */
export function slotToViewerSunAngleDeg(slot: number) {
  return CELESTIAL_LOCAL_SUN_ANGLE_DEG + selectorCosmicRotationDeg(slot);
}

/**
 * Map a dial click angle (atan2 screen degrees) to a slot so the selection
 * star lands on the click — same frame as the background/dial sun.
 */
export function viewerSunAngleToSlot(angleDeg: number) {
  const handDegrees =
    angleDeg -
    CELESTIAL_LOCAL_SUN_ANGLE_DEG +
    slotToHandDegrees(CELESTIAL_OPPOSITION_REFERENCE_SLOT);
  return angleToSlot(handDegrees);
}

/** Rim marker on the same ray as the viewer/background sun. */
export function selectorSelectionBorderPosition(
  slot: number,
  markerSizePercent: number,
) {
  const angleRad = slotToViewerSunAngleDeg(slot) * DEG_TO_RAD;
  const borderRadius = 50 - markerSizePercent / 2;

  return {
    x: 50 + borderRadius * Math.cos(angleRad),
    y: 50 + borderRadius * Math.sin(angleRad),
  };
}

/** @deprecated Use selectorSelectionBorderPosition */
export const selectorSunBorderPosition = selectorSelectionBorderPosition;

export type DialBodyRole = "sun" | "moon";

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Depth scale from viewer sun hemisphere: moon nearer on bottom/night arc, sun on top/day. */
export function dialBodyDepthScale(sunYPercent: number, role: DialBodyRole) {
  const t = smoothstep(
    (sunYPercent - 50) / CELESTIAL_SELECTOR_DEPTH.hemisphereBandPercent,
  );

  if (role === "moon") {
    return lerp(
      CELESTIAL_SELECTOR_DEPTH.moonFarScale,
      CELESTIAL_SELECTOR_DEPTH.moonNearScale,
      t,
    );
  }

  return lerp(
    CELESTIAL_SELECTOR_DEPTH.sunNearScale,
    CELESTIAL_SELECTOR_DEPTH.sunFarScale,
    t,
  );
}

/**
 * Opacity-linked scale factor: fullOpacityBoost at opacity 1, then fades at
 * opacityFadeRate × the opacity drop when opacity < 1.
 */
export function dialBodyOpacityScale(opacity: number) {
  const { fullOpacityBoost, opacityFadeRate, minScale } =
    CELESTIAL_SELECTOR_BODY_SIZE;
  if (opacity >= 1) {
    return fullOpacityBoost;
  }
  const fade = 1 - opacityFadeRate * (1 - opacity);
  return fullOpacityBoost * Math.min(1, Math.max(minScale, fade));
}

/** Depth reference size modulated by opacity (bigger when more opaque). */
export function dialBodyVisualScale(depthScale: number, opacity: number) {
  return depthScale * dialBodyOpacityScale(opacity);
}

/** Keep dial body center inside the circular face including icon size and glow bleed. */
export function clampDialBodyCenterToFace(
  x: number,
  y: number,
  bodySizePercent: number,
  glowBleedPercent = 0,
) {
  const dx = x - 50;
  const dy = y - 50;
  const angleRad = Math.atan2(dy, dx);
  const currentRadius = Math.hypot(dx, dy);
  const maxRadius = Math.max(0, 50 - bodySizePercent / 2 - glowBleedPercent);
  const clampedRadius = Math.min(currentRadius, maxRadius);

  return {
    x: 50 + clampedRadius * Math.cos(angleRad),
    y: 50 + clampedRadius * Math.sin(angleRad),
  };
}
