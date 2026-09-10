/** Compass, stars, and body icon tuning for StyleNavigationWheel. */
export const STYLE_NAVIGATION_WHEEL = {
  /**
   * Extra degrees added to slot-driven circle rotation so dial clicks
   * land on the center of stars-navigation.svg on the rim.
   */
  circleBaseRotationOffsetDeg: 22,
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
    sizePercent: 8,
    initialRotationDeg: 0,
    /**
     * Center of the SVG on the circle rim (50% radius from face center)
     * so roughly half the art sits outside the disc.
     */
    leftPercent: 75,
    topPercent: 7,
    /** Seconds for one full self-spin (CSS animation duration). */
    spinDurationSec: 48,
  },
  /**
   * Background star icons on the rotating circle base.
   * Icons are picked from `srcs` (stable pseudo-random per index).
   * Centers stay outside the inner half-radius disc (see minCenterDistancePercent).
   * Each entry: size, position, opacity, and local rotation.
   */
  starClusters: {
    /** Face radius is 50% of width; stars stay ≥ this far from center. */
    minCenterDistancePercent: 25,
    srcs: [
      "/stars/star1.svg",
      "/stars/star2.svg",
      "/stars/star3.svg",
      "/stars/star4.svg",
      "/stars/star5.svg",
      "/stars/star6.svg",
    ],
    items: [
      { sizePercent: 2, leftPercent: 50, topPercent: 22, opacity: 0.65, rotationDeg: 0 },
      { sizePercent: 2, leftPercent: 61.1, topPercent: 15.8, opacity: 0.5, rotationDeg: 40 },
      { sizePercent: 2, leftPercent: 75.9, topPercent: 14.4, opacity: 0.7, rotationDeg: 95 },
      { sizePercent: 2.5, leftPercent: 72.7, topPercent: 33.5, opacity: 0.45, rotationDeg: 150 },
      { sizePercent: 2.5, leftPercent: 84.2, topPercent: 38.9, opacity: 0.6, rotationDeg: 200 },
      { sizePercent: 2.5, leftPercent: 94, topPercent: 50, opacity: 0.45, rotationDeg: 150 },
      { sizePercent: 2.5, leftPercent: 76.6, topPercent: 58.7, opacity: 0.6, rotationDeg: 200 },
      { sizePercent: 3, leftPercent: 79.1, topPercent: 71.2, opacity: 0.55, rotationDeg: 250 },
      { sizePercent: 3, leftPercent: 75.9, topPercent: 85.6, opacity: 0.4, rotationDeg: 300 },
      { sizePercent: 3, leftPercent: 58.7, topPercent: 76.6, opacity: 0.75, rotationDeg: 25 },
      { sizePercent: 2.2, leftPercent: 50, topPercent: 86, opacity: 0.55, rotationDeg: 55 },
      { sizePercent: 2.8, leftPercent: 36.4, topPercent: 91.8, opacity: 0.5, rotationDeg: 110 },
      { sizePercent: 2, leftPercent: 33.5, topPercent: 72.7, opacity: 0.6, rotationDeg: 175 },
      { sizePercent: 2.4, leftPercent: 20.9, topPercent: 71.2, opacity: 0.45, rotationDeg: 220 },
      { sizePercent: 2.6, leftPercent: 8.2, topPercent: 63.6, opacity: 0.65, rotationDeg: 280 },
      { sizePercent: 2.1, leftPercent: 22, topPercent: 50, opacity: 0.5, rotationDeg: 320 },
      { sizePercent: 2.7, leftPercent: 15.8, topPercent: 38.9, opacity: 0.7, rotationDeg: 70 },
      { sizePercent: 2.3, leftPercent: 14.4, topPercent: 24.1, opacity: 0.4, rotationDeg: 135 },
      { sizePercent: 2.5, leftPercent: 33.5, topPercent: 27.3, opacity: 0.35, rotationDeg: 190 },
      { sizePercent: 2.2, leftPercent: 38.9, topPercent: 15.8, opacity: 0.55, rotationDeg: 260 },
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
