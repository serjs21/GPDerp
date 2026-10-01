"use client";

import { useEffect, useState, type RefObject } from "react";

const THRESHOLD_STEPS = 40;
const THRESHOLDS = Array.from({ length: THRESHOLD_STEPS + 1 }, (_, i) => i / THRESHOLD_STEPS);

export type ElementVisibility = {
  /** Pixel height of the element inside the viewport (0 when off-screen). */
  visibleHeight: number;
  /** Share of the element inside the viewport, 0–1. */
  ratio: number;
};

const HIDDEN: ElementVisibility = { visibleHeight: 0, ratio: 0 };

export function useVisibleHeight(ref: RefObject<HTMLElement | null>): ElementVisibility {
  const [visibility, setVisibility] = useState<ElementVisibility>(HIDDEN);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibility(
          entry.isIntersecting
            ? {
                visibleHeight: Math.round(entry.intersectionRect.height),
                ratio: entry.intersectionRatio,
              }
            : HIDDEN,
        );
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return visibility;
}
