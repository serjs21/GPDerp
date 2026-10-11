/**
 * Reduced-motion preference, read only once auth is initialized: `initialized` is false on the server
 * and at hydration, so `window` is only touched client-side.
 */
export function prefersReducedMotionOnceReady(initialized: boolean): boolean {
  return initialized && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function sharedHaikuRootClassName(styles: Record<string, string>, initialized: boolean): string {
  return [styles.root, initialized && styles.animate].filter(Boolean).join(" ");
}
