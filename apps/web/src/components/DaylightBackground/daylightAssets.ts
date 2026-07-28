export const DAYLIGHT_ASSETS = {
  background: "/background.png",
  moon: "/moon.png",
  sun: "/sun.png",
  mountains: "/mountains.png",
  shrine: "/shrine.png",
  clouds: ["/clouds_1.png", "/clouds_2.png", "/clouds_3.png"] as const,
  masks: {
    sky: "/background-masks/sky-mask.png",
    horizon: "/background-masks/horizon-mask.png",
    mountain: "/background-masks/mountain-mask.png",
    midground: "/background-masks/midground-mask.png",
    foreground: "/background-masks/foreground-mask.png",
  },
} as const;
