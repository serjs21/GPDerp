export const LANTERN_LOADER_ASSET = {
  src: "/loader/loader_lantern_simplified.svg",
  /** SVG viewBox, for width/height attributes and the aspect ratio. */
  width: 388.08,
  height: 512,
} as const;

/** Starting point; tune the poses and timing with the story controls. */
export const LANTERN_LOADER_DEFAULTS = {
  widthRem: 8,
  steps: [
    { rotationDeg: -6, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
    { rotationDeg: 0, xPercent: 0, yPercent: -4, scale: 1.03, opacity: 0.85 },
    { rotationDeg: 6, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
    { rotationDeg: 0, xPercent: 0, yPercent: -4, scale: 1.03, opacity: 0.85 },
  ],
  stepTransitionMs: 400,
} as const;
