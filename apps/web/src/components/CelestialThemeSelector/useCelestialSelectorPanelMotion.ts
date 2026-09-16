"use client";

import { animate, createDrawable } from "animejs";
import { useEffect, useRef } from "react";
import { CELESTIAL_SELECTOR_PANEL_MOTION } from "./celestialSelectorPanelMotion.config";

export type CelestialSelectorPanelPhase = "open" | "closing";

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
};

function stopAnimation(animation: Animatable | null) {
  if (!animation) return;
  try {
    animation.pause?.();
    animation.cancel?.();
  } catch {
    // ignore teardown races
  }
}

function prepareUndrawn(circle: SVGGeometryElement) {
  const [drawable] = createDrawable(circle);
  if (drawable) drawable.draw = "0 0";
  return drawable ? [drawable] : [];
}

function showFullyDrawn(circle: SVGGeometryElement) {
  const [drawable] = createDrawable(circle);
  if (drawable) drawable.draw = "0 1";
}

/**
 * Draws a highlight circle around the panel while fading opacity in;
 * reverse undraw + fade out on close. Keeps the panel mounted until
 * `onCloseComplete` when `phase === "closing"`.
 */
export function useCelestialSelectorPanelMotion(options: {
  phase: CelestialSelectorPanelPhase | null;
  reducedMotion: boolean;
  panelPopRef: React.RefObject<HTMLElement | null>;
  ringRef: React.RefObject<SVGCircleElement | null>;
  onCloseComplete?: () => void;
  /** Re-measure anchor after open layout settles. */
  onOpenLayout?: () => void;
}) {
  const {
    phase,
    reducedMotion,
    panelPopRef,
    ringRef,
    onCloseComplete,
    onOpenLayout,
  } = options;

  const animationsRef = useRef<Animatable[]>([]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseCompleteRef = useRef(onCloseComplete);
  onCloseCompleteRef.current = onCloseComplete;
  const onOpenLayoutRef = useRef(onOpenLayout);
  onOpenLayoutRef.current = onOpenLayout;

  useEffect(() => {
    for (const animation of animationsRef.current) {
      stopAnimation(animation);
    }
    animationsRef.current = [];
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (!phase) return;

    const isClosing = phase === "closing";
    const duration = CELESTIAL_SELECTOR_PANEL_MOTION.durationMs;

    const frame = requestAnimationFrame(() => {
      const panel = panelPopRef.current;
      const ring = ringRef.current;
      if (!panel) {
        if (isClosing) onCloseCompleteRef.current?.();
        return;
      }

      if (reducedMotion) {
        if (isClosing) {
          panel.style.opacity = "0";
          if (ring) prepareUndrawn(ring);
          onCloseCompleteRef.current?.();
        } else {
          panel.style.opacity = "1";
          if (ring) showFullyDrawn(ring);
          onOpenLayoutRef.current?.();
        }
        return;
      }

      if (isClosing) {
        if (!panel.style.opacity) panel.style.opacity = "1";
        if (ring) showFullyDrawn(ring);

        const next: Animatable[] = [];
        next.push(
          animate(panel, {
            opacity: [1, 0],
            duration,
            ease: CELESTIAL_SELECTOR_PANEL_MOTION.ease,
          }) as Animatable,
        );
        if (ring) {
          const drawable = createDrawable(ring);
          next.push(
            animate(drawable, {
              draw: ["0 1", "0 0"],
              duration,
              ease: CELESTIAL_SELECTOR_PANEL_MOTION.ease,
            }) as Animatable,
          );
        }
        animationsRef.current = next;

        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null;
          onCloseCompleteRef.current?.();
        }, duration);
        return;
      }

      panel.style.opacity = "0";
      const drawable = ring ? prepareUndrawn(ring) : [];
      onOpenLayoutRef.current?.();

      const next: Animatable[] = [];
      next.push(
        animate(panel, {
          opacity: [0, 1],
          duration,
          ease: CELESTIAL_SELECTOR_PANEL_MOTION.ease,
        }) as Animatable,
      );
      if (drawable.length > 0) {
        next.push(
          animate(drawable, {
            draw: ["0 0", "0 1"],
            duration,
            ease: CELESTIAL_SELECTOR_PANEL_MOTION.ease,
          }) as Animatable,
        );
      }
      animationsRef.current = next;
    });

    return () => {
      cancelAnimationFrame(frame);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      for (const animation of animationsRef.current) {
        stopAnimation(animation);
      }
      animationsRef.current = [];
    };
  }, [phase, reducedMotion, panelPopRef, ringRef]);
}
