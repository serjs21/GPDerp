"use client";

import { useEffect } from "react";
import { SITE_HEADER_OVERLAP_VAR, SITE_HEADER_SELECTOR } from "@/consts/header/siteHeaderConsts";

/**
 * Publishes how much of the sticky site header `content` scrolls under
 * (0 = none, 1 = full header height) as a CSS var on `<html>`. Written per
 * frame without React state; removed on unmount so other pages stay transparent.
 */
export function useSiteHeaderOverlap(content: HTMLElement | null): void {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(SITE_HEADER_SELECTOR);
    if (!header || !content) return;

    const root = document.documentElement;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const headerRect = header.getBoundingClientRect();
      if (headerRect.height <= 0) return;
      const overlapPx = headerRect.bottom - content.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, overlapPx / headerRect.height));
      root.style.setProperty(SITE_HEADER_OVERLAP_VAR, progress.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(header);
    observer.observe(content);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      root.style.removeProperty(SITE_HEADER_OVERLAP_VAR);
    };
  }, [content]);
}
