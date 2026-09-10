"use client";

import { useEffect, type RefObject } from "react";

/** Focus search once the comic panel is mounted and bubble-ready. */
export function useFocusSearchOnPanelReady(
  open: boolean,
  disabled: boolean | undefined,
  searchInputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    if (!open || disabled) return;

    let cancelled = false;
    let frames = 0;
    const tryFocus = () => {
      if (cancelled || frames > 120) return;
      frames += 1;
      const input = searchInputRef.current;
      if (!input) {
        requestAnimationFrame(tryFocus);
        return;
      }
      const panel = input.closest("[data-bubble-ready]");
      if (panel?.getAttribute("data-bubble-ready") !== "true") {
        requestAnimationFrame(tryFocus);
        return;
      }
      input.focus();
    };

    requestAnimationFrame(tryFocus);
    return () => {
      cancelled = true;
    };
  }, [disabled, open, searchInputRef]);
}
