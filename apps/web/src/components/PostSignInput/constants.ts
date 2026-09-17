/** Native post-sign asset size (matches `public/input/input_base_post_sign.png`). */
export const POST_SIGN_INPUT_IMAGE_WIDTH = 1448;
export const POST_SIGN_INPUT_IMAGE_HEIGHT = 1086;

/**
 * Opaque content bbox inside the PNG (alpha > 8), as fractions of the full asset.
 * Used to crop layout height so transparent padding does not reserve space.
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
export const POST_SIGN_INPUT_WIDTH_REM = 22;

/**
 * Subject field inset as fractions of the cropped sign content box.
 * Sits on the horizontal wooden plank. Matches `.input` inset in PostSignInput.module.css.
 */
export const POST_SIGN_INPUT_FORM_INSET = {
  top: 0.205,
  right: 0.2,
  bottom: 0.665,
  left: 0.155,
} as const;

/**
 * Submit button inset as fractions of the cropped sign content box.
 * Right end of the plank, before the arrow tip. Matches `.submit` inset.
 */
export const POST_SIGN_INPUT_SUBMIT_INSET = {
  top: 0.175,
  right: 0.045,
  bottom: 0.635,
  left: 0.795,
} as const;
