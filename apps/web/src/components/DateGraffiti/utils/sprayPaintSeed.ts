/** Stable turbulence seed from date + optional override (no Math.random). */
export function sprayPaintSeedFromDate(date: string | Date, seed?: number): number {
  if (seed != null && Number.isFinite(seed)) {
    return Math.abs(Math.trunc(seed)) % 10_000 || 1;
  }

  const key =
    typeof date === "string"
      ? date
      : Number.isNaN(date.getTime())
        ? ""
        : date.toISOString();

  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 10_000 || 1;
}
