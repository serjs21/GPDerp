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
 * Panel body fades independently from chrome (ring + nav star).
 * Chrome stays at opacity 1 through open/close draw, then drops to 0 at close end.
 */
export function useCelestialSelectorPanelMotion(options: {
  phase: CelestialSelectorPanelPhase | null;
  reducedMotion: boolean;
  panelContentRef: React.RefObject<HTMLElement | null>;
  panelChromeRef: React.RefObject<HTMLElement | null>;
  ringRef: React.RefObject<SVGCircleElement | null>;
  onCloseComplete?: () => void;
  onOpenLayout?: () => void;
}) {
  const {
    phase,
    reducedMotion,
    panelContentRef,
    panelChromeRef,
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

    const finishClose = () => {
      const chrome = panelChromeRef.current;
      if (chrome) chrome.style.opacity = "0";
      onCloseCompleteRef.current?.();
    };

    const frame = requestAnimationFrame(() => {
      const content = panelContentRef.current;
      const chrome = panelChromeRef.current;
      const ring = ringRef.current;

      if (!content) {
        if (isClosing) finishClose();
        return;
      }

      if (chrome) chrome.style.opacity = "1";

      if (reducedMotion) {
        if (isClosing) {
          content.style.opacity = "0";
          if (ring) prepareUndrawn(ring);
          finishClose();
        } else {
          content.style.opacity = "1";
          if (ring) showFullyDrawn(ring);
          onOpenLayoutRef.current?.();
        }
        return;
      }

      if (isClosing) {
        if (!content.style.opacity) content.style.opacity = "1";
        if (ring) showFullyDrawn(ring);

        const next: Animatable[] = [];
        next.push(
          animate(content, {
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
          finishClose();
        }, duration);
        return;
      }

      content.style.opacity = "0";
      const drawable = ring ? prepareUndrawn(ring) : [];
      onOpenLayoutRef.current?.();

      const next: Animatable[] = [];
      next.push(
        animate(content, {
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
  }, [phase, reducedMotion, panelContentRef, panelChromeRef, ringRef]);
}
