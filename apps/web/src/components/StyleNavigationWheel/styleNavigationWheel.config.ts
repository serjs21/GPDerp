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
    /** Size as percent of dial face (independent of left/top). */
    sizePercent: 5,
    initialRotationDeg: 0,
    leftPercent: 85,
    topPercent: 70,
    /** Seconds for one full self-spin (CSS animation duration). */
    spinDurationSec: 48,
  },
  /**
   * Background star clusters on the rotating circle base.
   * Each entry: size + center position (percent of dial face).
   */
  starClusters: {
    src: "/theme-selector/stars-background.svg",
    items: [
      { sizePercent: 5, leftPercent: 22, topPercent: 18 },
      { sizePercent: 5, leftPercent: 72, topPercent: 16 },
      { sizePercent: 4, leftPercent: 88, topPercent: 42 },
      { sizePercent: 4, leftPercent: 78, topPercent: 78 },
      { sizePercent: 4, leftPercent: 48, topPercent: 88 },
      { sizePercent: 3, leftPercent: 18, topPercent: 72 },
      { sizePercent: 3, leftPercent: 12, topPercent: 42 },
      { sizePercent: 3, leftPercent: 38, topPercent: 28 },
    ],
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
