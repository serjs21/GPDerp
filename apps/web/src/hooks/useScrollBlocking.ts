"use client";

import { useEffect, type RefObject } from "react";

function isPointInRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isWheelAllowedOverTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  // Portaled dialogs sit over the blocked area geometrically; let them scroll.
  if (target.closest('[role="dialog"], [data-radix-dialog-content]')) return true;
  let node: Element | null = target;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const { overflowY } = getComputedStyle(node);
      if (
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}

/**
 * Prevents page (and ancestor) scrolling while the pointer is over `areaRef`.
 * Nested scroll containers (e.g. dialogs) are left alone.
 */
export function useScrollBlocking(areaRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const area = areaRef.current;
      if (!area) return;
      if (!isPointInRect(event.clientX, event.clientY, area.getBoundingClientRect())) {
        return;
      }
      if (isWheelAllowedOverTarget(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
    // areaRef is a stable useRef; each wheel reads .current for live bounds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
