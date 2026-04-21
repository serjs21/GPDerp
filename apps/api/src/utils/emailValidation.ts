import { stripDangerousControlChars } from "./sqlSafeInput";

/** Normalize for lookup and storage (lowercase, trim, strip NUL). */
export function normalizeEmail(raw: string): string {
  return stripDangerousControlChars(raw).trim().toLowerCase();
}

/**
 * Practical email validation for registration and profile flows.
 * Not a full RFC 5322 parser; rejects obvious junk and oversize strings.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || email.length > 254) return false;
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length > 64 || domain.length > 253) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  if (local.length === 1) {
    if (!/^[a-z0-9]$/i.test(local)) return false;
  } else if (!/^[a-z0-9][a-z0-9._+-]*[a-z0-9]$/i.test(local)) return false;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(domain)) return false;
  return true;
}
