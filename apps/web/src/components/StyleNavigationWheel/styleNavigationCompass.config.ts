/** Compass rose asset tuning for StyleNavigationWheel. */
export const STYLE_NAVIGATION_COMPASS = {
  src: "/theme-selector/compas_no_letters.svg",
  /** Uniform scale vs dial face (SVG has large padding). */
  scale: 0.72,
  /** Extra orient offset so a primary spike is “up” at reference noon (slot 48 → 0° frame). */
  initialRotationDeg: 0,
} as const;
