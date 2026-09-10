/** Compass + stars asset tuning for StyleNavigationWheel. */
export const STYLE_NAVIGATION_WHEEL = {
  compass: {
    src: "/theme-selector/compas_no_letters.svg",
    /** Uniform scale vs dial face (SVG has large padding). */
    scale: 0.72,
    /** Extra orient offset so a primary spike is “up” at reference noon (slot 48 → 0° frame). */
    initialRotationDeg: 0,
  },
  stars: {
    src: "/theme-selector/stars-navigation.svg",
    scale: 0.85,
    initialRotationDeg: 0,
    /** Seconds for one full self-spin (CSS animation duration). */
    spinDurationSec: 48,
  },
} as const;
