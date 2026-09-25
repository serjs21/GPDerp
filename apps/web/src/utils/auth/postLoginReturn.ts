import { POST_LOGIN_RETURN_STORAGE_KEY } from "@/config/userConfiguration";

/** Auth / onboarding routes — never save or restore these as post-login destinations. */
export const AUTH_FLOW_PATHS = new Set([
  "/login",
  "/register",
  "/verify",
  "/complete-registration",
]);

function pathnameOf(href: string): string {
  return href.split("?")[0]?.split("#")[0] ?? "";
}

function isAuthFlowPath(pathname: string): boolean {
  for (const prefix of AUTH_FLOW_PATHS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

/** Only same-app relative paths; blocks open redirects. */
export function sanitizePostLoginReturn(href: string | null | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (isAuthFlowPath(pathnameOf(trimmed))) return null;
  return trimmed;
}

export function readPostLoginReturn(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sanitizePostLoginReturn(window.localStorage.getItem(POST_LOGIN_RETURN_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Persist the screen to restore after login.
 * Pass `overwrite: true` when the user explicitly starts auth from a new screen.
 * Default keeps an existing return through intermediate auth hops (/login → /register).
 */
export function savePostLoginReturn(
  href?: string,
  options: { overwrite?: boolean } = {},
): void {
  if (typeof window === "undefined") return;
  if (!options.overwrite && readPostLoginReturn()) return;

  const candidate =
    href ??
    `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const safe = sanitizePostLoginReturn(candidate);
  if (!safe) return;

  try {
    window.localStorage.setItem(POST_LOGIN_RETURN_STORAGE_KEY, safe);
  } catch {
    // Quota / private mode — skip persistence.
  }
}

/** Read and clear the saved return path. */
export function consumePostLoginReturn(fallback = "/"): string {
  const saved = readPostLoginReturn();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(POST_LOGIN_RETURN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return saved ?? fallback;
}

/**
 * If nothing is saved yet, adopt a same-origin document.referrer path
 * (covers direct navigation to /login from an in-app link).
 */
export function ensurePostLoginReturnFromReferrer(): void {
  if (typeof window === "undefined") return;
  if (readPostLoginReturn()) return;

  const referrer = document.referrer;
  if (!referrer) return;

  try {
    const url = new URL(referrer);
    if (url.origin !== window.location.origin) return;
    savePostLoginReturn(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    // ignore malformed referrer
  }
}
