/** Rest pose along the flight segment (pathS = 0, purple label "1"). */
export const LANTERN_FLIGHT_PATH_INITIAL = 0;

/** Epsilon for rest-pose handoff and visibility. */
export const LANTERN_FLIGHT_PATH_REST_EPSILON = 0.02;

/** Max rotation amplitude derived from path tangent (degrees). */
export const LANTERN_FLIGHT_PATH_ROTATE_GAIN = 8;

/** Arc-length spacing between queued lanterns (normalized 0–1 along flight segment). */
export const LANTERN_FLIGHT_QUEUE_SPACING = 0.14;

/** Carousel scale at stop-16 (fully collapsed). */
export const LANTERN_CAROUSEL_MIN_SCALE = 0;

/** Ease-out depth scale tail for carousel stops (stop-1 = 1, stop-15 ≈ minTailScale). */
export const LANTERN_CAROUSEL_DEPTH_SCALE = {
  minTailScale: 0.01,
} as const;

/** Fast-at-start easing for depth scale along carousel stops. */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Fade zone from initial (pathS 0) to exit (pathS 1, purple label "0"). */
export const LANTERN_FLIGHT_PATH_FADE = {
  initialPathS: 0,
  exitPathS: 1,
  minOpacity: 0,
  /** Scale stays 1 on segment-0; opacity fades to 0. */
  exitScale: 1,
} as const;
