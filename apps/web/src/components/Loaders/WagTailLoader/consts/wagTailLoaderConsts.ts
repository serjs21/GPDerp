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
  attachXPercent: 86.5,
  attachYPercent: 47.5,
  tailWidthPercent: 17,
  baseRotationDeg: -51,
  stepDeg: 30,
  baseJitterDeg: 5,
  stepJitterDeg: 5,
  opacities: [0.2, 0.8, 0.7, 0.2],
  opacityJumpSteps: 2,
  stepMs: 60,
  linesOffsetXPercent: -4.5,
  linesOffsetYPercent: 1.5,
  linesWidthPercent: 27,
  linesBaseRotationDeg: -31,
  linesOpacities: [0.2, 0.8, 0.7, 0.2],
  linesOpacityJumpSteps: 1,
  linesShiftPx: 0.5,
  linesRotateDeg: 10,
  showAttachPoint: false,
} as const;
