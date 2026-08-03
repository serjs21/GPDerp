/** Geographic mask URLs — white (#fff) = region, black = excluded (luminance mask-mode). */
export const DAYLIGHT_BACKGROUND_MASKS = {
  sky: "/background-masks/sky-mask.png",
  horizon: "/background-masks/horizon-mask.png",
  mountain: "/background-masks/mountain-mask.png",
  midground: "/background-masks/midground-mask.png",
  foreground: "/background-masks/foreground-mask.png",
} as const;

/** Layer stack: sun/moon above sky/horizon, below geographic masks. */
export const DAYLIGHT_BACKGROUND_Z = {
  art: 0,
  sky: 1,
  horizon: 2,
  celestial: 3,
  mountain: 4,
  midground: 5,
  foreground: 6,
} as const;
