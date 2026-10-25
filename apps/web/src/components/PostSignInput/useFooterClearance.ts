"use client";

import { useEffect, useState } from "react";

/** How many px of the page footer currently overlap the viewport bottom (0 when disabled or off-screen). */
export function useFooterClearance(enabled: boolean) {
  const [clearancePx, setClearancePx] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const footer = document.querySelector("footer");
    if (!footer) return;

    const update = () => {
      const top = footer.getBoundingClientRect().top;
      setClearancePx(Math.max(0, window.innerHeight - top));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(footer);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [enabled]);

  return clearancePx;
}
