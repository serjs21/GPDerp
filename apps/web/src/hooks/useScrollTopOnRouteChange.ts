"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Scroll the window to the top when the pathname changes. App Router only
 * scrolls when the new page is out of view, which the sticky header and
 * full-height shell defeat. Query-only updates and hash links are left alone.
 */
export function useScrollTopOnRouteChange() {
  const pathname = usePathname();
  const previousRef = useRef(pathname);

  useEffect(() => {
    if (previousRef.current === pathname) return;
    previousRef.current = pathname;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
}
