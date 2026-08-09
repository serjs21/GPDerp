/** Linear step animation duration (ms). */
export const LANTERN_PATH_STEP_MS = 300;

/** Idle gap after last wheel tick before another scroll step is allowed. */
export const LANTERN_PATH_WHEEL_GESTURE_IDLE_MS = 200;

/** Carousel depth stops on the path (stop-1 … stop-16). */
export const LANTERN_PATH_STOP_COUNT = 16;

/** Virtual off-screen fade zone before stop-0. */
export const LANTERN_PATH_VIRTUAL_STOP = -1;

/** Minimum visible path stop (virtual fade zone). */
export const LANTERN_PATH_MIN_VISIBLE_STOP = LANTERN_PATH_VIRTUAL_STOP;

/** Maximum visible path stop along the carousel. */
export const LANTERN_PATH_MAX_VISIBLE_STOP = LANTERN_PATH_STOP_COUNT;

/** Normalized position for lanterns pushed off-screen left. */
export const LANTERN_PATH_PUSH_OUT_X = -0.14;

/** Normalized y for off-screen push-out. */
export const LANTERN_PATH_PUSH_OUT_Y = 0;

/** Path stop index for the default focus position (stop-1). */
export const LANTERN_PATH_FOCUS_STOP = 1;

/** Path stop index for exit rest (stop-0). */
export const LANTERN_PATH_EXIT_STOP = 0;
