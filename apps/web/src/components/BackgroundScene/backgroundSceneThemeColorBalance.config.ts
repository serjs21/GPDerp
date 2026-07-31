import type { ColorBalanceValues } from "./backgroundSceneColorBalance";

/** Midday reference is neutral color balance (slot 48 / THEME_STOPS.day). */
export const BACKGROUND_SCENE_THEME_COLOR_BALANCE = {
  /** Weight of moon in the global lighting sample (remainder = skyHorizon). */
  moonSampleWeight: 0.4,
  /** Scales linear RGB delta into slider units (−100…100). */
  rgbToSliderGain: 110,
  /** Full-night global target (moonlit, readable foreground). */
  nightGlobalTarget: {
    cyanRed: -5,
    magentaGreen: -2,
    yellowBlue: -22,
  } satisfies ColorBalanceValues,
  /** Added on top of global at full night so mountain reads darker/cooler. */
  mountainNightExtra: {
    cyanRed: -7,
    magentaGreen: -3,
    yellowBlue: -16,
  } satisfies ColorBalanceValues,
  /** Per-channel minimum (most negative) allowed for global night balance. */
  nightGlobalCaps: {
    cyanRed: -18,
    magentaGreen: -12,
    yellowBlue: -35,
  } satisfies ColorBalanceValues,
  /** Solar elevation (deg) where night blend begins / ends. */
  nightElevationStart: 6,
  nightElevationEnd: -12,
  /** Solar elevation (deg) treated as full day strength. */
  dayElevationFull: 35,
} as const;
