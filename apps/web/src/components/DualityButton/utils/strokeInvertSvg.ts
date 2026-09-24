import { useEffect, useState } from "react";

const svgCache = new Map<string, string>();

/**
 * Rewrite near-black strokes/fills to `currentColor` so light fills (e.g. #fff)
 * stay authored while ink can flip with the duality face.
 */
export function prepareStrokeInvertSvg(svgText: string): string {
  return svgText
    .replace(/stroke:\s*#000000\b/gi, "stroke: currentColor")
    .replace(/stroke:\s*#000\b/gi, "stroke: currentColor")
    .replace(/\bstroke="#000000"/gi, 'stroke="currentColor"')
    .replace(/\bstroke="#000"/gi, 'stroke="currentColor"')
    .replace(/fill:\s*#1c0300\b/gi, "fill: currentColor")
    .replace(/fill:\s*#000000\b/gi, "fill: currentColor")
    .replace(/fill:\s*#000\b/gi, "fill: currentColor")
    .replace(/\bfill="#1c0300"/gi, 'fill="currentColor"')
    .replace(/\bfill="#000000"/gi, 'fill="currentColor"')
    .replace(/\bfill="#000"/gi, 'fill="currentColor"');
}

export function useStrokeInvertSvg(src: string): string | null {
  const [markup, setMarkup] = useState<string | null>(() =>
    src ? (svgCache.get(src) ?? null) : null,
  );

  useEffect(() => {
    if (!src) {
      setMarkup(null);
      return;
    }

    const cached = svgCache.get(src);
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
        svgCache.set(src, prepared);
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
