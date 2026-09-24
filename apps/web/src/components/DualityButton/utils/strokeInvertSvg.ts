import { useEffect, useState } from "react";

/** Bump when prepare rules change so in-memory entries are not reused. */
const SVG_CACHE_VERSION = 2;
const svgCache = new Map<string, string>();

function cacheKey(src: string): string {
  return `${SVG_CACHE_VERSION}:${src}`;
}

/**
 * Rewrite pure black (`#000` / `#000000`) strokes/fills to `currentColor`.
 * Other colors (e.g. `#1c0300`, `#fff`) stay as authored.
 */
export function prepareStrokeInvertSvg(svgText: string): string {
  return svgText
    .replace(/stroke:\s*#000000\b/gi, "stroke: currentColor")
    .replace(/stroke:\s*#000\b/gi, "stroke: currentColor")
    .replace(/\bstroke="#000000"/gi, 'stroke="currentColor"')
    .replace(/\bstroke="#000"/gi, 'stroke="currentColor"')
    .replace(/fill:\s*#000000\b/gi, "fill: currentColor")
    .replace(/fill:\s*#000\b/gi, "fill: currentColor")
    .replace(/\bfill="#000000"/gi, 'fill="currentColor"')
    .replace(/\bfill="#000"/gi, 'fill="currentColor"');
}

export function useStrokeInvertSvg(src: string): string | null {
  const [markup, setMarkup] = useState<string | null>(() =>
    src ? (svgCache.get(cacheKey(src)) ?? null) : null,
  );

  useEffect(() => {
    if (!src) {
      setMarkup(null);
      return;
    }

    const key = cacheKey(src);
    const cached = svgCache.get(key);
    if (cached != null) {
      setMarkup(cached);
      return;
    }

    let cancelled = false;
    void fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${src}`);
        return response.text();
      })
      .then((text) => {
        const prepared = prepareStrokeInvertSvg(text);
        svgCache.set(key, prepared);
        if (!cancelled) setMarkup(prepared);
      })
      .catch(() => {
        if (!cancelled) setMarkup(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return markup;
}
