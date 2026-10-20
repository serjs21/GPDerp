export const WAG_TAIL_ASSETS = {
  base: "/loader/loader_dog_base.svg",
  tail: "/loader/tail.svg",
  motionLines: "/loader/motion_lines.svg",
} as const;

/** Intrinsic sizes (SVG viewBoxes) for width/height attributes and the stage aspect ratio. */
export const WAG_TAIL_ASSET_SIZES = {
  base: { width: 359.45, height: 343.23 },
  tail: { width: 110, height: 177 },
  motionLines: { width: 157, height: 176 },
} as const;

export const WAG_TAIL_COPY_COUNT = 4;

/** Copy shown alone (fully opaque) under prefers-reduced-motion. */
export const WAG_TAIL_REST_COPY_INDEX = 1;

/** Starting point; tune attach / motion-line placement with the story controls. */
export const WAG_TAIL_LOADER_DEFAULTS = {
  widthRem: 12,
  attachXPercent: 91.5,
  attachYPercent: 59.5,
  tailWidthPercent: 28,
  baseRotationDeg: -30,
  stepDeg: 20,
  opacities: [0.6, 1, 0.8, 0.5],
  stepMs: 100,
  linesOffsetXPercent: -6,
  linesOffsetYPercent: 4,
  linesWidthPercent: 42,
  linesShiftPx: 2,
  linesRotateDeg: 4,
  showAttachPoint: false,
} as const;
