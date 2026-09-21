import axios from "axios";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";

const REFRESH_LOCK_NAME = "gpderp-auth-refresh";
/** Treat access JWT as usable if it still has this much life left. */
const ACCESS_FRESH_SKEW_MS = 5_000;

let memoryLock: Promise<void> = Promise.resolve();

export function isAccessTokenFresh(nowMs: number = Date.now()): boolean {
  if (typeof document === "undefined") return false;
  const token = Cookies.get("access_token");
  if (!token) return false;
  try {
    const payload = decodeJwt(token) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 > nowMs + ACCESS_FRESH_SKEW_MS;
  } catch {
    return false;
  }
}

/** Readable CSRF cookie required before POSTing `/auth/refresh`. */
export function hasCsrfCookie(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(Cookies.get("csrf_token"));
}

export class AuthRefreshSkippedError extends Error {
  readonly code = "AUTH_REFRESH_SKIPPED_NO_CSRF" as const;

  constructor() {
    super("auth: refresh skipped — csrf_token cookie missing");
    this.name = "AuthRefreshSkippedError";
  }
}

export function isAuthRefreshSkippedError(err: unknown): boolean {
  return (
    err instanceof AuthRefreshSkippedError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "AUTH_REFRESH_SKIPPED_NO_CSRF")
  );
}

async function withExclusiveLock<T>(run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (locks?.request) {
    return locks.request(REFRESH_LOCK_NAME, { mode: "exclusive" }, run);
  }

  // Same-tab fallback when Web Locks API is unavailable.
  const previous = memoryLock;
  let release!: () => void;
  memoryLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await run();
  } finally {
    release();
  }
}

/**
 * Single global refresh entrypoint (same-tab + cross-tab via Web Locks).
 * After waiting for the lock, skips the network call if another tab already
 * refreshed and left a fresh access token (unless `force` is set).
 * Skips the network when the CSRF cookie is absent (anonymous / already cleared).
 */
export async function refreshAuthSession(options?: { force?: boolean }): Promise<void> {
  return withExclusiveLock(async () => {
    if (!options?.force && isAccessTokenFresh()) return;
    if (!hasCsrfCookie()) {
      throw new AuthRefreshSkippedError();
    }
    await axios.post("/auth/refresh");
  });
}
