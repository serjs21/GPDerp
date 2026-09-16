/** Tunable pose-to-pose / ghost-frame transition parameters. */
export const STEPPED_TRANSITION = {
  poseCount: 8,
  holdMs: 170,
  crossfadeMs: 220,

  positionJitterPx: 1.5,
  rotationJitterDeg: 1.25,
  scaleJitter: 0.008,

  irregularSpacing: true,

  /** Insert a midpoint ghost when adjacent poses are farther than this. */
  smearDistancePx: 140,
  smearOpacityCap: 0.35,

  /** Reduced-motion: brief start→end fade only. */
  reducedMotionCrossfadeMs: 120,
} as const;

/** Irregular progress samples (poseCount = 8). Slightly denser near start/end. */
export const STEPPED_IRREGULAR_PROGRESSES = [
  0, 0.08, 0.19, 0.34, 0.51, 0.66, 0.82, 1,
] as const;
