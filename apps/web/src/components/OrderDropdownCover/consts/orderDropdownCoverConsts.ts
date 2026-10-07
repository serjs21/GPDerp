export const GAVEL_SRC = "/nav/gavel.svg";
export const GAVEL_BASE_SRC = "/nav/gavel-base.svg";

/** SVG viewBox sizes; both assets are drawn at the same scale. */
export const GAVEL_VIEWBOX = { width: 783.12, height: 597.36 } as const;
export const GAVEL_BASE_VIEWBOX = { width: 463, height: 204.11 } as const;

/** Handle end (gavel viewBox units) — the gavel swings around this point. */
export const GAVEL_PIVOT = { x: 783.12, y: 308 } as const;

/** Struck pose: gavel at the top, base left-aligned directly under the head. */
export const ORDER_DROPDOWN_COVER_STAGE = {
  width: GAVEL_VIEWBOX.width,
  height: GAVEL_VIEWBOX.height + GAVEL_BASE_VIEWBOX.height,
} as const;

/** Clockwise lift of the resting (raised) gavel. */
export const GAVEL_RAISED_DEG = 45;
export const GAVEL_STRIKE_MS = 100;
export const GAVEL_RETURN_MS = 100;

export const ORDER_DROPDOWN_COVER_WIDTH_REM = 4;

/** Comic label framing the button; same sharp frame as the other header buttons. */
export const ORDER_COVER_LABEL_SHAPE = "sharp";
export const ORDER_COVER_LABEL_FILL = "#f7f4ef";
export const ORDER_COVER_LABEL_STROKE = "#000000";
export const ORDER_COVER_LABEL_STROKE_WIDTH = 3;
export const ORDER_COVER_LABEL_SEED = "order-dropdown-cover";
/** Label width ÷ height; matches the 4rem × 45px header tool buttons. */
export const ORDER_COVER_LABEL_ASPECT = 64 / 45;
/** Gap between the gavel and the label edge, as a fraction of the stage width. */
export const ORDER_COVER_LABEL_PAD_RATIO = 0.12;
/** Gavel + base drawn larger than the layout reserves, scaled about the label centre; the label clips the overflow. */
export const ORDER_COVER_ART_SCALE = 1.4;
/** Base offset from the stage's left edge, as a fraction of the stage width. */
export const GAVEL_BASE_LEFT_RATIO = -0.05;
/** Minimum space (stage units) kept between the scaled base and the label edge. */
export const ORDER_COVER_ART_EDGE_MARGIN = 20;
/** Horizontal nudge of the scaled art, as a fraction of the label width (positive = right). */
export const ORDER_COVER_ART_SHIFT_X_RATIO = 0.1;

export const OPEN_SOUND_SRC = "/nav/open_sound.svg";
export const OPEN_SOUND_VIEWBOX = { width: 377, height: 243 } as const;
/** Sound effect width in stage units (the gavel is 783.12 wide). */
export const OPEN_SOUND_WIDTH = 840;
/** Minimum clearance (stage units) between a sound effect and the label or another sound effect. */
export const OPEN_SOUND_GAP = 30;
/** Extra distance (stage units) beyond OPEN_SOUND_GAP a sound effect may sit from the label. */
export const OPEN_SOUND_NEAR = 140;
export const OPEN_SOUND_MAX_COUNT = 5;
/** Random hue per sound effect; saturation/lightness keep it vivid on light and dark headers. */
export const OPEN_SOUND_SATURATION = 85;
export const OPEN_SOUND_LIGHTNESS = 50;
export const OPEN_SOUND_PLACEMENT_ATTEMPTS = 60;
export const OPEN_SOUND_HOLD_MS = 500;
export const OPEN_SOUND_FADE_MS = 250;
