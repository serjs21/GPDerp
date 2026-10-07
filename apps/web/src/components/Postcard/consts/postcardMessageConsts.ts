/** Hard caps for the message typed in the share email modal. */
export const POSTCARD_MESSAGE_MAX_CHARS = 200;
export const POSTCARD_MESSAGE_MAX_LINES = 8;

/** Message box on the card (px). Visual lines (incl. wraps) must fit in MAX_LINES. */
export const POSTCARD_MESSAGE_BOX_WIDTH_PX = 560;
export const POSTCARD_MESSAGE_FONT_PX = 46;
export const POSTCARD_MESSAGE_LINE_HEIGHT_PX = 62;
/** Set as a CSS var on the card so the modal fit measurement uses the exact same stack. */
export const POSTCARD_MESSAGE_FONT_FAMILY =
  'var(--font-postcard-hand), var(--font-lantern-script, "Zen Kurenaido"), cursive';
export const POSTCARD_MESSAGE_BOX_HEIGHT_PX =
  POSTCARD_MESSAGE_LINE_HEIGHT_PX * POSTCARD_MESSAGE_MAX_LINES;

/** Ruled address lines; POSTCARD_ADDRESSEE goes on the first one. */
export const POSTCARD_ADDRESS_LINE_COUNT = 3;
/** Every recipient gets the same back. */
export const POSTCARD_ADDRESSEE = "you!";

/** "From: <name>" signature. Names longer than LONG_NAME_CHARS move to the bottom-left corner and shrink. */
export const POSTCARD_SIGNATURE_FONT_PX = 46;
export const POSTCARD_SIGNATURE_HEART_FONT_PX = 38;
export const POSTCARD_SIGNATURE_HEART_GAP_PX = 14;
export const POSTCARD_SIGNATURE_INDENT_PX = 130;
export const POSTCARD_SIGNATURE_LONG_NAME_CHARS = 12;
export const POSTCARD_SIGNATURE_LONG_MAX_FONT_PX = 40;
export const POSTCARD_SIGNATURE_MIN_FONT_PX = 28;
/** Rough average glyph width of the hand font, used to size long signatures without measuring. */
export const POSTCARD_SIGNATURE_CHAR_WIDTH_EM = 0.42;

export const POSTCARD_STAMP_SRC = "/postcard/postcard_stamp.svg";
