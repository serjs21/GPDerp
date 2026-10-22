/**
 * Haiku typing speed, mirroring the API mock stream (apps/api consts/haiku.ts
 * HAIKU_STREAM_CHAR_DELAY_MIN_MS / MAX_MS): each character takes a random delay in [MIN, MAX) ms.
 */
export const HAIKU_TYPING_CHAR_DELAY_MIN_MS = 10;
export const HAIKU_TYPING_CHAR_DELAY_MAX_MS = 40;

/** Streamed text is revealed in alternating 2/3-character pieces (same rhythm as TextTyping chunks). */
export const HAIKU_TYPING_PIECE_SIZES = [2, 3] as const;

const AVERAGE_PIECE_CHARS =
  HAIKU_TYPING_PIECE_SIZES.reduce((sum, size) => sum + size, 0) / HAIKU_TYPING_PIECE_SIZES.length;
const AVERAGE_CHAR_DELAY_MS = (HAIKU_TYPING_CHAR_DELAY_MIN_MS + HAIKU_TYPING_CHAR_DELAY_MAX_MS) / 2;

/** TextTyping step for the generating title: one 2/3-char chunk per average piece duration (~63 ms). */
export const HAIKU_TYPING_STEP_MS = Math.round(AVERAGE_PIECE_CHARS * AVERAGE_CHAR_DELAY_MS);
