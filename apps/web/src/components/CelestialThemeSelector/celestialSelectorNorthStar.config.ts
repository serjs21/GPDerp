/** North star rim marker — selection indicator on the controller border. */
export const CELESTIAL_SELECTOR_NORTH_STAR = {
  sizePercent: 6,
  color: "#f1f1e2",
  glowColor: "#f1f1e2",
  glowMixPercent: 55,
  glowBlurRem: 0.65,
  zIndex: 4,
} as const;

/** Glow bleed margin (% of dial radius) when clamping sun/moon inside the face. */
export const CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT = 4;
export const CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT = 3;
