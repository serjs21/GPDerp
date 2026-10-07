import { useEffect, useState } from "react";

const svgTextCache = new Map<string, string>();

/** Raw markup of a same-origin SVG; null until loaded or when the fetch fails. */
export function useSvgText(src: string): string | null {
  const [text, setText] = useState<string | null>(() => svgTextCache.get(src) ?? null);

  useEffect(() => {
    const cached = svgTextCache.get(src);
    if (cached != null) {
      setText(cached);
      return;
    }

    let cancelled = false;
    void fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${src}`);
        return response.text();
      })
      .then((loaded) => {
        svgTextCache.set(src, loaded);
        if (!cancelled) setText(loaded);
      })
      .catch(() => {
        if (!cancelled) setText(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return text;
}
