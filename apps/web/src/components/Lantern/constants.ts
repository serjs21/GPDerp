/** Native lantern asset size (matches `public/lantern_base.png`). */
export const LANTERN_IMAGE_WIDTH = 368;
export const LANTERN_IMAGE_HEIGHT = 391;
export const LANTERN_IMAGE_ASPECT = LANTERN_IMAGE_WIDTH / LANTERN_IMAGE_HEIGHT;

export const LANTERN_ASSET_SRC = "/lantern_base.png";

/** Default display width in rem (keeps aspect via CSS). */
export const LANTERN_WIDTH_REM = 17.5;

/**
 * Text panel inset as fractions of the lantern box.
 * Clears side frames and the dark wooden base with flame.
 */
export const LANTERN_TEXT_INSET = {
  top: 0.08,
  right: 0.1,
  bottom: 0.21,
  left: 0.1,
} as const;

/** `.flame` glow placement as fractions of the lantern box (see Lantern.module.css). */
export const LANTERN_FLAME_BOTTOM = 0.075;
export const LANTERN_FLAME_HEIGHT = 0.1;
/** Vertical center of the flame glow from the lantern box bottom — path anchor point. */
export const LANTERN_FLAME_ANCHOR_Y = -0.075; //LANTERN_FLAME_BOTTOM + LANTERN_FLAME_HEIGHT / 2;

/** Default path length for continuous progress mapping. */
export const LANTERN_DEFAULT_MAX_STEPS = 5;
