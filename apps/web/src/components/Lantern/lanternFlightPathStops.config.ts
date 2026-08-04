/** Evenly spaced stops on the flight segment; index 0 = rest, last = exit. */
export function lanternFlightPathStops(count: number): number[] {
  if (count <= 1) return [0];
  return Array.from({ length: count }, (_, index) => index / (count - 1));
}
