/** Hides the server-rendered HtmlLoader (html[data-loader-exited="true"] in its CSS). */
export function markHtmlLoaderExited(): void {
  document.documentElement.dataset.loaderExited = "true";
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One viewport-sized page (the fixed loader's box, so without scrollbars). The book is a two-page
 * spread twice this wide, shifted left so only the right page is on screen.
 */
export function viewportBookSize() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  return { width, height, minWidth: width, maxWidth: width, minHeight: height, maxHeight: height };
}

/**
 * Inverse of a `polygon(...)` clip within its box: the whole box minus the polygon (even-odd rule, the
 * two rings joined by a zero-width bridge at the box's top-left corner). `none` when nothing is cut out.
 */
export function complementClipPath(clipPath: string): string {
  const match = /^polygon\((.*)\)$/.exec(clipPath.trim());
  const points = match?.[1].split(",").map((point) => point.trim()).filter(Boolean) ?? [];
  if (points.length < 3) return "none";
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${points.join(", ")}, ${points[0]}, 0 0)`;
}
