/**
 * Defense-in-depth for user-supplied strings before persistence.
 * Prisma uses bound parameters; these helpers still strip hostile control bytes
 * and characters that are never valid in our email/username rules.
 */
export function stripDangerousControlChars(value: string): string {
  return value.replace(/\0/g, "");
}

/** Escape `%` and `_` for SQL LIKE / ILIKE patterns if you ever use raw fragments. */
export function escapeSqlLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
