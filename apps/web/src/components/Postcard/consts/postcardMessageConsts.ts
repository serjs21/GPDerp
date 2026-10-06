/** Hard caps for the message typed in the share email modal. */
export const POSTCARD_MESSAGE_MAX_CHARS = 200;
export const POSTCARD_MESSAGE_MAX_LINES = 8;

/** Message box on the card (px). Visual lines (incl. wraps) must fit in MAX_LINES. */
export const POSTCARD_MESSAGE_BOX_WIDTH_PX = 520;
export const POSTCARD_MESSAGE_FONT_PX = 40;
export const POSTCARD_MESSAGE_LINE_HEIGHT_PX = 52;
/** Set as a CSS var on the card so the modal fit measurement uses the exact same stack. */
export const POSTCARD_MESSAGE_FONT_FAMILY =
  'var(--font-postcard-hand), var(--font-lantern-script, "Zen Kurenaido"), cursive';
export const POSTCARD_MESSAGE_BOX_HEIGHT_PX =
  POSTCARD_MESSAGE_LINE_HEIGHT_PX * POSTCARD_MESSAGE_MAX_LINES;

export const POSTCARD_RECIPIENT_LINE_COUNT = 3;
export const POSTCARD_STAMP_SRC = "/postcard/postcard_stamp.svg";
