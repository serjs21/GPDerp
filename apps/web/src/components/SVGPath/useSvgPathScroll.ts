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
  const pendingDirectionRef = useRef<1 | -1 | null>(null);
  const animationGenRef = useRef(0);

  const runStep = useCallback(
    (direction: 1 | -1) => {
      const current = focusRef.current;
      const next = clampFocusIndex(current + direction, haikuCount);
      if (next === current) return false;

      animationGenRef.current += 1;
      const gen = animationGenRef.current;

      animatingRef.current = true;
      setIsAnimating(true);
      setFromFocusIndex(current);
      setFocusIndex(next);
      focusRef.current = next;
      setTweenProgress(0);

      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix-one-stop",
          hypothesisId: "B",
          location: "useSvgPathScroll.ts:runStep",
          message: "step accepted",
          data: { direction, current, next, gen, delta: next - current },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      animationRef.current = animate(0, 1, {
        duration: durationMs / 1000,
        ease: "linear",
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
          const pending = pendingDirectionRef.current;
          pendingDirectionRef.current = null;
          if (pending) {
            runStep(pending);
            return;
          }
          setIsAnimating(false);
          animatingRef.current = false;
          onFocusChange?.(next);
        },
      });

      return true;
    },
    [durationMs, haikuCount, onFocusChange],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (haikuCount === 0) {
        // #region agent log
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
          body: JSON.stringify({
            sessionId: "53a752",
            runId: "post-fix-one-stop",
            hypothesisId: "B",
            location: "useSvgPathScroll.ts:step-block",
            message: "step blocked by empty",
            data: { direction, haikuCount },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return false;
      }

      const current = focusRef.current;
      const queuedCurrent = current + (pendingDirectionRef.current ?? 0);
      const next = clampFocusIndex(queuedCurrent + direction, haikuCount);
      if (next === queuedCurrent) {
        // #region agent log
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
          body: JSON.stringify({
            sessionId: "53a752",
            runId: "post-fix-one-stop",
            hypothesisId: "D",
            location: "useSvgPathScroll.ts:step-clamp",
            message: "step blocked at bound",
            data: { direction, current, queuedCurrent, next, haikuCount },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return false;
      }

      if (animatingRef.current) {
        pendingDirectionRef.current = direction;
        // #region agent log
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
          body: JSON.stringify({
            sessionId: "53a752",
            runId: "post-fix-one-stop",
            hypothesisId: "B",
            location: "useSvgPathScroll.ts:step-queue",
            message: "queued one stop",
            data: { direction, current, pending: direction },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return true;
      }

      return runStep(direction);
    },
    [haikuCount, runStep],
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
