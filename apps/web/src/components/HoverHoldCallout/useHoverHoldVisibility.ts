"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hover shows the callout; a click holds it for `holdMs`; leaving (when not held) or the hold ending
 * (when not hovered) fades it out over `fadeMs`.
 */
export function useHoverHoldVisibility(holdMs: number, fadeMs: number) {
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [fading, setFading] = useState(false);
  const hoveredRef = useRef(false);
  const heldRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  heldRef.current = held;

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const beginFadeOut = useCallback(() => {
    setFading(true);
    const doneId = window.setTimeout(() => {
      setFading(false);
      timersRef.current = timersRef.current.filter((id) => id !== doneId);
    }, fadeMs);
    timersRef.current.push(doneId);
  }, [fadeMs]);

  const onEnter = () => {
    hoveredRef.current = true;
    setHovered(true);
    setFading(false);
  };

  const onLeave = () => {
    hoveredRef.current = false;
    setHovered(false);
    if (!heldRef.current) beginFadeOut();
  };

  const onClick = () => {
    clearTimers();
    setFading(false);
    setHeld(true);
    const holdId = window.setTimeout(() => {
      setHeld(false);
      timersRef.current = timersRef.current.filter((id) => id !== holdId);
      if (!hoveredRef.current) beginFadeOut();
    }, holdMs);
    timersRef.current.push(holdId);
  };

  const open = hovered || held;
  return {
    /** Callout is in the DOM (open, or fading out). */
    mounted: open || fading,
    /** Callout is fully shown (not fading). */
    visible: open && !fading,
    onEnter,
    onLeave,
    onClick,
  };
}
