"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Viewport rect of the path guideBox, tracked through resize / scroll while `enabled`; null while
 * disabled and until first measured.
 */
export function useGuideBoxRect(enabled: boolean, guideBoxRef: RefObject<HTMLElement | null> | undefined) {
  const [guideBoxRect, setGuideBoxRect] = useState<DOMRect | null>(null);
  if (!enabled && guideBoxRect !== null) setGuideBoxRect(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const el = guideBoxRef?.current;
    if (!el) return;

    const sync = () => setGuideBoxRect(el.getBoundingClientRect());
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [enabled, guideBoxRef]);

  return guideBoxRect;
}
