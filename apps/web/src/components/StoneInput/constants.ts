/** Native stone asset size (matches `public/input_stone_base.png`). */
export const STONE_INPUT_IMAGE_WIDTH = 1439;
export const STONE_INPUT_IMAGE_HEIGHT = 920;
export const STONE_INPUT_IMAGE_ASPECT =
  STONE_INPUT_IMAGE_WIDTH / STONE_INPUT_IMAGE_HEIGHT;

export const STONE_INPUT_ASSET_SRC = "/input_stone_base.png";

/** Default display width in rem (keeps aspect via CSS). */
export const STONE_INPUT_WIDTH_REM = 28;

/**
 * Form panel inset as fractions of the stone box.
 * Clears transparent margins above/below the carved face.
 */
export const STONE_INPUT_FORM_INSET = {
  top: 0.32,
  right: 0.18,
  bottom: 0.28,
  left: 0.18,
} as const;
