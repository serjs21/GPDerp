"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "motion/react";

const SVG_PATH_CATCH_UP_MS = 450;

/**
 * When a page lands while the pagination loader was visible, newly appended haikus tween in from the
 * loader slot. `catchUpStartRef` holds the first new index while that tween runs.
 */
export function usePathCatchUp(haikuCount: number, loaderShown: boolean) {
  const catchUpStartRef = useRef<number | null>(null);
  const prevHaikuCountRef = useRef(haikuCount);
  const loaderWasShownRef = useRef(false);
  const [catchUpT, setCatchUpT] = useState(1);
  const catchUpAnimationRef = useRef<ReturnType<typeof animate> | null>(null);

  const startedCatchUpThisRender =
    haikuCount > prevHaikuCountRef.current && loaderWasShownRef.current;
  if (startedCatchUpThisRender) {
    catchUpStartRef.current = prevHaikuCountRef.current;
  }
  const displayCatchUpT = startedCatchUpThisRender ? 0 : catchUpT;

  useLayoutEffect(() => {
    const prevCount = prevHaikuCountRef.current;
    const nextCount = haikuCount;
    const wasLoader = loaderWasShownRef.current;
    prevHaikuCountRef.current = nextCount;
    loaderWasShownRef.current = loaderShown;

    if (nextCount <= prevCount || !wasLoader) return;

    catchUpStartRef.current = prevCount;
    setCatchUpT(0);
    catchUpAnimationRef.current?.stop();
    catchUpAnimationRef.current = animate(0, 1, {
      duration: SVG_PATH_CATCH_UP_MS / 1000,
      ease: "easeOut",
      onUpdate: (value) => setCatchUpT(value),
      onComplete: () => {
        catchUpStartRef.current = null;
        catchUpAnimationRef.current = null;
        setCatchUpT(1);
      },
    });
  }, [haikuCount, loaderShown]);

  useEffect(() => {
    return () => {
      catchUpAnimationRef.current?.stop();
    };
  }, []);

  return { catchUpStartRef, displayCatchUpT };
}
