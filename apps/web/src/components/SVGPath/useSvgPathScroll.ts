"use client";

import { useCallback, useRef, useState } from "react";
import { animate } from "motion/react";
import { canStepBack, canStepForward, clampFocusIndex } from "./svgPathPose";

export function useSvgPathScroll(
  haikuCount: number,
  durationMs: number,
  options: {
    initialFocusIndex?: number;
    onFocusChange?: (focusIndex: number) => void;
  } = {},
) {
  const { initialFocusIndex, onFocusChange } = options;
  const initialFocus = clampFocusIndex(initialFocusIndex ?? 0, haikuCount);

  const [focusIndex, setFocusIndex] = useState(initialFocus);
  const [fromFocusIndex, setFromFocusIndex] = useState(initialFocus);
  const [tweenProgress, setTweenProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const focusRef = useRef(initialFocus);
  const animatingRef = useRef(false);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  const cancelAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (animatingRef.current || haikuCount === 0) return false;

      const current = focusRef.current;
      const next = clampFocusIndex(current + direction, haikuCount);
      if (next === current) return false;

      cancelAnimation();
      animatingRef.current = true;
      setIsAnimating(true);
      setFromFocusIndex(current);
      setFocusIndex(next);
      focusRef.current = next;
      setTweenProgress(0);

      animationRef.current = animate(0, 1, {
        duration: durationMs / 1000,
        ease: "linear",
        onUpdate: (value) => setTweenProgress(value),
        onComplete: () => {
          focusRef.current = next;
          setFromFocusIndex(next);
          setTweenProgress(1);
          setIsAnimating(false);
          animatingRef.current = false;
          animationRef.current = null;
          onFocusChange?.(next);
        },
      });

      return true;
    },
    [cancelAnimation, durationMs, haikuCount, onFocusChange],
  );

  const stepForward = useCallback(() => step(1), [step]);
  const stepBack = useCallback(() => step(-1), [step]);

  return {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    canStepForward: !isAnimating && canStepForward(focusIndex, haikuCount),
    canStepBack: !isAnimating && canStepBack(focusIndex),
  };
}
