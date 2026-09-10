/** Compass, stars, and body icon tuning for StyleNavigationWheel. */
export const STYLE_NAVIGATION_WHEEL = {
  compass: {
    src: "/theme-selector/compas_no_letters.svg",
    /** Uniform scale vs dial face (SVG has large padding). */
    scale: 0.7,
    /** Extra orient offset so a primary spike is “up” at reference noon (slot 48 → 0° frame). */
    initialRotationDeg: 0,
  },
  stars: {
    src: "/theme-selector/stars-navigation.svg",
    scale: 0.10,
    initialRotationDeg: 0,
    leftPercent: 70,
    topPercent: 40,
    /** Seconds for one full self-spin (CSS animation duration). */
    spinDurationSec: 48,
  },
  earth: {
    src: "/theme-selector/earth.svg",
    /** Size as fraction of dial face. */
    sizePercent: 10,
  },
  /** Fixed on the face (does not rotate with circleBase). */
  sun: {
    src: "/theme-selector/sun.svg",
    sizePercent: 12,
    /** Center of icon, percent of face. */
    leftPercent: 67,
    topPercent: 8,
  },
  /** Fixed opposite the sun; self-spins. */
  moon: {
    src: "/theme-selector/moon.svg",
    sizePercent: 8,
    leftPercent: 42,
    topPercent: 90,
    spinDurationSec: 36,
  },
} as const;
