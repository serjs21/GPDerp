export const BACKGROUND_SCENE_ASSETS = {
  base: "/background/background_base.webp",
  baseSrcSet:
    "/background/background_base_1152w.webp 1152w, /background/background_base_1440w.webp 1440w, /background/background_base.webp 1672w",
  /** Matches `.baseArtStack` width: `max(100%, 1100px)` of the full-viewport scene. */
  baseSizes: "max(100vw, 1100px)",
  masks: {
    mountain: "/background/masks/mountain-mask.png",
  },
} as const;
