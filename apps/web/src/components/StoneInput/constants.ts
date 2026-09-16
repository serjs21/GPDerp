/** Native stone asset size (matches `public/input_stone_base.png`). */
export const STONE_INPUT_IMAGE_WIDTH = 1439;
export const STONE_INPUT_IMAGE_HEIGHT = 920;

/**
 * Opaque content bbox inside the PNG (alpha > 8), as fractions of the full asset.
 * Used to crop layout height so transparent padding does not reserve space.
 */
export const STONE_INPUT_CONTENT_INSET = {
  top: 0.2533,
  right: 0.0014,
  bottom: 0.213,
  left: 0.0083,
} as const;

export const STONE_INPUT_CONTENT_WIDTH =
  STONE_INPUT_IMAGE_WIDTH *
  (1 - STONE_INPUT_CONTENT_INSET.left - STONE_INPUT_CONTENT_INSET.right);
export const STONE_INPUT_CONTENT_HEIGHT =
  STONE_INPUT_IMAGE_HEIGHT *
  (1 - STONE_INPUT_CONTENT_INSET.top - STONE_INPUT_CONTENT_INSET.bottom);

export const STONE_INPUT_IMAGE_ASPECT =
  STONE_INPUT_CONTENT_WIDTH / STONE_INPUT_CONTENT_HEIGHT;

export const STONE_INPUT_ASSET_SRC = "/input_stone_base.png";

/** Default display width in rem (keeps aspect via CSS). */
export const STONE_INPUT_WIDTH_REM = 28;

/**
 * Subject field inset as fractions of the cropped stone content box.
 * Matches `.input` inset in StoneInput.module.css.
 */
export const STONE_INPUT_FORM_INSET = {
  top: 0.556,
  right: 0.281,
  bottom: 0.257,
  left: 0.274,
} as const;

/**
 * Submit button inset as fractions of the cropped stone content box.
 * Matches `.submit` inset in StoneInput.module.css.
 */
export const STONE_INPUT_SUBMIT_INSET = {
  top: 0.275,
  right: 0.13,
  bottom: 0.051,
  left: 0.779,
} as const;
