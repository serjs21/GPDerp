"use client";

import { animate, createTimer, utils } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import {
  BUBBLE_RESIZE_DELAY_MS,
  BUBBLE_RESIZE_DURATION_MS,
  listViewportHeightForOptionCount,
  MAX_VISIBLE_ROWS,
  MIN_VISIBLE_ROWS,
  scaleYForOptionCount,
} from "./listViewportHeights";

type AnimLike = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

type TimerLike = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

function stopAnim(anim: AnimLike | null) {
  if (!anim) return;
  try {
    anim.pause?.();
    anim.cancel?.();
    anim.revert?.();
  } catch {
    // ignore
  }
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function lockMax5Base(
  resizeEl: HTMLElement,
  shellEl: HTMLElement,
  viewportEl: HTMLElement,
  transformOrigin: string,
  optionCount: number,
  lastScaleRef: { current: number },
) {
  const capped = Math.min(Math.max(optionCount, MIN_VISIBLE_ROWS), MAX_VISIBLE_ROWS);
  const targetScale = scaleYForOptionCount(capped);
  const baseHeight = listViewportHeightForOptionCount(MAX_VISIBLE_ROWS);
  viewportEl.style.setProperty("--list-viewport-height", baseHeight);
  lastScaleRef.current = targetScale;
  utils.set(resizeEl, { scaleY: targetScale, transformOrigin });
  utils.set(shellEl, {
    scaleY: targetScale === 0 ? 1 : 1 / targetScale,
    transformOrigin,
  });
}

function tweenScaleY(
  resizeEl: HTMLElement,
  shellEl: HTMLElement,
  transformOrigin: string,
  fromScale: number,
  toScale: number,
  bubbleAnimRef: { current: AnimLike | null },
  contentAnimRef: { current: AnimLike | null },
  lastScaleRef: { current: number },
) {
  stopAnim(bubbleAnimRef.current);
  stopAnim(contentAnimRef.current);

  const contentFrom = fromScale === 0 ? 1 : 1 / fromScale;
  const contentTo = toScale === 0 ? 1 : 1 / toScale;

  if (prefersReducedMotion()) {
    utils.set(resizeEl, { scaleY: toScale, transformOrigin });
    utils.set(shellEl, { scaleY: contentTo, transformOrigin });
    lastScaleRef.current = toScale;
    return;
  }

  utils.set(resizeEl, { scaleY: fromScale, transformOrigin });
  utils.set(shellEl, { scaleY: contentFrom, transformOrigin });

  bubbleAnimRef.current = animate(resizeEl, {
    scaleY: toScale,
    duration: BUBBLE_RESIZE_DURATION_MS,
    ease: "out",
    delay: 0,
    onComplete: () => {
      lastScaleRef.current = toScale;
    },
  }) as AnimLike;

  contentAnimRef.current = animate(shellEl, {
    scaleY: contentTo,
    duration: BUBBLE_RESIZE_DURATION_MS,
    ease: "inOutSine",
    delay: 0,
  }) as AnimLike;
}

/**
 * Keep the bubble at a fixed open-time layout (capped at 5 rows) and only
 * animate scaleY from that reference. Never change layout height after open,
 * so comical does not re-render on search.
 */
export function useBubbleOptionCountResize({
  open,
  optionCount,
  transformOrigin,
  resizeRef,
  shellRef,
  viewportRef,
}: {
  open: boolean;
  optionCount: number;
  transformOrigin: string;
  resizeRef: RefObject<HTMLElement | null>;
  shellRef: RefObject<HTMLElement | null>;
  viewportRef: RefObject<HTMLElement | null>;
}) {
  const bubbleAnimRef = useRef<AnimLike | null>(null);
  const contentAnimRef = useRef<AnimLike | null>(null);
  const baseLockedRef = useRef(false);
  const lastScaleRef = useRef(1);

  useEffect(() => {
    if (!open) {
      baseLockedRef.current = false;
      lastScaleRef.current = 1;
      stopAnim(bubbleAnimRef.current);
      stopAnim(contentAnimRef.current);
      return;
    }

    const resizeEl = resizeRef.current;
    const shellEl = shellRef.current;
    const viewportEl = viewportRef.current;
    if (!resizeEl || !shellEl || !viewportEl) return;

    const capped = Math.min(Math.max(optionCount, 0), MAX_VISIBLE_ROWS);
    const targetScale = scaleYForOptionCount(capped);

    if (!baseLockedRef.current) {
      lockMax5Base(resizeEl, shellEl, viewportEl, transformOrigin, optionCount, lastScaleRef);
      baseLockedRef.current = true;
      return;
    }

    if (Math.abs(lastScaleRef.current - targetScale) < 0.001) return;

    const timer = createTimer({
      delay: BUBBLE_RESIZE_DELAY_MS,
      duration: 1,
      autoplay: true,
      onComplete: () => {
        tweenScaleY(
          resizeEl,
          shellEl,
          transformOrigin,
          lastScaleRef.current,
          targetScale,
          bubbleAnimRef,
          contentAnimRef,
          lastScaleRef,
        );
      },
    }) as TimerLike;

    return () => {
      try {
        timer.pause?.();
        timer.cancel?.();
        timer.revert?.();
      } catch {
        // ignore
      }
    };
  }, [open, optionCount, transformOrigin, resizeRef, shellRef, viewportRef]);
}
