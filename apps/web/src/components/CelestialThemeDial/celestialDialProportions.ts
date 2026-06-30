/** Shared dial geometry — single source for selector dial and background body scale. */
export const SELECTOR_EARTH_SIZE_RATIO = 0.36;
export const SELECTOR_BODY_SIZE_RATIO = 0.2;
export const SELECTOR_ORBIT_RADIUS_RATIO = 0.38;

/** Earth sky fill fades from opaque inner disk to transparent at the PNG ring. */
export const EARTH_SKY_INNER_RADIUS_PERCENT = 36;
export const EARTH_SKY_FADE_OUTER_RADIUS_PERCENT = 48;

/** Background sun/moon width as vmin, matching dial body ratio on a unit circle. */
export const SELECTOR_BODY_SIZE_VMIN = SELECTOR_BODY_SIZE_RATIO * 100;
