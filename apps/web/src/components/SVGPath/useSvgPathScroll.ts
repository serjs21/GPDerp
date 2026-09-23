"use client";

import { useCallback, useRef, useState } from "react";
import { animate } from "motion/react";
import { canStepBack, canStepForward, clampFocusIndex, clampScrollFocusIndex, CREATION_FOCUS_INDEX } from "./utils";
import {
  isScrollToTopNear,
  SCROLL_TO_TOP_HANDOFF_INDEX,
  scrollToTopNearDurationMs,
} from "./scrollToTop.config";

type JumpEase = "linear" | "easeInOut" | "easeOut";

type JumpOptions = {
  durationMs: number;
  ease?: JumpEase;
  onSettled?: (focusIndex: number) => void;
};

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
  const pendingDirectionRef = useRef<1 | -1 | null>(null);
  const animationGenRef = useRef(0);
  const runStepRef = useRef<(direction: 1 | -1) => boolean>(() => false);

  const runJump = useCallback(
    (toIndex: number, jump: JumpOptions, clamp: typeof clampFocusIndex = clampFocusIndex) => {
      const current = focusRef.current;
      const next = clamp(toIndex, haikuCount);
      if (next === current) return false;

      animationGenRef.current += 1;
      const gen = animationGenRef.current;

      animatingRef.current = true;
      setIsAnimating(true);
      setFromFocusIndex(current);
      setFocusIndex(next);
      focusRef.current = next;
      setTweenProgress(0);

      animationRef.current = animate(0, 1, {
        duration: jump.durationMs / 1000,
        ease: jump.ease ?? "linear",
        onUpdate: (value) => {
          if (animationGenRef.current !== gen) return;
          setTweenProgress(value);
        },
        onComplete: () => {
          if (animationGenRef.current !== gen) return;
          focusRef.current = next;
          setFromFocusIndex(next);
          setTweenProgress(1);
          animationRef.current = null;
          jump.onSettled?.(next);
        },
      });

      return true;
    },
    [haikuCount],
  );

  const settleAfterStep = useCallback(
    (settled: number) => {
      const pending = pendingDirectionRef.current;
      pendingDirectionRef.current = null;
      if (pending) {
        runStepRef.current(pending);
        return;
      }
      setIsAnimating(false);
      animatingRef.current = false;
      onFocusChange?.(settled);
    },
    [onFocusChange],
  );

  const runStep = useCallback(
    (direction: 1 | -1) => {
      const current = focusRef.current;
      const next = clampFocusIndex(current + direction, haikuCount);
      if (next === current) return false;

      return runJump(next, {
        durationMs,
        ease: "linear",
        onSettled: settleAfterStep,
      });
    },
    [durationMs, haikuCount, runJump, settleAfterStep],
  );

  runStepRef.current = runStep;

  const step = useCallback(
    (direction: 1 | -1) => {
      if (haikuCount === 0) return false;

      const current = focusRef.current;
      const queuedCurrent = current + (pendingDirectionRef.current ?? 0);
      const next = clampFocusIndex(queuedCurrent + direction, haikuCount);
      if (next === queuedCurrent) return false;

      if (animatingRef.current) {
        pendingDirectionRef.current = direction;
        return true;
      }

      return runStep(direction);
    },
    [haikuCount, runStep],
  );

  const stepForward = useCallback(() => step(1), [step]);
  const stepBack = useCallback(() => step(-1), [step]);

  const snapFocusIndex = useCallback(
    (toIndex: number, clamp: typeof clampFocusIndex = clampFocusIndex) => {
      if (haikuCount === 0) return false;

      const next = clamp(toIndex, haikuCount);
      if (focusRef.current === next) return false;

      pendingDirectionRef.current = null;
      animationRef.current?.stop();
      animationGenRef.current += 1;

      focusRef.current = next;
      setFocusIndex(next);
      setFromFocusIndex(next);
      setTweenProgress(1);
      setIsAnimating(false);
      animatingRef.current = false;
      onFocusChange?.(next);
      return true;
    },
    [haikuCount, onFocusChange],
  );

  const snapToTop = useCallback(() => snapFocusIndex(0), [snapFocusIndex]);

  const scrollToTop = useCallback(() => {
    if (haikuCount === 0) return false;

    const current = focusRef.current;
    if (current === 0) return false;

    pendingDirectionRef.current = null;
    animationRef.current?.stop();

    const finishNear = (fromIndex: number) =>
      runJump(0, {
        durationMs: scrollToTopNearDurationMs(fromIndex, durationMs),
        ease: "easeOut",
        onSettled: (settled) => {
          setIsAnimating(false);
          animatingRef.current = false;
          onFocusChange?.(settled);
        },
      });

    if (isScrollToTopNear(current)) {
      return finishNear(current);
    }

    const handoff = clampFocusIndex(SCROLL_TO_TOP_HANDOFF_INDEX, haikuCount);
    if (handoff >= current) {
      return finishNear(current);
    }

    // Far: snap to handoff immediately, then run the near scroll from there.
    focusRef.current = handoff;
    setFromFocusIndex(handoff);
    setFocusIndex(handoff);
    setTweenProgress(1);
    return finishNear(handoff);
  }, [durationMs, haikuCount, onFocusChange, runJump]);

  const scrollToCreationSlot = useCallback(() => {
    if (haikuCount === 0) return false;

    const current = focusRef.current;
    if (current === CREATION_FOCUS_INDEX) return false;

    pendingDirectionRef.current = null;
    animationRef.current?.stop();

    // Adjacent unit steps so list lanterns use SteppedTransition (avoids content
    // overlapping the creation lantern during a long multi-index jump).
    const stepTowardCreation = (from: number): boolean => {
      const next = Math.max(CREATION_FOCUS_INDEX, from - 1);
      if (next === from) return false;

      return runJump(
        next,
        {
          durationMs,
          ease: "linear",
          onSettled: (settled) => {
            if (settled > CREATION_FOCUS_INDEX) {
              stepTowardCreation(settled);
              return;
            }
            setIsAnimating(false);
            animatingRef.current = false;
            onFocusChange?.(settled);
          },
        },
        clampScrollFocusIndex,
      );
    };

    return stepTowardCreation(current);
  }, [durationMs, haikuCount, onFocusChange, runJump]);

  const getFocusIndex = useCallback(() => focusRef.current, []);

  return {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    scrollToTop,
    scrollToCreationSlot,
    snapToTop,
    getFocusIndex,
    canStepForward: !isAnimating && canStepForward(focusIndex, haikuCount),
    canStepBack: !isAnimating && canStepBack(focusIndex),
  };
}
