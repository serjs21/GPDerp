/** Native post-sign asset size (matches `public/input/input_base_post_sign.png`). */
export const POST_SIGN_INPUT_IMAGE_WIDTH = 1448;
export const POST_SIGN_INPUT_IMAGE_HEIGHT = 1086;

/**
 * Opaque content bbox inside the PNG (alpha > 8), as fractions of the full asset.
 * The control paints the full image (no crop clip); these remain for measurement.
 */
export const POST_SIGN_INPUT_CONTENT_INSET = {
  top: 0.0092,
  right: 0.105,
  bottom: 0.0175,
  left: 0.0739,
} as const;

export const POST_SIGN_INPUT_CONTENT_WIDTH =
  POST_SIGN_INPUT_IMAGE_WIDTH *
  (1 - POST_SIGN_INPUT_CONTENT_INSET.left - POST_SIGN_INPUT_CONTENT_INSET.right);
export const POST_SIGN_INPUT_CONTENT_HEIGHT =
  POST_SIGN_INPUT_IMAGE_HEIGHT *
  (1 - POST_SIGN_INPUT_CONTENT_INSET.top - POST_SIGN_INPUT_CONTENT_INSET.bottom);

export const POST_SIGN_INPUT_IMAGE_ASPECT =
  POST_SIGN_INPUT_CONTENT_WIDTH / POST_SIGN_INPUT_CONTENT_HEIGHT;

export const POST_SIGN_INPUT_ASSET_SRC = "/input/input_base_post_sign.png";

/** Default display width in rem (keeps aspect via CSS). */
export const POST_SIGN_INPUT_WIDTH_REM = 20;

/**
 * Subject field inset as fractions of the full asset box.
 * Sits on the open wooden plank, clear of the post blossoms. Matches `.input`.
 */
export const POST_SIGN_INPUT_FORM_INSET = {
  top: 0.2185,
  right: 0.302,
  bottom: 0.655,
  left: 0.304,
} as const;

/**
 * Submit button inset as fractions of the full asset box.
 * Right end of the plank, before the arrow tip. Matches `.submit`.
 */
export const POST_SIGN_INPUT_SUBMIT_INSET = {
  top: 0.184,
  right: 0.138,
  bottom: 0.631,
  left: 0.739,
} as const;
