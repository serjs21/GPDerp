/** Mirrors POSTCARD_MESSAGE_MAX_CHARS in apps/web (postcard message side). */
export const POSTCARD_MESSAGE_MAX_CHARS = 200;

export const POSTCARD_FRONT_FIELD = "postcardFront";
/** Repeated once per entry in `emails`, same order: each recipient gets a back addressed only to them. */
export const POSTCARD_BACK_FIELD = "postcardBack";
export const POSTCARD_FRONT_CID = "postcard-front";
export const POSTCARD_BACK_CID = "postcard-back";

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
