"use client";

import { animate, createDrawable } from "animejs";
import { useEffect, useRef } from "react";
import {
  BRUSH_REVEAL_EASE,
  BRUSH_REVEAL_LABEL_DELAY_MS,
  BRUSH_REVEAL_LABEL_DURATION_MS,
  BRUSH_REVEAL_PATHS,
  BRUSH_REVEAL_TEXT_CLOSE_DELAY_MS,
  BRUSH_REVEAL_TEXT_CLOSE_DURATION_MS,
  BRUSH_OPTION_DRAW_MS,
} from "./brushRevealPaths";

export { BRUSH_OPTION_DRAW_MS };

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
};

/** One option’s mask brush paths, indexed like BRUSH_REVEAL_PATHS. */
export type BrushRevealPathGroup = SVGPathElement[];

export type BrushMenuDrawPhase = "open" | "closing";

export type BrushTriggerSizePx = {
  width: number;
  height: number;
};

function stopAnimation(animation: Animatable | null) {
  if (!animation) return;
  try {
    // pause/cancel only — revert() snaps width/height mid-flight and kills close tweens.
    animation.pause?.();
    animation.cancel?.();
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

/** End time of the slowest brush stroke — shared by paint + trigger size tweens. */
function brushStrokeMs(): number {
  let max = 0;
  for (const def of BRUSH_REVEAL_PATHS) {
    max = Math.max(max, def.delay + def.duration);
  }
  return max;
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
  /** In-flow trigger sized to match option rows while open. */
  getTriggerEl?: () => HTMLElement | null;
  getClosedTriggerSizePx?: () => BrushTriggerSizePx;
  getOpenTriggerSizePx?: () => BrushTriggerSizePx;
  onCloseComplete?: () => void;
}) {
  const {
    phase,
    reducedMotion,
    getBrushPathGroups,
    getLabelEls,
    getTriggerEl,
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
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
    const durationMs = brushStrokeMs();

    const frame = requestAnimationFrame(() => {
      const groups = getBrushPathGroups();
      const labels = getLabelEls().filter(Boolean);
      const allPaths = groups.flat().filter(Boolean);
      const triggerEl = getTriggerEl?.() ?? null;
      const closedSize = getClosedTriggerSizePx?.() ?? {
        width: triggerEl?.offsetWidth || 36,
        height: triggerEl?.offsetHeight || 36,
      };
      const openSize = getOpenTriggerSizePx?.() ?? {
        width: Math.max(closedSize.width, triggerEl?.offsetWidth || 0),
        height: Math.max(closedSize.height, triggerEl?.offsetHeight || 0),
      };

      if (allPaths.length === 0 && !triggerEl) {
        if (isClosing) onCloseCompleteRef.current?.();
        return;
      }

      const clearTriggerSize = () => {
        if (!triggerEl) return;
        triggerEl.style.width = "";
        triggerEl.style.height = "";
      };

      if (reducedMotion) {
        if (isClosing) {
          prepareUndrawn(allPaths);
          prepareLabelsHidden(labels);
          clearTriggerSize();
          onCloseCompleteRef.current?.();
        } else {
          showFullyDrawn(allPaths);
          showLabelsFully(labels);
          if (triggerEl) {
            triggerEl.style.width = `${openSize.width}px`;
            triggerEl.style.height = `${openSize.height}px`;
          }
        }
        return;
      }

      const nextAnimations: Animatable[] = [];

      if (isClosing) {
        showFullyDrawn(allPaths);
        // Don't force labels visible — keep current opacity; fade from here.
        for (const label of labels) {
          if (!label.style.opacity) label.style.opacity = "1";
        }

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

        // Text out faster than brush so copy never sits on a vanishing stroke.
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
          const fromWidth = triggerEl.offsetWidth || openSize.width;
          const fromHeight = triggerEl.offsetHeight || openSize.height;
          triggerEl.style.width = `${fromWidth}px`;
          triggerEl.style.height = `${fromHeight}px`;
          nextAnimations.push(
            animate(triggerEl, {
              width: [`${fromWidth}px`, `${closedSize.width}px`],
              height: [`${fromHeight}px`, `${closedSize.height}px`],
              duration: durationMs,
              ease: BRUSH_REVEAL_EASE,
            }) as Animatable,
          );
        }

        animationsRef.current = nextAnimations;
        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null;
          clearTriggerSize();
          onCloseCompleteRef.current?.();
        }, durationMs);
        return;
      }

      prepareLabelsHidden(labels);

      if (triggerEl) {
        triggerEl.style.width = `${closedSize.width}px`;
        triggerEl.style.height = `${closedSize.height}px`;
        nextAnimations.push(
          animate(triggerEl, {
            width: [`${closedSize.width}px`, `${openSize.width}px`],
            height: [`${closedSize.height}px`, `${openSize.height}px`],
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
    getClosedTriggerSizePx,
    getOpenTriggerSizePx,
  ]);
}
