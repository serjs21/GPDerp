"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";

export type AnchorBox = {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

/** Viewport box of `rootRef` while `active`, kept in sync on scroll/resize; null when inactive. */
export function useViewportAnchor(rootRef: RefObject<HTMLElement | null>, active: boolean) {
  const [anchor, setAnchor] = useState<AnchorBox | null>(null);

  const syncAnchor = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setAnchor({
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    });
  }, [rootRef]);

  useLayoutEffect(() => {
    if (active) syncAnchor();
  }, [active, syncAnchor]);

  useEffect(() => {
    if (!active) return;
    const onReposition = () => syncAnchor();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [active, syncAnchor]);

  return active ? anchor : null;
}
