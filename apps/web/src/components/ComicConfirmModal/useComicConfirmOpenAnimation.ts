"use client";

import { animate } from "animejs";
import { useEffect, useRef, useState, type RefObject } from "react";
import { COMIC_EASE, COMIC_OVERLAY_MS } from "./comicBubblePresets";

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
      ease: COMIC_EASE,
      onComplete: () => resolve(),
    });
  });
}

export function useComicConfirmOpenAnimation(options: {
  open: boolean;
  present: boolean;
  reducedMotion: boolean;
  overlayRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  getCtaElements: () => HTMLElement[];
  onPresentEnd: () => void;
  refreshBubblesRef: RefObject<(() => void) | null>;
}) {
  const {
    open,
    present,
    reducedMotion,
    overlayRef,
    panelRef,
    getCtaElements,
    onPresentEnd,
    refreshBubblesRef,
  } = options;

  const [ctasMounted, setCtasMounted] = useState(false);
  const exitingRef = useRef(false);
  const openGenRef = useRef(0);
  const ctaFadePendingRef = useRef(false);

  useEffect(() => {
    if (open) {
      exitingRef.current = false;
      openGenRef.current += 1;
    }
  }, [open]);

  // Phase 1: overlay + question panel
  useEffect(() => {
    if (!present) {
      setCtasMounted(false);
      ctaFadePendingRef.current = false;
      return;
    }

    if (!open) return;

    const gen = openGenRef.current;
    setCtasMounted(false);
    ctaFadePendingRef.current = false;

    const id = requestAnimationFrame(() => {
      if (reducedMotion) {
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        if (panelRef.current) panelRef.current.style.opacity = "1";
        setCtasMounted(true);
        ctaFadePendingRef.current = true;
        return;
      }

      void (async () => {
        await Promise.all([
          fadeElement(overlayRef.current, 1, COMIC_OVERLAY_MS),
          fadeElement(panelRef.current, 1, COMIC_OVERLAY_MS),
        ]);
        if (gen !== openGenRef.current) return;
        setCtasMounted(true);
        ctaFadePendingRef.current = true;
      })();
    });

    return () => cancelAnimationFrame(id);
  }, [open, overlayRef, panelRef, present, reducedMotion]);

  // Phase 2: after CTAs mount in the DOM, refresh comical and fade them in
  useEffect(() => {
    if (!present || !open || !ctasMounted || !ctaFadePendingRef.current) return;

    const gen = openGenRef.current;
    let cancelled = false;

    const runCtaFade = () => {
      if (cancelled || gen !== openGenRef.current) return;

      refreshBubblesRef.current?.();
      const ctas = getCtaElements();
      if (ctas.length === 0) {
        requestAnimationFrame(runCtaFade);
        return;
      }

      ctaFadePendingRef.current = false;

      if (reducedMotion) {
        for (const el of ctas) {
          el.style.opacity = "0.9";
        }
        return;
      }

      for (const el of ctas) {
        el.style.opacity = "0";
      }

      void Promise.all(ctas.map((el) => fadeElement(el, 0.9, COMIC_OVERLAY_MS)));
    };

    runCtaFade();

    return () => {
      cancelled = true;
    };
  }, [ctasMounted, getCtaElements, open, present, reducedMotion, refreshBubblesRef]);

  // Close: fade everything together
  useEffect(() => {
    if (!present || open) return;
    if (exitingRef.current) return;
    exitingRef.current = true;

    let cancelled = false;
    const runExit = async () => {
      if (reducedMotion) {
        if (!cancelled) {
          onPresentEnd();
          exitingRef.current = false;
        }
        return;
      }

      await Promise.all([
        fadeElement(overlayRef.current, 0, COMIC_OVERLAY_MS),
        fadeElement(panelRef.current, 0, COMIC_OVERLAY_MS),
        ...getCtaElements().map((el) => fadeElement(el, 0, COMIC_OVERLAY_MS)),
      ]);
      if (cancelled) return;
      onPresentEnd();
      exitingRef.current = false;
    };
    void runExit();

    return () => {
      cancelled = true;
    };
  }, [getCtaElements, onPresentEnd, open, overlayRef, panelRef, present, reducedMotion]);

  return { ctasMounted };
}
