/** Native lantern asset size (matches `public/lantern_base.png`). */
export const LANTERN_IMAGE_WIDTH = 330;
export const LANTERN_IMAGE_HEIGHT = 505;
export const LANTERN_IMAGE_ASPECT = LANTERN_IMAGE_WIDTH / LANTERN_IMAGE_HEIGHT;

export const LANTERN_ASSET_SRC = "/lantern_base.png";

/** Default display width in rem (keeps aspect via CSS). */
export const LANTERN_WIDTH_REM = 17.5;

/**
 * Text panel inset as fractions of the lantern box.
 * Clears side frames and the dark wooden base with flame.
 */
export const LANTERN_TEXT_INSET = {
  top: 0.2,
  right: 0.15,
  bottom: 0.22,
  left: 0.15,
} as const;

/** Scale multiplier per discrete flight step (~15–25% down). */
export const LANTERN_SCALE_PER_STEP = 0.825;

/** Zig-zag rotation amplitude in degrees. */
export const LANTERN_ROTATE_DEG = 6;

/** Diagonal up-right offset per step (px). */
export const LANTERN_STEP_X_PX = 52;
export const LANTERN_STEP_Y_PX = -64;

/** Default path length for continuous progress mapping. */
export const LANTERN_DEFAULT_MAX_STEPS = 5;
