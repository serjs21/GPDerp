export const DEFAULT_HAIKU_PAGE_SIZE = 20;

export const MAX_HAIKU_PAGE_SIZE = 100;

export const DEFAULT_HAIKU_SUBJECT = "random morbit subject";

/** Max stored title length — what fits the web lantern's 4-row title (web `HAIKU_TITLE_MAX_CHARS`). */
export const HAIKU_TITLE_MAX_CHARS = 112;

/** Fallback user id passed to the haiku agent when the tab header is missing. */
export const HAIKU_STREAM_ANONYMOUS_UID = "anonymous";

/**
 * Real haiku stream (HAIKU_GENERATION_API=prod): minimum gap between forwarded model chunks. The model
 * emits a whole haiku in ~0.4 s; spacing chunks slows the reveal slightly without splitting them.
 */
export const HAIKU_STREAM_MIN_CHUNK_INTERVAL_MS = 60;

/** Mock haiku stream (HAIKU_GENERATION_API=dev): one character per random delay in [MIN, MAX) ms. */
export const HAIKU_STREAM_CHAR_DELAY_MIN_MS = 10;
export const HAIKU_STREAM_CHAR_DELAY_MAX_MS = 40;
