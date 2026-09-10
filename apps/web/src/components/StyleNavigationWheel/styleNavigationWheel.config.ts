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
   * Background star clusters on the rotating circle base.
   * Each entry: size, position, opacity, and local rotation.
   */
  starClusters: {
    src: "/theme-selector/stars-background.svg",
    items: [
      { sizePercent: 2, leftPercent: 22, topPercent: 18, opacity: 0.85, rotationDeg: 0 },
      { sizePercent: 2, leftPercent: 72, topPercent: 16, opacity: 0.7, rotationDeg: 40 },
      { sizePercent: 2, leftPercent: 88, topPercent: 42, opacity: 0.9, rotationDeg: 95 },
      { sizePercent: 2.5, leftPercent: 78, topPercent: 78, opacity: 0.65, rotationDeg: 150 },
      { sizePercent: 2.5, leftPercent: 48, topPercent: 88, opacity: 0.8, rotationDeg: 200 },
      { sizePercent: 2.5, leftPercent: 18, topPercent: 78, opacity: 0.65, rotationDeg: 150 },
      { sizePercent: 2.5, leftPercent: 28, topPercent: 88, opacity: 0.8, rotationDeg: 200 },
      { sizePercent: 3, leftPercent: 18, topPercent: 72, opacity: 0.75, rotationDeg: 250 },
      { sizePercent: 3, leftPercent: 12, topPercent: 42, opacity: 0.6, rotationDeg: 300 },
      { sizePercent: 3, leftPercent: 38, topPercent: 28, opacity: 0.95, rotationDeg: 25 },
      // Additional clusters scattered through the dial
      { sizePercent: 2.2, leftPercent: 50, topPercent: 12, opacity: 0.75, rotationDeg: 55 },
      { sizePercent: 2.8, leftPercent: 82, topPercent: 28, opacity: 0.7, rotationDeg: 110 },
      { sizePercent: 2, leftPercent: 92, topPercent: 58, opacity: 0.8, rotationDeg: 175 },
      { sizePercent: 2.4, leftPercent: 68, topPercent: 62, opacity: 0.65, rotationDeg: 220 },
      { sizePercent: 2.6, leftPercent: 58, topPercent: 72, opacity: 0.85, rotationDeg: 280 },
      { sizePercent: 2.1, leftPercent: 32, topPercent: 58, opacity: 0.7, rotationDeg: 320 },
      { sizePercent: 2.7, leftPercent: 28, topPercent: 42, opacity: 0.9, rotationDeg: 70 },
      { sizePercent: 2.3, leftPercent: 55, topPercent: 32, opacity: 0.6, rotationDeg: 135 },
      { sizePercent: 2.5, leftPercent: 42, topPercent: 48, opacity: 0.55, rotationDeg: 190 },
      { sizePercent: 2.2, leftPercent: 65, topPercent: 48, opacity: 0.75, rotationDeg: 260 },
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
