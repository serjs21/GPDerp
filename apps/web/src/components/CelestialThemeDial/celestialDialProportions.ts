/** Shared dial geometry — single source for selector dial and background body scale. */
export const SELECTOR_EARTH_SIZE_RATIO = 0.36;
export const SELECTOR_ORBIT_RADIUS_RATIO = 0.38;

/** Mean apparent angular diameters (degrees). Sun ~0.5332°, Moon ~0.5286° from Earth. */
export const SUN_ANGULAR_DIAMETER_DEG = 0.5332;
export const MOON_ANGULAR_DIAMETER_DEG = 0.5286;
export const MOON_TO_SUN_APPARENT_SIZE_RATIO =
  MOON_ANGULAR_DIAMETER_DEG / SUN_ANGULAR_DIAMETER_DEG;

export const SELECTOR_SUN_SIZE_RATIO = 0.2;
export const SELECTOR_MOON_SIZE_RATIO =
  SELECTOR_SUN_SIZE_RATIO * MOON_TO_SUN_APPARENT_SIZE_RATIO;

/** @deprecated Use SELECTOR_SUN_SIZE_RATIO */
export const SELECTOR_BODY_SIZE_RATIO = SELECTOR_SUN_SIZE_RATIO;

export const CELESTIAL_SUN_BODY_WIDTH_REM = 6;
export const CELESTIAL_MOON_BODY_WIDTH_REM =
  CELESTIAL_SUN_BODY_WIDTH_REM * MOON_TO_SUN_APPARENT_SIZE_RATIO;

/** Earth sky fill fades from opaque inner disk to transparent at the PNG ring. */
export const EARTH_SKY_INNER_RADIUS_PERCENT = 60;
export const EARTH_SKY_FADE_OUTER_RADIUS_PERCENT = 65;

/** Background sun width as vmin, matching dial sun ratio on a unit circle. */
export const SELECTOR_BODY_SIZE_VMIN = SELECTOR_SUN_SIZE_RATIO * 100;
