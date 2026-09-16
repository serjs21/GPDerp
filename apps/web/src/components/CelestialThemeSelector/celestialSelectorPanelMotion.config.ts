/** Open/close motion for the celestial theme selector panel. */
export const CELESTIAL_SELECTOR_PANEL_MOTION = {
  durationMs: 500,
  ease: "inOutQuad",
  /** Bright star highlight (matches north-star / selector star glow). */
  ringStroke: "#f1f1e2",
  /** True CSS px via `vector-effect: non-scaling-stroke`. */
  ringStrokeWidthPx: 1,
  viewportMarginPx: 8,
  panelOffsetPx: 8,
} as const;
