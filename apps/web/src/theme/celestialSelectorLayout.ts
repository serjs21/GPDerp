import * as SunCalc from "suncalc";
import { SELECTOR_SUN_SIZE_RATIO } from "@/components/CelestialThemeDial/celestialDialProportions";
import { clampSlot, slotToDate, slotToHandDegrees } from "./celestialTime";
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
  orbitRadiusPercent?: number;
  earthArtOffsetDeg?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const wrapDegrees = (value: number) => ((value + 180) % 360 + 360) % 360 - 180;

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

export function slotToEarthRotationDeg(
  slot: number,
  artOffsetDeg = EARTH_ART_OFFSET_DEG,
) {
  return -slotToHandDegrees(slot) + artOffsetDeg;
}

export function getMoonDialPositionFromSlot(
  slot: number,
  date: Date,
  coordinates: GeoCoordinates,
  orbitRadiusPercent = DEFAULT_ORBIT_RADIUS_PERCENT,
): SelectorDialBody {
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

  const relativeAzimuth = wrapDegrees(moonPosition.azimuth - sunPosition.azimuth);
  const moonAngleDeg = slotToHandDegrees(slot) + relativeAzimuth;
  const { x, y } = dialPositionFromAngleDeg(moonAngleDeg, orbitRadiusPercent);
  const isNight = sunPosition.altitude <= -6;
  const dayMoonVisibility = isNight ? 1 : 0.28;
  const moonBaseOpacity = sunOpacityFromAltitude(moonPosition.altitude);

  return {
    x,
    y,
    opacity:
      moonBaseOpacity *
      (0.25 + moonIllumination.fraction * 0.75) *
      dayMoonVisibility,
  };
}

export function getSelectorDialLayoutFromSlot(
  slot: number,
  coordinates: GeoCoordinates,
  options: SelectorDialOptions = {},
): SelectorDialLayout {
  assertCoordinates(coordinates);

  const orbitRadiusPercent = options.orbitRadiusPercent ?? DEFAULT_ORBIT_RADIUS_PERCENT;
  const earthArtOffsetDeg = options.earthArtOffsetDeg ?? EARTH_ART_OFFSET_DEG;
  const date = slotToDate(clampSlot(slot));
  const sunPosition = SunCalc.getPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const sunPositionOnDial = slotToSunDialPosition(slot, orbitRadiusPercent);

  return {
    sun: {
      ...sunPositionOnDial,
      opacity: sunOpacityFromAltitude(sunPosition.altitude),
    },
    earthRotationDeg: slotToEarthRotationDeg(slot, earthArtOffsetDeg),
    moon: getMoonDialPositionFromSlot(slot, date, coordinates, orbitRadiusPercent),
  };
}

export type SelectorBackgroundBodies = {
  sun: { x: number; y: number; opacity: number };
  moon: { x: number; y: number; opacity: number; limbAngleDeg: number };
};

const BACKGROUND_SUN_ARC_FADE_BAND_PERCENT = 8;

/** Sun hidden when dial y is below horizon (50%); smooth fade near the line. */
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
  layout: SelectorDialLayout,
  moonLimbAngleDeg: number,
): SelectorBackgroundBodies {
  const arcVisibility = backgroundSunVisibilityFromDialY(layout.sun.y);
  const sunOpacity = layout.sun.opacity * arcVisibility;
  const moonOpacity = sunOpacity === 0 ? 1 : layout.moon.opacity;

  return {
    sun: {
      x: layout.sun.x,
      y: layout.sun.y,
      opacity: sunOpacity,
    },
    moon: {
      x: layout.moon.x,
      y: layout.moon.y,
      opacity: moonOpacity,
      limbAngleDeg: moonLimbAngleDeg,
    },
  };
}

/** Earth-local linear-gradient angle so the bright stop points at the dial sun icon. */
export function earthSunGradientAngleDeg(layout: SelectorDialLayout): number {
  const dx = layout.sun.x - 50;
  const dy = layout.sun.y - 50;
  const dialAngleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return dialAngleDeg - layout.earthRotationDeg;
}

/** Closed-button day (top arc) vs night (bottom arc) from dial sun y. */
export function selectorButtonModeFromSunY(yPercent: number): "day" | "night" {
  return yPercent > 50 ? "night" : "day";
}

/** Expanded dial: sun center on the controller rim at the selected slot angle. */
export function selectorSunBorderPosition(
  layout: SelectorDialLayout,
  sunSizePercent = SELECTOR_SUN_SIZE_RATIO * 100,
) {
  const dx = layout.sun.x - 50;
  const dy = layout.sun.y - 50;
  const angleRad = Math.atan2(dy, dx);
  const borderRadius = 50 - sunSizePercent / 2;

  return {
    x: 50 + borderRadius * Math.cos(angleRad),
    y: 50 + borderRadius * Math.sin(angleRad),
  };
}
