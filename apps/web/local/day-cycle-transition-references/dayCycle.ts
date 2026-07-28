export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function smoothstep(min: number, max: number, value: number) {
  if (min === max) return value >= max ? 1 : 0;
  const t = clamp01((value - min) / (max - min));
  return t * t * (3 - 2 * t);
}

export const mixNumber = (a: number, b: number, t: number) =>
  a + (b - a) * clamp01(t);

export type ColorMixer = (from: string, to: string, t: number) => string;

// Use an OKLCH/Oklab library such as culori for ColorMixer.
export function findBounds<T extends { solarElevation: number }>(
  sortedTrack: T[],
  elevation: number,
): [T, T] {
  if (!sortedTrack.length) throw new Error("Track is empty");
  if (elevation <= sortedTrack[0].solarElevation) return [sortedTrack[0], sortedTrack[0]];
  const last = sortedTrack[sortedTrack.length - 1];
  if (elevation >= last.solarElevation) return [last, last];

  for (let i = 0; i < sortedTrack.length - 1; i++) {
    const a = sortedTrack[i];
    const b = sortedTrack[i + 1];
    if (elevation >= a.solarElevation && elevation <= b.solarElevation) return [a, b];
  }
  return [last, last];
}
