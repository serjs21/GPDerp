/** Approx option row: padding + line + gap (matches TextBubbleDropdown CSS). */
const ROW_REM = 2.4;
const GAP_REM = 0.2;
const EMPTY_REM = 2.75;
/** Cap visible rows — counts above this are treated as this many for scale. */
export const MAX_VISIBLE_ROWS = 5;
export const MIN_VISIBLE_ROWS = 3;


function heightRemForCount(count: number): number {
  if (count <= 0) return EMPTY_REM;
  const rows = Math.max(Math.min(count, MAX_VISIBLE_ROWS), MIN_VISIBLE_ROWS);
  return rows * ROW_REM + Math.max(0, rows - 1) * GAP_REM;
}

const BASE_HEIGHT_REM = heightRemForCount(MAX_VISIBLE_ROWS);

/**
 * Precomputed list viewport heights by option count (0…5).
 * Layout always uses the max (5) height after open; scaleY maps other counts.
 */
export const LIST_VIEWPORT_HEIGHT_BY_COUNT: Record<number, string> = Object.fromEntries(
  Array.from({ length: MAX_VISIBLE_ROWS + 1 }, (_, count) => [
    count,
    `${heightRemForCount(count)}rem`,
  ]),
) as Record<number, string>;

/** Constant scale factors relative to the max-5 reference bubble. */
export const SCALE_Y_BY_COUNT: Record<number, number> = Object.fromEntries(
  Array.from({ length: MAX_VISIBLE_ROWS + 1 }, (_, count) => [
    count,
    heightRemForCount(count) / BASE_HEIGHT_REM,
  ]),
) as Record<number, number>;

export function listViewportHeightForOptionCount(count: number): string {
  if (count <= 0) return LIST_VIEWPORT_HEIGHT_BY_COUNT[0];
  if (count >= MAX_VISIBLE_ROWS) {
    return LIST_VIEWPORT_HEIGHT_BY_COUNT[MAX_VISIBLE_ROWS];
  }
  return LIST_VIEWPORT_HEIGHT_BY_COUNT[count];
}

export function cappedOptionCount(count: number): number {
  return Math.min(Math.max(count, 0), MAX_VISIBLE_ROWS);
}

/** scaleY vs the locked max-5 open bubble (tail-anchored). */
export function scaleYForOptionCount(count: number): number {
  return SCALE_Y_BY_COUNT[cappedOptionCount(count)];
}

export const BUBBLE_RESIZE_DELAY_MS = 200;
export const BUBBLE_RESIZE_DURATION_MS = 220;
