/** Root font size used to convert measured px to rem. */
export const ROTATED_SORT_ROOT_FONT_PX = 16;

/** Coin diameter as a share of the rotated cluster's content width. */
export const ROTATED_SORT_COIN_WIDTH_RATIO = 0.62;

/** Coin never drops below the row default nor grows past this (rem). */
export const ROTATED_SORT_COIN_MAX_REM = 9;

/**
 * Spacing hand-tuned at the default 3.5rem coin (gap 1.75rem, top pad 3.35rem),
 * expressed as multiples of the coin size so arcs keep their room when coins grow.
 */
export const ROTATED_SORT_GAP_PER_COIN = 0.5;
export const ROTATED_SORT_TOP_PAD_PER_COIN = 0.957;
