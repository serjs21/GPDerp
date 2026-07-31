import type { ColorBalanceValues } from "./backgroundSceneColorBalance";

/** Midday reference is neutral color balance (slot 48 / THEME_STOPS.day). */
export const BACKGROUND_SCENE_THEME_COLOR_BALANCE = {
  /** Weight of moon in the global lighting sample (remainder = skyHorizon). */
  moonSampleWeight: 0.4,
  /** Scales linear RGB delta into slider units (−100…100). */
  rgbToSliderGain: 110,
  /** Full-night global target (moonlit foreground from Storybook tuning). */
  nightGlobalTarget: {
    cyanRed: -6,
    magentaGreen: 0,
    yellowBlue: 29,
  } satisfies ColorBalanceValues,
  /** Full-night mountain target (darker/cooler than foreground). */
  nightMountainTarget: {
    cyanRed: -52,
    magentaGreen: -38,
    yellowBlue: -8,
  } satisfies ColorBalanceValues,
  /** Per-channel minimum allowed for global night balance (floors only). */
  nightGlobalFloors: {
    cyanRed: -18,
    magentaGreen: -12,
    yellowBlue: -100,
  } satisfies ColorBalanceValues,
  /** Solar elevation (deg) where night blend begins / ends. */
  nightElevationStart: 6,
  nightElevationEnd: -12,
  /** Solar elevation (deg) treated as full day strength. */
  dayElevationFull: 35,
} as const;
