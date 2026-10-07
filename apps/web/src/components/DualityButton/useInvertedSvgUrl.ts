import { useEffect, useState } from "react";
import { invertBlackWhiteSvg, svgDataUrl } from "./utils/invertBlackWhiteSvg";

const invertedUrlCache = new Map<string, string>();

/** Data URL of `src` with pure black and white swapped; null until loaded (or when `src` is empty). */
export function useInvertedSvgUrl(src: string): string | null {
  const [url, setUrl] = useState<string | null>(() =>
    src ? (invertedUrlCache.get(src) ?? null) : null,
  );

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }

    const cached = invertedUrlCache.get(src);
    if (cached != null) {
      setUrl(cached);
      return;
    }

    let cancelled = false;
    void fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${src}`);
        return response.text();
      })
      .then((text) => {
        const inverted = svgDataUrl(invertBlackWhiteSvg(text));
        invertedUrlCache.set(src, inverted);
        if (!cancelled) setUrl(inverted);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return url;
}
