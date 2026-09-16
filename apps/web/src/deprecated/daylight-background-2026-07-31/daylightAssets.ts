export const DAYLIGHT_ASSETS = {
  background: "/deprecated/daylight/background.png",
  moon: "/celestial/moon.png",
  sun: "/celestial/sun.png",
  mountains: "/deprecated/daylight/mountains.png",
  shrine: "/deprecated/daylight/shrine.png",
  clouds: ["/deprecated/daylight/clouds_1.png", "/deprecated/daylight/clouds_2.png", "/deprecated/daylight/clouds_3.png"] as const,
  masks: {
    sky: "/deprecated/daylight/masks/sky-mask.png",
    horizon: "/deprecated/daylight/masks/horizon-mask.png",
    mountain: "/background/masks/mountain-mask.png",
    midground: "/deprecated/daylight/masks/midground-mask.png",
    foreground: "/deprecated/daylight/masks/foreground-mask.png",
  },
} as const;
