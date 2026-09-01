"use client";

import { animate } from "animejs";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  COMIC_ANIM_MS,
  COMIC_CTA_REST_OPACITY,
  COMIC_EASE,
} from "./comicBubblePresets";

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

type SlideEnterOptions = {
  fromOpacity: number;
  toOpacity: number;
  fromXRem?: number;
  toXRem?: number;
  fromYRem?: number;
  toYRem?: number;
  durationMs: number;
};

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function restorePartMotion(el: HTMLElement) {
  el.style.opacity = "";
  el.style.transform = "";
}

/** Transform + opacity on part containers (canvas moves with the wrapper). */
function applySlideFrame(
  el: HTMLElement,
  t: number,
  opts: Omit<SlideEnterOptions, "durationMs">,
) {
  const x = lerp(opts.fromXRem ?? 0, opts.toXRem ?? 0, t);
  const y = lerp(opts.fromYRem ?? 0, opts.toYRem ?? 0, t);
  el.style.opacity = String(lerp(opts.fromOpacity, opts.toOpacity, t));
  el.style.transform = x === 0 && y === 0 ? "" : `translate(${x}rem, ${y}rem)`;
}

function clearMotionStyles(el: HTMLElement) {
  restorePartMotion(el);
}

function slideEnter(
  el: HTMLElement | null,
  opts: SlideEnterOptions,
): Promise<void> {
  if (!el) return Promise.resolve();

  const motion = {
    fromOpacity: opts.fromOpacity,
    toOpacity: opts.toOpacity,
    fromXRem: opts.fromXRem ?? 0,
    toXRem: opts.toXRem ?? 0,
    fromYRem: opts.fromYRem ?? 0,
    toYRem: opts.toYRem ?? 0,
  };

  applySlideFrame(el, 0, motion);

  const model = { t: 0 };
  return new Promise((resolve) => {
    animate(model, {
      t: 1,
      duration: opts.durationMs,
      ease: COMIC_EASE,
      onUpdate: () => {
        applySlideFrame(el, model.t, motion);
      },
      onComplete: () => {
        restorePartMotion(el);
        resolve();
      },
    });
  });
}

