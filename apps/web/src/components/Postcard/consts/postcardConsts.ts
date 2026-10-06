export const POSTCARD_WIDTH = 1200;
export const POSTCARD_HEIGHT = 800;
export const POSTCARD_PIXEL_RATIO = 2;
/** JPEG keeps the emailed front ~10x smaller than PNG; SMTP time scales with attachment size. */
export const POSTCARD_IMAGE_TYPE = "image/jpeg";
export const POSTCARD_JPEG_QUALITY = 0.9;
/** JPEG has no alpha; any transparent pixel is flattened onto this. */
export const POSTCARD_CAPTURE_BACKGROUND = "#ffffff";

/** Lantern art is 368×391; height follows from width. */
export const POSTCARD_LANTERN_WIDTH_PX = 440;
export const POSTCARD_LANTERN_TOP_PX = 96;

/** Matches Lantern `.content` inset (8% 10% 21%) on the painted lantern. */
export const POSTCARD_LANTERN_CONTENT_WIDTH_RATIO = 0.8;

export const POSTCARD_BODY_FONT_PX = 30;
export const POSTCARD_BODY_MIN_FONT_PX = 16;
export const POSTCARD_TITLE_FONT_RATIO = 1.1;
export const POSTCARD_AUTHOR_FONT_RATIO = 0.72;

/** Average advance per character as a fraction of font-size (Zen Kurenaido). */
export const POSTCARD_NARROW_CHAR_EM = 0.56;
export const POSTCARD_WIDE_CHAR_EM = 1;
