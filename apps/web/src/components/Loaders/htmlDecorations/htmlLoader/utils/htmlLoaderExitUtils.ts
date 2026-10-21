/** Hides the server-rendered HtmlLoader (html[data-loader-exited="true"] in its CSS). */
export function markHtmlLoaderExited(): void {
  document.documentElement.dataset.loaderExited = "true";
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One viewport-sized page: narrower than two pages, so react-pageflip shows it alone (portrait mode). */
export function viewportBookSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return { width, height, minWidth: width, maxWidth: width, minHeight: height, maxHeight: height };
}