function slideExit(
  el: HTMLElement | null,
  opts: SlideEnterOptions,
): Promise<void> {
  if (!el) return Promise.resolve();

  const startOpacity = parseFloat(getComputedStyle(el).opacity) || opts.toOpacity;
  const exitMotion = {
    fromOpacity: startOpacity,
    toOpacity: opts.fromOpacity,
    fromXRem: opts.toXRem ?? 0,
    toXRem: opts.fromXRem ?? 0,
    fromYRem: opts.toYRem ?? 0,
    toYRem: opts.fromYRem ?? 0,
  };
  const model = { t: 0 };

  applySlideFrame(el, 0, exitMotion);

  return new Promise((resolve) => {
    animate(model, {
      t: 1,
      duration: opts.durationMs,
      ease: COMIC_EASE,
      onUpdate: () => {
        applySlideFrame(el, model.t, exitMotion);
      },
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
  contentRef: RefObject<HTMLDivElement | null>;
  ctaRowRef: RefObject<HTMLDivElement | null>;
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
    contentRef,
    ctaRowRef,
    getCtaElements,
    onPresentEnd,
    refreshBubblesRef,
  } = options;

  const [ctasMounted, setCtasMounted] = useState(false);
  const [ctaEnterStarted, setCtaEnterStarted] = useState(false);
  const [ctaEnterComplete, setCtaEnterComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitingRef = useRef(false);
  const openGenRef = useRef(0);
  const ctaFadePendingRef = useRef(false);

  useEffect(() => {
    if (open) {
      exitingRef.current = false;
      setIsExiting(false);
      openGenRef.current += 1;
    }
  }, [open]);

  // Phase 1: overlay fade + question part slides in LTR
  useEffect(() => {
    if (!present) {
      setCtasMounted(false);
      setCtaEnterStarted(false);
      setCtaEnterComplete(false);
      setIsExiting(false);
      ctaFadePendingRef.current = false;
      return;
    }

    if (!open) return;

    const gen = openGenRef.current;
    setCtasMounted(false);
    setCtaEnterStarted(false);
    setCtaEnterComplete(false);
    ctaFadePendingRef.current = false;

    const id = requestAnimationFrame(() => {
      if (panelRef.current) panelRef.current.style.opacity = "1";

      if (reducedMotion) {
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        if (contentRef.current) clearMotionStyles(contentRef.current);
        setCtasMounted(true);
        ctaFadePendingRef.current = true;
        setCtaEnterStarted(true);
        setCtaEnterComplete(true);
        return;
      }

      void (async () => {
        await Promise.all([
          fadeElement(overlayRef.current, 1, COMIC_ANIM_MS),
          slideEnter(contentRef.current, {
            fromOpacity: 0,
            toOpacity: 1,
            fromXRem: -2,
            toXRem: 0,
            durationMs: COMIC_ANIM_MS,
          }),
        ]);
        if (gen !== openGenRef.current) return;

        setCtasMounted(true);
        ctaFadePendingRef.current = true;
      })();
    });

    return () => cancelAnimationFrame(id);
  }, [contentRef, open, overlayRef, panelRef, present, reducedMotion]);

  // Phase 2: CTA parts slide up into place
  useEffect(() => {
    if (!present || !open || !ctasMounted || !ctaFadePendingRef.current) return;

    const gen = openGenRef.current;
    let cancelled = false;

    const runCtaEnter = () => {
      if (cancelled || gen !== openGenRef.current) return;

      refreshBubblesRef.current?.();
      const ctas = getCtaElements();
      if (ctas.length === 0) {
        requestAnimationFrame(runCtaEnter);
        return;
      }

      ctaFadePendingRef.current = false;

      if (reducedMotion) {
        for (const el of ctas) {
          clearMotionStyles(el);
        }
        setCtaEnterStarted(true);
        setCtaEnterComplete(true);
        return;
      }

      for (const el of ctas) {
        el.style.opacity = "0";
        el.style.transform = "translate(0rem, 1rem)";
      }
      setCtaEnterStarted(true);

      void Promise.all(
        ctas.map((el) =>
          slideEnter(el, {
            fromOpacity: 0,
            toOpacity: COMIC_CTA_REST_OPACITY,
            fromYRem: 1,
            toYRem: 0,
            durationMs: COMIC_ANIM_MS,
          }),
        ),
      ).then(() => {
        if (!cancelled && gen === openGenRef.current) {
          setCtaEnterComplete(true);
        }
      });
    };

    runCtaEnter();

    return () => {
      cancelled = true;
    };
  }, [ctasMounted, getCtaElements, open, present, reducedMotion, refreshBubblesRef]);

  // Close: overlay fade + content row + CTA row slide/fade out together
  useEffect(() => {
    if (!present || open) return;
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);

    let cancelled = false;
    const runExit = async () => {
      if (reducedMotion) {
        if (!cancelled) {
          onPresentEnd();
          exitingRef.current = false;
          setIsExiting(false);
        }
        return;
      }

      await Promise.all([
        fadeElement(overlayRef.current, 0, COMIC_ANIM_MS),
        slideExit(contentRef.current, {
          fromOpacity: 0,
          toOpacity: 1,
          fromXRem: -2,
          toXRem: 0,
          durationMs: COMIC_ANIM_MS,
        }),
        slideExit(ctaRowRef.current, {
          fromOpacity: 0,
          toOpacity: COMIC_CTA_REST_OPACITY,
          fromYRem: 1,
          toYRem: 0,
          durationMs: COMIC_ANIM_MS,
        }),
      ]);
      if (cancelled) return;
      onPresentEnd();
      exitingRef.current = false;
      setIsExiting(false);
    };
    void runExit();

    return () => {
      cancelled = true;
    };
  }, [contentRef, ctaRowRef, onPresentEnd, open, overlayRef, panelRef, present, reducedMotion]);

  return { isExiting, ctaEnterStarted, ctaEnterComplete };
}
