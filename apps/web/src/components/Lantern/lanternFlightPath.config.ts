/** Rest pose along the flight segment (pathS = 0). */
export const LANTERN_FLIGHT_PATH_INITIAL = 0;

/** Epsilon for rest-pose handoff and visibility. */
export const LANTERN_FLIGHT_PATH_REST_EPSILON = 0.02;

/** Max rotation amplitude derived from path tangent (degrees). */
export const LANTERN_FLIGHT_PATH_ROTATE_GAIN = 8;

/** Arc-length spacing between queued lanterns (normalized 0–1 along flight segment). */
export const LANTERN_FLIGHT_QUEUE_SPACING = 0.14;
