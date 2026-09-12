"use client";

import { animate, createDrawable } from "animejs";
import { useEffect, useRef } from "react";
import {
  BRUSH_OPTION_DRAW_MS,
  BRUSH_REVEAL_EASE,
  BRUSH_REVEAL_LABEL_DELAY_MS,
  BRUSH_REVEAL_LABEL_DURATION_MS,
  BRUSH_REVEAL_PATHS,
} from "./brushRevealPaths";

export { BRUSH_OPTION_DRAW_MS };

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

/** One option’s mask brush paths, indexed like BRUSH_REVEAL_PATHS. */
export type BrushRevealPathGroup = SVGPathElement[];

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

function stopAll(animations: Animatable[]) {
  for (const animation of animations) {
    stopAnimation(animation);
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
    label.style.opacity = "0";
    label.style.transform = "scale(0.98)";
  }
}

function showLabelsFully(labels: HTMLElement[]) {
  for (const label of labels) {
    label.style.opacity = "1";
    label.style.transform = "scale(1)";
  }
}

/**
 * On menu open, paint-reveal each BrushOption via multiple mask brush paths
 * with Anime.js createDrawable, then fade labels in.
 * Deps stay on open/reducedMotion/getters so remount/open re-triggers once;
 * cleanup cancels in-flight animations (StrictMode-safe).
 */
export function useBrushMenuDrawAnimation(options: {
  open: boolean;
  reducedMotion: boolean;
  getBrushPathGroups: () => BrushRevealPathGroup[];
  getLabelEls: () => HTMLElement[];
}) {
  const { open, reducedMotion, getBrushPathGroups, getLabelEls } = options;
  const animationsRef = useRef<Animatable[]>([]);

  useEffect(() => {
    stopAll(animationsRef.current);
    animationsRef.current = [];

    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const groups = getBrushPathGroups();
      const labels = getLabelEls().filter(Boolean);
      const allPaths = groups.flat().filter(Boolean);
      if (allPaths.length === 0) return;

      if (reducedMotion) {
        showFullyDrawn(allPaths);
        showLabelsFully(labels);
        return;
      }

      prepareLabelsHidden(labels);

      const nextAnimations: Animatable[] = [];

      for (let pathIndex = 0; pathIndex < BRUSH_REVEAL_PATHS.length; pathIndex++) {
        const def = BRUSH_REVEAL_PATHS[pathIndex]!;
        const paths = groups
          .map((group) => group[pathIndex])
          .filter((path): path is SVGPathElement => path != null);
        if (paths.length === 0) continue;

        const drawable = prepareUndrawn(paths);
        nextAnimations.push(
          animate(drawable, {
            draw: ["0 0", "0 1"],
            duration: def.duration,
            delay: def.delay,
            ease: BRUSH_REVEAL_EASE,
          }) as Animatable,
        );
      }

      if (labels.length > 0) {
        nextAnimations.push(
          animate(labels, {
            opacity: [0, 1],
            scale: [0.98, 1],
            duration: BRUSH_REVEAL_LABEL_DURATION_MS,
            delay: BRUSH_REVEAL_LABEL_DELAY_MS,
            ease: BRUSH_REVEAL_EASE,
          }) as Animatable,
        );
      }

      animationsRef.current = nextAnimations;
    });

    return () => {
      cancelAnimationFrame(frame);
      stopAll(animationsRef.current);
      animationsRef.current = [];
    };
  }, [open, reducedMotion, getBrushPathGroups, getLabelEls]);
}
