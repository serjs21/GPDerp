import {
  SELECTOR_MOON_SIZE_RATIO,
  SELECTOR_SUN_SIZE_RATIO,
} from "@/components/CelestialThemeDial/celestialDialProportions";

/** Dial sun/moon base sizes and opacity-linked scale knobs. */
export const CELESTIAL_SELECTOR_BODY_SIZE = {
  sunSizePercent: SELECTOR_SUN_SIZE_RATIO * 100,
  moonSizePercent: SELECTOR_MOON_SIZE_RATIO * 100,
  /** Slight scale-up applied at full opacity (multiplies depth scale). */
  fullOpacityBoost: 151.05,
  /** How fast scale falls vs opacity drop when opacity < 1 (2 = twice opacity rate). */
  opacityFadeRate: 2,
  /** Floor so faded bodies do not collapse to zero mid-crossfade. */
  minScale: 0,
} as const;
