"use client";

import { useEffect, useRef, useState } from "react";
import { CLAP_BURST_OFFSET_PX, CLAP_FADE_MS, CLAP_HOLD_MS } from "./consts/haikuActionsConsts";
import type { ClapBurstPosition } from "./HaikuActions.types";

/** Clap burst pinned to the toggle's top-right corner: holds, fades, then unmounts. */
export function useClapBurst() {
  const [showClap, setShowClap] = useState(false);
  const [clapFading, setClapFading] = useState(false);
  const [clapFixedPos, setClapFixedPos] = useState<ClapBurstPosition | null>(null);
  const clapTimersRef = useRef<number[]>([]);
  const toggleWrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(
    () => () => {
      for (const id of clapTimersRef.current) window.clearTimeout(id);
    },
    [],
  );

  const playClap = () => {
    const wrap = toggleWrapRef.current;
    if (wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      setClapFixedPos({
        top: wrapRect.top - CLAP_BURST_OFFSET_PX,
        left: wrapRect.right - CLAP_BURST_OFFSET_PX,
      });
    }
    for (const id of clapTimersRef.current) window.clearTimeout(id);
    clapTimersRef.current = [];
    setClapFading(false);
    setShowClap(true);
    const fadeId = window.setTimeout(() => {
      setClapFading(true);
      const doneId = window.setTimeout(() => {
        setShowClap(false);
        setClapFading(false);
        setClapFixedPos(null);
        clapTimersRef.current = [];
      }, CLAP_FADE_MS);
      clapTimersRef.current.push(doneId);
    }, CLAP_HOLD_MS);
    clapTimersRef.current = [fadeId];
  };

  return {
    toggleWrapRef,
    clapPosition: showClap ? clapFixedPos : null,
    clapFading,
    playClap,
  };
}
