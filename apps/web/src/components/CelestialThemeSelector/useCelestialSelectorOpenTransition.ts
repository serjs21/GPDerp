"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CELESTIAL_SELECTOR_PANEL_MOTION } from "./celestialSelectorPanelMotion.config";

export type CelestialSelectorPanelAnchor = {
  top: number;
  left: number;
};

function estimatePanelSizePx(): { width: number; height: number } {
  const rem =
    typeof document !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;
  const width = Math.min(16 * rem, Math.max(9 * rem, window.innerWidth * 0.28));
  return { width, height: width };
}

/** Prefer below the trigger, centered; clamp so the full panel stays in the viewport. */
export function clampPanelAnchor(
  trigger: DOMRect,
  panelWidth: number,
  panelHeight: number,
  margin = CELESTIAL_SELECTOR_PANEL_MOTION.viewportMarginPx,
  offset = CELESTIAL_SELECTOR_PANEL_MOTION.panelOffsetPx,
): CelestialSelectorPanelAnchor {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const halfW = panelWidth / 2;

  let left = trigger.left + trigger.width / 2;
  left = Math.min(Math.max(left, halfW + margin), Math.max(halfW + margin, vw - halfW - margin));

  let top = trigger.bottom + offset;
  if (top + panelHeight > vh - margin) {
    top = Math.max(margin, trigger.top - offset - panelHeight);
  }
  top = Math.min(top, Math.max(margin, vh - panelHeight - margin));

  return { top, left };
}

export function useCelestialSelectorOpenTransition(
  isPanelMounted: boolean,
  onRequestClose: () => void,
) {
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelPopRef = useRef<HTMLDivElement>(null);
  const [panelAnchor, setPanelAnchor] = useState<CelestialSelectorPanelAnchor>({
    top: 0,
    left: 0,
  });

  const updateAnchor = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const measured = panelPopRef.current;
    const size = measured
      ? { width: measured.offsetWidth, height: measured.offsetHeight }
      : estimatePanelSizePx();

    setPanelAnchor(clampPanelAnchor(rect, size.width, size.height));
  }, []);

  useEffect(() => {
    if (!isPanelMounted) return;

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [isPanelMounted, updateAnchor]);

  useEffect(() => {
    if (!isPanelMounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onRequestClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPanelMounted, onRequestClose]);

  useEffect(() => {
    if (!isPanelMounted) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      onRequestClose();
    };

    // Defer so the opening click does not immediately close the panel.
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isPanelMounted, onRequestClose]);

  return {
    triggerRef,
    panelRef,
    panelPopRef,
    panelAnchor,
    updateAnchor,
    reduceMotion,
  };
}
