/** Mirrors apps/web/src/components/Postcard/consts/postcardMessageConsts.ts (postcard message side). */
export const POSTCARD_MESSAGE_MAX_CHARS = 200;
export const POSTCARD_MESSAGE_MAX_LINES = 8;
export const POSTCARD_MESSAGE_BOX_WIDTH_PX = 560;
export const POSTCARD_MESSAGE_FONT_PX = 46;
export const POSTCARD_MESSAGE_LINE_HEIGHT_PX = 62;
export const POSTCARD_ADDRESS_LINE_COUNT = 3;
/** Written on the first address line; every recipient gets the same back. */
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

/** Layout size (CSS px) and the PNG size both sides are delivered at (pixel ratio 2). */
export const POSTCARD_WIDTH = 1200;
export const POSTCARD_HEIGHT = 800;
export const POSTCARD_PNG_WIDTH = 2400;
export const POSTCARD_PNG_HEIGHT = 1600;

export const POSTCARD_HAND_FONT_FAMILY = "Patrick Hand";
export const POSTCARD_FALLBACK_FONT_FAMILY = "Zen Kurenaido";

export const POSTCARD_FRONT_FIELD = "postcardFront";
/** No longer accepted: backs are rendered on the server. */
export const POSTCARD_BACK_FIELD = "postcardBack";
export const POSTCARD_FRONT_CID = "postcard-front";
export const POSTCARD_BACK_CID = "postcard-back";

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
export const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
/** Accepted upload MIME types for the browser-rendered front (the client sends JPEG). */
export const POSTCARD_FRONT_MIME_TYPES = ["image/jpeg", "image/png"];
