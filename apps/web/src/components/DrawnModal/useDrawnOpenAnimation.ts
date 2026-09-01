"use client";

import { animate, createDrawable, createTimeline } from "animejs";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { DrawnCloseMarkHandle } from "./DrawnCloseMark";
import type { DrawnFrameHandle } from "./DrawnFrame";
import {
  DRAWN_CONTENT_FADE_MS,
  DRAWN_EASE,
  DRAWN_SIDE_MS,
  DRAWN_X_STROKE_MS,
} from "./drawnTokens";

type TimelineLike = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

function stopTimeline(timeline: TimelineLike | null) {
  if (!timeline) return;
  try {
    timeline.pause?.();
    timeline.cancel?.();
    timeline.revert?.();
  } catch {
    // ignore teardown races
  }
}

function showPathsFully(pathGroups: SVGPathElement[][]) {
  for (const paths of pathGroups) {
    for (const path of paths) {
      path.style.opacity = "1";
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
      path.style.visibility = "visible";
    }
  }
}

function prepareUndrawn(paths: SVGPathElement[]) {
  const drawable = createDrawable(paths);
  for (const item of drawable) {
    item.draw = "0 0";
    if ("style" in item && item.style) {
      (item as SVGPathElement).style.opacity = "1";
      (item as SVGPathElement).style.visibility = "visible";
    }
  }
  return drawable;
}

export function useDrawnOpenAnimation(options: {
  open: boolean;
  reducedMotion: boolean;
  frameRef: RefObject<DrawnFrameHandle | null>;
  closeRef: RefObject<DrawnCloseMarkHandle | null>;
  showClose: boolean;
}) {
  const { open, reducedMotion, frameRef, closeRef, showClose } = options;
  const [contentReady, setContentReady] = useState(false);
  const [chromeReady, setChromeReady] = useState(false);
  const timelineRef = useRef<TimelineLike | null>(null);
  const generationRef = useRef(0);
  const closeWaitRef = useRef(0);

  const finishInstant = useCallback(() => {
    const sidePaths = frameRef.current?.getSidePaths() ?? [];
    const xPaths = showClose ? (closeRef.current?.getStrokePaths() ?? []) : [];
    showPathsFully(sidePaths);
    showPathsFully(xPaths);
    setChromeReady(true);
    setContentReady(true);
  }, [closeRef, frameRef, showClose]);

  const runDrawSequence = useCallback(() => {
    stopTimeline(timelineRef.current);
    timelineRef.current = null;

    const gen = ++generationRef.current;

    if (!open) {
      closeWaitRef.current = 0;
      setContentReady(false);
      setChromeReady(false);
      return;
    }

    const sidePaths = frameRef.current?.getSidePaths() ?? [];
    const xPaths = showClose ? (closeRef.current?.getStrokePaths() ?? []) : [];

    if (sidePaths.every((group) => group.length === 0)) {
      // Geometry not ready yet; DrawnFrame will call again via onGeometryReady.
      return;
    }

    if (showClose && xPaths.every((group) => group.length === 0)) {
      // Close mark may finish one frame later than the border SVG.
      if (closeWaitRef.current < 8) {
        closeWaitRef.current += 1;
        requestAnimationFrame(() => {
          if (generationRef.current !== gen) return;
          runDrawSequence();
        });
      }
      // Otherwise wait for DrawnCloseMark onGeometryReady → restartDraw.
      return;
    }

    closeWaitRef.current = 0;

    if (reducedMotion) {
      finishInstant();
      return;
    }

    setContentReady(false);
    setChromeReady(false);

    const timeline = createTimeline({
      defaults: { ease: DRAWN_EASE },
      onComplete: () => {
        if (generationRef.current !== gen) return;
        setChromeReady(true);
        setContentReady(true);
      },
    });
    timelineRef.current = timeline as TimelineLike;

    let cursor = 0;
    for (const paths of sidePaths) {
      if (paths.length === 0) continue;
      const drawable = prepareUndrawn(paths);
      timeline.add(
        drawable,
        {
          draw: ["0 0", "0 1"],
          duration: DRAWN_SIDE_MS,
        },
        cursor,
      );
      cursor += DRAWN_SIDE_MS;
    }

    for (const paths of xPaths) {
      if (paths.length === 0) continue;
      const drawable = prepareUndrawn(paths);
      timeline.add(
        drawable,
        {
          draw: ["0 0", "0 1"],
          duration: DRAWN_X_STROKE_MS,
        },
        cursor,
      );
      cursor += DRAWN_X_STROKE_MS;
    }

    timeline.add({ duration: Math.max(40, DRAWN_CONTENT_FADE_MS * 0.15) }, cursor);
  }, [closeRef, finishInstant, frameRef, open, reducedMotion, showClose]);

  useEffect(() => {
    if (!open) {
      stopTimeline(timelineRef.current);
      timelineRef.current = null;
      setContentReady(false);
      setChromeReady(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      runDrawSequence();
    });
    return () => {
      cancelAnimationFrame(id);
      stopTimeline(timelineRef.current);
      timelineRef.current = null;
    };
  }, [open, runDrawSequence]);

  return {
    contentReady,
    chromeReady,
    /** Re-run after Rough geometry rebuild (e.g. resize while open). */
    restartDraw: runDrawSequence,
  };
}

/** Soft overlay/shell fade helpers for open/close without Motion. */
export function fadeElement(
  el: HTMLElement | null,
  toOpacity: number,
  durationMs: number,
): Promise<void> {
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    animate(el, {
      opacity: toOpacity,
      duration: durationMs,
      ease: DRAWN_EASE,
      onComplete: () => resolve(),
    });
  });
}
