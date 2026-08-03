import { LANTERN_FLIGHT_PATH_INITIAL as SVG_INITIAL } from "./lanternFlightPathSvg";

/** Bottom of the right dip — primary lantern rest pose (scale = 1, full opacity). */
export const LANTERN_FLIGHT_PATH_INITIAL = SVG_INITIAL;

/** Scale at path start (far left). */
export const LANTERN_FLIGHT_PATH_MIN_SCALE = 0.22;

/** Scale at path exit (top-right). */
export const LANTERN_FLIGHT_PATH_MAX_SCALE = 1.18;

/** Max rotation amplitude derived from path tangent (degrees). */
export const LANTERN_FLIGHT_PATH_ROTATE_GAIN = 8;

/** Arc-length spacing between queued lanterns (normalized 0–1 along path). */
export const LANTERN_FLIGHT_QUEUE_SPACING = 0.14;
