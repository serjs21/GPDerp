"use client";

import { useCallback, useRef, useState } from "react";
import { animate } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import { clampFocusIndex } from "./computeVisibleLanterns";
import { LANTERN_PATH_STEP_MS } from "./lanternPath.config";

export type LanternPathScrollState = {
  focusIndex: number;
  tweenProgress: number;
  fromFocusIndex: number;
  isAnimating: boolean;
};

export function useLanternPathScroll(
  haikus: readonly HaikuDto[],
  options: {
    initialFocusIndex?: number;
    onFocusChange?: (focusIndex: number) => void;
  } = {},
) {
  const haikuCount = haikus.length;
  const initialFocus = clampFocusIndex(options.initialFocusIndex ?? 0, haikuCount);

  const [focusIndex, setFocusIndex] = useState(initialFocus);
  const [fromFocusIndex, setFromFocusIndex] = useState(initialFocus);
  const [tweenProgress, setTweenProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const focusRef = useRef(focusIndex);
  const animatingRef = useRef(false);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  focusRef.current = focusIndex;

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
      setTweenProgress(0);

      animationRef.current = animate(0, 1, {
        duration: LANTERN_PATH_STEP_MS / 1000,
        ease: "linear",
        onUpdate: (value) => setTweenProgress(value),
        onComplete: () => {
          focusRef.current = next;
          setFromFocusIndex(next);
          setTweenProgress(1);
          setIsAnimating(false);
          animatingRef.current = false;
          animationRef.current = null;
          options.onFocusChange?.(next);
        },
      });

      return true;
    },
    [cancelAnimation, haikuCount, options],
  );

  const stepForward = useCallback(() => step(1), [step]);
  const stepBack = useCallback(() => step(-1), [step]);

  const canStepForward = !isAnimating && focusIndex < haikuCount - 1;
  const canStepBack = !isAnimating && focusIndex > 0;

  return {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    canStepForward,
    canStepBack,
  };
}
