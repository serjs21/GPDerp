"use client";

import { useEffect, useState } from "react";

/**
 * Px of the first element matching `selector` that is visible above the
 * viewport bottom (0 when it is below the fold or missing). Updates on
 * scroll, resize, and size changes of the element.
 */
export function useViewportBottomOverlap(selector: string, enabled = true): number {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const element = document.querySelector(selector);
    if (!element) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const next = Math.max(0, Math.round(window.innerHeight - element.getBoundingClientRect().top));
      setOverlap((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    observer.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [selector, enabled]);

  return enabled ? overlap : 0;
}
