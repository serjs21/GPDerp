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

/** Square comic label framing the button. */
export const ORDER_COVER_LABEL_FILL = "#ffffff";
export const ORDER_COVER_LABEL_STROKE = "#000000";
export const ORDER_COVER_LABEL_STROKE_WIDTH = 3;
export const ORDER_COVER_LABEL_SEED = "order-dropdown-cover";
/** Gap between the gavel and the label edge, as a fraction of the stage width. */
export const ORDER_COVER_LABEL_PAD_RATIO = 0.12;

export const OPEN_SOUND_SRC = "/nav/open_sound.svg";
export const OPEN_SOUND_VIEWBOX = { width: 377, height: 243 } as const;
/** Sound effect width in stage units (the gavel is 783.12 wide). */
export const OPEN_SOUND_WIDTH = 340;
/** Minimum clearance (stage units) between a sound effect and the gavel or another sound effect. */
export const OPEN_SOUND_GAP = 30;
/** Extra distance (stage units) beyond OPEN_SOUND_GAP a sound effect may sit from the gavel. */
export const OPEN_SOUND_NEAR = 140;
/** Right edge of the gavel head; placements above the gavel stay over the head, not the handle. */
export const GAVEL_HEAD_RIGHT = 367;
/** Placements left of the gavel stay beside its upper half. */
export const OPEN_SOUND_LEFT_MAX_Y = GAVEL_VIEWBOX.height / 2;
export const OPEN_SOUND_MAX_COUNT = 5;
export const OPEN_SOUND_PLACEMENT_ATTEMPTS = 60;
export const OPEN_SOUND_HOLD_MS = 500;
export const OPEN_SOUND_FADE_MS = 250;
