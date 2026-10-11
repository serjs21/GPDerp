"use client";

import { useEffect, useState } from "react";

const FINE_BAND_EXIT_MS = 1000;

/** Fine cloud/flame bands stay mounted while they play their exit after the panel leaves `fine`. */
export function useFineBands(isFineBackground: boolean) {
  const [visible, setVisible] = useState(isFineBackground);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isFineBackground) {
      setVisible(true);
      setExiting(false);
      return;
    }
    if (!visible) return;

    setExiting(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, FINE_BAND_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isFineBackground, visible]);

  return { visible, exiting };
}
