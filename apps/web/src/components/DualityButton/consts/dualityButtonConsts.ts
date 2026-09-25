/** Public asset for the dual-tone circular face. */
export const DUALITY_BUTTON_BASE_SRC = "/duality_button/base.svg";

/** Curved direction cue seated above the face; rotates with the base. */
export const DUALITY_BUTTON_DIRECTION_SRC = "/duality_button/direction.svg";

/** Face rotate + icon color swap duration (keep in sync with CSS). */
export const DUALITY_BUTTON_FLIP_MS = 300;

/** CoverState coin-flip duration (keep in sync with CoverState.module.css). */
export const COVER_ICON_EXIT_MS = 300;

/** CoverLabel title→arrow morph duration. */
export const COVER_LABEL_MORPH_MS = 420;

/** Face / cover disk size (matches DualityButton.root). */
export const DUALITY_BUTTON_SIZE_REM = 4.25;

/**
 * CoverLabel title arc — CSS angles with radial `translateY(-R)`:
 * 0° = 12 o'clock, negative = toward 9 o'clock (top-left). Gap sits just
 * outside the face rim so the baseline matches the label circle.
 */
export const COVER_LABEL_ARC_CENTER_DEG = -18;
/** Total angular width of the title arc (keeps long labels on the top rim). */
export const COVER_LABEL_ARC_SPAN_DEG = 96;
/** Extra radius beyond half face size (rem). */
export const COVER_LABEL_ARC_GAP_REM = 0.42;
/** Max title font size (rem) when the arc has room. */
export const COVER_LABEL_FONT_MAX_REM = 0.95;
/** Min title font size (rem) for long labels. */
export const COVER_LABEL_FONT_MIN_REM = 0.52;
/** Approx Bangers uppercase glyph width in em. */
export const COVER_LABEL_CHAR_EM = 0.62;

/**
 * Arrow rest angle on the concentric track (matches title arc center).
 * CSS: 0° = 12 o'clock with radial translateY(-R).
 */
export const COVER_LABEL_ARROW_REST_DEG = COVER_LABEL_ARC_CENTER_DEG;
/**
 * How far behind the first title char the arrow starts (degrees, CCW =
 * more negative in this CSS angle system).
 */
export const COVER_LABEL_ARROW_BEHIND_DEG = 42;
/** How far the title spins clockwise while fading (degrees). */
export const COVER_LABEL_TITLE_PUSH_DEG = 42;
