"use client";

import { animate, createDrawable, stagger } from "animejs";
import { useEffect, useRef } from "react";

export const BRUSH_OPTION_DRAW_MS = 200;
const STAGGER_MS = 40;

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

function stopAnimation(animation: Animatable | null) {
  if (!animation) return;
  try {
    animation.pause?.();
    animation.cancel?.();
    animation.revert?.();
  } catch {
    // ignore teardown races
  }
}

function prepareUndrawn(paths: SVGPathElement[]) {
  if (paths.length === 0) return [];
  const drawable = createDrawable(paths);
  for (const item of drawable) {
    item.draw = "0 0";
  }
  return drawable;
}

function showFullyDrawn(paths: SVGPathElement[]) {
  if (paths.length === 0) return;
  const drawable = createDrawable(paths);
  for (const item of drawable) {
    item.draw = "0 1";
  }
}

/**
 * On menu open, draw each BrushOption reveal path left → right over 200ms
 * via anime.js createDrawable (staggered across options).
 */
export function useBrushMenuDrawAnimation(options: {
  open: boolean;
  reducedMotion: boolean;
  getRevealPaths: () => SVGPathElement[];
}) {
  const { open, reducedMotion, getRevealPaths } = options;
  const animationRef = useRef<Animatable | null>(null);

  useEffect(() => {
    stopAnimation(animationRef.current);
    animationRef.current = null;

    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const paths = getRevealPaths().filter(Boolean);
      if (paths.length === 0) return;

      if (reducedMotion) {
        showFullyDrawn(paths);
        return;
      }

      const drawable = prepareUndrawn(paths);
      animationRef.current = animate(drawable, {
        draw: ["0 0", "0 1"],
        duration: BRUSH_OPTION_DRAW_MS,
        ease: "inOutQuad",
        delay: stagger(STAGGER_MS),
      }) as Animatable;
    });

    return () => {
      cancelAnimationFrame(frame);
      stopAnimation(animationRef.current);
      animationRef.current = null;
    };
  }, [open, reducedMotion, getRevealPaths]);
}
