"use client";

import { useEffect, useRef, useState } from "react";
import { flippedFromTurns } from "./utils/dualityButtonUtils";

/**
 * Flip state stored as clockwise base turns (never rotates CCW). Controlled when `flippedProp` is set;
 * external controlled updates advance clockwise to the requested side.
 */
export function useDualityFlip(params: {
  flippedProp: boolean | undefined;
  defaultFlipped: boolean;
  disabled: boolean;
  onFlippedChange: ((flipped: boolean) => void) | undefined;
}) {
  const { flippedProp, defaultFlipped, disabled, onFlippedChange } = params;
  const isControlled = flippedProp != null;
  const [clockwiseDeg, setClockwiseDeg] = useState((flippedProp ?? defaultFlipped) ? 180 : 0);
  const lastControlledRef = useRef(flippedProp);

  useEffect(() => {
    if (!isControlled) return;
    const target = flippedProp!;
    if (lastControlledRef.current === target) return;
    lastControlledRef.current = target;
    setClockwiseDeg((prevDeg) => {
      if (flippedFromTurns(prevDeg) === target) return prevDeg;
      return prevDeg + 180;
    });
  }, [flippedProp, isControlled]);

  const onClick = () => {
    if (disabled) return;
    const nextDeg = clockwiseDeg + 180;
    const nextFlipped = flippedFromTurns(nextDeg);
    setClockwiseDeg(nextDeg);
    if (isControlled) lastControlledRef.current = nextFlipped;
    onFlippedChange?.(nextFlipped);
  };

  return { clockwiseDeg, flipped: flippedFromTurns(clockwiseDeg), onClick };
}
