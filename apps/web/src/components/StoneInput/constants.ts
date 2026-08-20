/** Native stone asset size (matches `public/input_stone_base.png`). */
export const STONE_INPUT_IMAGE_WIDTH = 1439;
export const STONE_INPUT_IMAGE_HEIGHT = 920;
export const STONE_INPUT_IMAGE_ASPECT =
  STONE_INPUT_IMAGE_WIDTH / STONE_INPUT_IMAGE_HEIGHT;

export const STONE_INPUT_ASSET_SRC = "/input_stone_base.png";

/** Default display width in rem (keeps aspect via CSS). */
export const STONE_INPUT_WIDTH_REM = 28;

/**
 * Subject field inset as fractions of the stone box.
 * Matches `.input` inset in StoneInput.module.css.
 */
export const STONE_INPUT_FORM_INSET = {
  top: 0.63,
  right: 0.28,
  bottom: 0.28,
  left: 0.28,
} as const;

/**
 * Submit button inset placeholder — tune in StoneInput.module.css `.submit`.
 */
export const STONE_INPUT_SUBMIT_INSET = {
  top: 0.55,
  right: 0.12,
  bottom: 0.22,
  left: 0.72,
} as const;
