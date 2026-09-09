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

function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
  runId = "pre-fix",
) {
  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "2d0294",
    },
    body: JSON.stringify({
      sessionId: "2d0294",
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
  debugLog("E", "useBubbleOptionCountResize.ts:lockBase", "locked base to max-5 viewport", {
    optionCount,
    capped,
    targetScale,
    baseHeight,
    transformOrigin,
    rectH: resizeEl.getBoundingClientRect().height,
  });
}

function tweenScaleY(
  resizeEl: HTMLElement,
  shellEl: HTMLElement,
  viewportEl: HTMLElement,
  transformOrigin: string,
  optionCount: number,
  fromScale: number,
  toScale: number,
  bubbleAnimRef: { current: AnimLike | null },
  contentAnimRef: { current: AnimLike | null },
  lastScaleRef: { current: number },
) {
  stopAnim(bubbleAnimRef.current);
  stopAnim(contentAnimRef.current);

  const capped = Math.min(Math.max(optionCount, 0), MAX_VISIBLE_ROWS);
  const contentFrom = fromScale === 0 ? 1 : 1 / fromScale;
  const contentTo = toScale === 0 ? 1 : 1 / toScale;

  debugLog("A", "useBubbleOptionCountResize.ts:runScale", "scale-only tween (no layout height change)", {
    optionCount,
    capped,
    fromScale,
    toScale,
    contentFrom,
    contentTo,
    layoutHeightVar: viewportEl.style.getPropertyValue("--list-viewport-height"),
    rectBefore: resizeEl.getBoundingClientRect().height,
  });

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
      debugLog("B", "useBubbleOptionCountResize.ts:onComplete", "bubble scale settled", {
        toScale,
        rectAfter: resizeEl.getBoundingClientRect().height,
      });
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
          viewportEl,
          transformOrigin,
          optionCount,
          lastScaleRef.current,
          targetScale,
          bubbleAnimRef,
          contentAnimRef,
          lastScaleRef,
        );
      },
    }) as TimerLike;

    debugLog("B", "useBubbleOptionCountResize.ts:schedule", "scheduled scale after debounce", {
      optionCount,
      capped,
      targetScale,
      lastScale: lastScaleRef.current,
    });

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
