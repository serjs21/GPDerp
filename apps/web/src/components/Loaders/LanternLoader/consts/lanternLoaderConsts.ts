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
    { rotationDeg: 0, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
   
    { rotationDeg: 4, xPercent: 0, yPercent: -2, scale: 1.03, opacity: 0.95 },
    { rotationDeg: 6, xPercent: 0, yPercent: 0, scale: 1.06, opacity: 1 },
    { rotationDeg: 3, xPercent: 0, yPercent: -2, scale: 1.04, opacity: 0.95 },
    { rotationDeg: 2, xPercent: 0, yPercent: -2, scale: 1.02, opacity: 0.95 },

    { rotationDeg: 0, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },

    { rotationDeg: -2, xPercent: 0, yPercent: 0, scale: 0.97, opacity: 0.83 },
    { rotationDeg: -5, xPercent: 0, yPercent: -2, scale: 0.94, opacity: 0.85 },
    { rotationDeg: -3, xPercent: 0, yPercent: 0, scale: 0.95, opacity: 1 },
    { rotationDeg: -1, xPercent: 0, yPercent: -2, scale: 0.96, opacity: 0.85 },
  ],
  stepTransitionMs: 500,
  textXPercent: 50,
  textYPercent: 55,
  textSkewXDeg: -10,
  textSkewYDeg: 0,
} as const;

/** "Loading" gains one dot per step up to this many, then starts over (fixed keyframes in the CSS module). */
export const LANTERN_LOADER_DOT_COUNT = 3;