export const ACTIVATING_DOT_MS = 300;
export const ACTIVATING_DOT_CYCLE = ["", ".", "..", "..."] as const;
export const ACTIVATING_MIN_MS = ACTIVATING_DOT_MS * ACTIVATING_DOT_CYCLE.length;

export type ActivatingDots = (typeof ACTIVATING_DOT_CYCLE)[number];
