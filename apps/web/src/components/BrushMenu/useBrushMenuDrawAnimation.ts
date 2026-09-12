"use client";

import { animate, createDrawable, stagger } from "animejs";
import { useEffect, useRef } from "react";

export const BRUSH_OPTION_DRAW_MS = 200;
const STAGGER_MS = 40;
const LABEL_CLIP_HIDDEN = "inset(0 100% 0 0)";
const LABEL_CLIP_SHOWN = "inset(0 0% 0 0)";

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

function prepareLabelsHidden(labels: HTMLElement[]) {
  for (const label of labels) {
    label.style.clipPath = LABEL_CLIP_HIDDEN;
  }
}

function showLabelsFully(labels: HTMLElement[]) {
  for (const label of labels) {
    label.style.clipPath = LABEL_CLIP_SHOWN;
  }
}

/**
 * On menu open, draw each BrushOption reveal path left → right over 200ms
 * via anime.js createDrawable, and clip labels in sync so copy only appears
 * over the drawn stroke.
 */
export function useBrushMenuDrawAnimation(options: {
  open: boolean;
  reducedMotion: boolean;
  getRevealPaths: () => SVGPathElement[];
  getLabelEls: () => HTMLElement[];
}) {
  const { open, reducedMotion, getRevealPaths, getLabelEls } = options;
  const brushAnimationRef = useRef<Animatable | null>(null);
  const labelAnimationRef = useRef<Animatable | null>(null);

  useEffect(() => {
    stopAnimation(brushAnimationRef.current);
    stopAnimation(labelAnimationRef.current);
    brushAnimationRef.current = null;
    labelAnimationRef.current = null;

    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const paths = getRevealPaths().filter(Boolean);
      const labels = getLabelEls().filter(Boolean);
      if (paths.length === 0) return;

      if (reducedMotion) {
        showFullyDrawn(paths);
        showLabelsFully(labels);
        return;
      }

      prepareLabelsHidden(labels);
      const drawable = prepareUndrawn(paths);
      brushAnimationRef.current = animate(drawable, {
        draw: ["0 0", "0 1"],
        duration: BRUSH_OPTION_DRAW_MS,
        ease: "inOutQuad",
        delay: stagger(STAGGER_MS),
      }) as Animatable;

      if (labels.length > 0) {
        labelAnimationRef.current = animate(labels, {
          clipPath: [LABEL_CLIP_HIDDEN, LABEL_CLIP_SHOWN],
          duration: BRUSH_OPTION_DRAW_MS,
          ease: "inOutQuad",
          delay: stagger(STAGGER_MS),
        }) as Animatable;
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      stopAnimation(brushAnimationRef.current);
      stopAnimation(labelAnimationRef.current);
      brushAnimationRef.current = null;
      labelAnimationRef.current = null;
    };
  }, [open, reducedMotion, getRevealPaths, getLabelEls]);
}
