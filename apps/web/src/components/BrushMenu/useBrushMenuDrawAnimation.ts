"use client";

import { animate, createDrawable } from "animejs";
import { useEffect, useRef } from "react";
import {
  BRUSH_OPTION_DRAW_MS,
  BRUSH_OPTION_MIN_WIDTH_REM,
  BRUSH_REVEAL_EASE,
  BRUSH_REVEAL_LABEL_DELAY_MS,
  BRUSH_REVEAL_LABEL_DURATION_MS,
  BRUSH_REVEAL_PATHS,
  BRUSH_REVEAL_TEXT_CLOSE_DELAY_MS,
  BRUSH_REVEAL_TEXT_CLOSE_DURATION_MS,
} from "./brushRevealPaths";

export { BRUSH_OPTION_DRAW_MS };

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

/** One option’s mask brush paths, indexed like BRUSH_REVEAL_PATHS. */
export type BrushRevealPathGroup = SVGPathElement[];

export type BrushMenuDrawPhase = "open" | "closing";

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

function maxBrushMs(): number {
  let max = BRUSH_OPTION_DRAW_MS;
  for (const def of BRUSH_REVEAL_PATHS) {
    max = Math.max(max, def.delay + def.duration);
  }
  max = Math.max(
    max,
    BRUSH_REVEAL_LABEL_DELAY_MS + BRUSH_REVEAL_LABEL_DURATION_MS,
  );
  return max;
}

function remToPx(rem: number): number {
  if (typeof window === "undefined") return rem * 16;
  const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return rem * (Number.isFinite(rootPx) ? rootPx : 16);
}

/**
 * Paint-reveal on open; reverse undraw on close (same durations).
 * Panel stays mounted while `phase === "closing"` until `onCloseComplete`.
 */
export function useBrushMenuDrawAnimation(options: {
  phase: BrushMenuDrawPhase | null;
  reducedMotion: boolean;
  getBrushPathGroups: () => BrushRevealPathGroup[];
  getLabelEls: () => HTMLElement[];
  /** In-flow trigger whose width expands to option min-width when open. */
  getTriggerEl?: () => HTMLElement | null;
  /** Closed (avatar-only) trigger width in px; used for width tween. */
  getClosedTriggerWidthPx?: () => number;
  onCloseComplete?: () => void;
}) {
  const {
    phase,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
    getTriggerEl,
    getClosedTriggerWidthPx,
    onCloseComplete,
  } = options;
  const animationsRef = useRef<Animatable[]>([]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseCompleteRef = useRef(onCloseComplete);
  onCloseCompleteRef.current = onCloseComplete;

  useEffect(() => {
    stopAll(animationsRef.current);
    animationsRef.current = [];
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (!phase) {
      return;
    }

    const isClosing = phase === "closing";
    const openWidthPx = remToPx(BRUSH_OPTION_MIN_WIDTH_REM);
    const durationMs = maxBrushMs();

    const frame = requestAnimationFrame(() => {
      const groups = getBrushPathGroups();
      const labels = getLabelEls().filter(Boolean);
      const allPaths = groups.flat().filter(Boolean);
      const triggerEl = getTriggerEl?.() ?? null;
      const closedWidthPx = Math.max(
        1,
        getClosedTriggerWidthPx?.() ?? triggerEl?.offsetWidth ?? 36,
      );

      if (allPaths.length === 0 && !triggerEl) {
        if (isClosing) onCloseCompleteRef.current?.();
        return;
      }

      if (reducedMotion) {
        if (isClosing) {
          prepareUndrawn(allPaths);
          prepareLabelsHidden(labels);
          if (triggerEl) triggerEl.style.width = "";
          onCloseCompleteRef.current?.();
        } else {
          showFullyDrawn(allPaths);
          showLabelsFully(labels);
          if (triggerEl) triggerEl.style.width = `${openWidthPx}px`;
        }
        return;
      }

      const nextAnimations: Animatable[] = [];

      if (isClosing) {
        showFullyDrawn(allPaths);
        showLabelsFully(labels);

        for (let pathIndex = 0; pathIndex < BRUSH_REVEAL_PATHS.length; pathIndex++) {
          const def = BRUSH_REVEAL_PATHS[pathIndex]!;
          const paths = groups
            .map((group) => group[pathIndex])
            .filter((path): path is SVGPathElement => path != null);
          if (paths.length === 0) continue;

          const drawable = createDrawable(paths);
          nextAnimations.push(
            animate(drawable, {
              draw: ["0 1", "0 0"],
              duration: def.duration,
              delay: def.delay,
              ease: BRUSH_REVEAL_EASE,
            }) as Animatable,
          );
        }

        // Text out first / faster so copy never sits on a vanishing brush.
        if (labels.length > 0) {
          nextAnimations.push(
            animate(labels, {
              opacity: [1, 0],
              scale: [1, 0.98],
              duration: BRUSH_REVEAL_TEXT_CLOSE_DURATION_MS,
              delay: BRUSH_REVEAL_TEXT_CLOSE_DELAY_MS,
              ease: BRUSH_REVEAL_EASE,
            }) as Animatable,
          );
        }

        if (triggerEl) {
          const fromWidth = triggerEl.offsetWidth || openWidthPx;
          triggerEl.style.width = `${fromWidth}px`;
          nextAnimations.push(
            animate(triggerEl, {
              width: [`${fromWidth}px`, `${closedWidthPx}px`],
              duration: durationMs,
              ease: BRUSH_REVEAL_EASE,
            }) as Animatable,
          );
        }

        animationsRef.current = nextAnimations;
        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null;
          if (triggerEl) triggerEl.style.width = "";
          onCloseCompleteRef.current?.();
        }, durationMs);
        return;
      }

      prepareLabelsHidden(labels);

      if (triggerEl) {
        triggerEl.style.width = `${closedWidthPx}px`;
        nextAnimations.push(
          animate(triggerEl, {
            width: [`${closedWidthPx}px`, `${openWidthPx}px`],
            duration: durationMs,
            ease: BRUSH_REVEAL_EASE,
          }) as Animatable,
        );
      }

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
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      stopAll(animationsRef.current);
      animationsRef.current = [];
    };
  }, [
    phase,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
    getTriggerEl,
    getClosedTriggerWidthPx,
  ]);
}
