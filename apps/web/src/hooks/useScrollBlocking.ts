"use client";

import { useEffect, type RefObject } from "react";

function isPointInRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/**
 * Prevents page (and ancestor) scrolling while the pointer is over `areaRef`.
 */
export function useScrollBlocking(areaRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const area = areaRef.current;
      if (!area) return;
      if (!isPointInRect(event.clientX, event.clientY, area.getBoundingClientRect())) {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
    // areaRef is a stable useRef; each wheel reads .current for live bounds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
