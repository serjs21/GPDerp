export const DEFAULT_HAIKU_PAGE_SIZE = 20;

export const MAX_HAIKU_PAGE_SIZE = 100;

export const DEFAULT_HAIKU_SUBJECT = "random morbit subject";

/** Max stored title length — what fits the web lantern's 4-row title (web `HAIKU_TITLE_MAX_CHARS`). */
export const HAIKU_TITLE_MAX_CHARS = 112;

/** Fallback user id passed to the haiku agent when the tab header is missing. */
export const HAIKU_STREAM_ANONYMOUS_UID = "anonymous";

/**
 * Typing cadence for streamed haikus: one character per random delay in [MIN, MAX) ms.
 * The real model returns a whole haiku in ~0.1 s, so its deltas are re-paced to match the mock.
 */
export const HAIKU_STREAM_CHAR_DELAY_MIN_MS = 10;
export const HAIKU_STREAM_CHAR_DELAY_MAX_MS = 40;
