import { useEffect, useState } from "react";

const svgCache = new Map<string, string>();

/** Rewrite black strokes to `currentColor` so fills stay authored. */
export function prepareStrokeInvertSvg(svgText: string): string {
  return svgText
    .replace(/stroke:\s*#000000\b/gi, "stroke: currentColor")
    .replace(/stroke:\s*#000\b/gi, "stroke: currentColor")
    .replace(/\bstroke="#000000"/gi, 'stroke="currentColor"')
    .replace(/\bstroke="#000"/gi, 'stroke="currentColor"');
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
