import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/**
 * Reuses a caller-supplied request id only when it is a short, log-safe token (so it can't inject
 * log lines or carry arbitrary data); otherwise generates a fresh UUID.
 */
export function resolveRequestId(incoming: string | string[] | undefined): string {
  const value = Array.isArray(incoming) ? incoming[0] : incoming;
  return value && SAFE_REQUEST_ID.test(value) ? value : randomUUID();
}
