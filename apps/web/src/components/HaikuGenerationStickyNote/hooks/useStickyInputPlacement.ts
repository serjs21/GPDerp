"use client";

import { useEffect, useState } from "react";

export type StickyInputPlacementMode = "sticky-bottom" | "inline";

function rootFontSizePx(): number {
  if (typeof window === "undefined") return 16;
  const parsed = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

export function useStickyInputPlacement(stickyInputMinHeightRem: number) {
  const [mode, setMode] = useState<StickyInputPlacementMode>("sticky-bottom");

  useEffect(() => {
    const update = () => {
      const minHeightPx = stickyInputMinHeightRem * rootFontSizePx();
      setMode(window.innerHeight >= minHeightPx ? "sticky-bottom" : "inline");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [stickyInputMinHeightRem]);

  return { mode };
}
