"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const PANEL_OFFSET_PX = 8;

export type CelestialSelectorPanelAnchor = {
  top: number;
  left: number;
};

export function useCelestialSelectorOpenTransition(
  isOpen: boolean,
  onClose: () => void,
) {
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelAnchor, setPanelAnchor] = useState<CelestialSelectorPanelAnchor>({
    top: 0,
    left: 0,
  });

  const updateAnchor = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setPanelAnchor({
      top: rect.bottom + PANEL_OFFSET_PX,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [isOpen, updateAnchor]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, onClose]);

  return {
    triggerRef,
    panelRef,
    panelAnchor,
    reduceMotion,
  };
}
