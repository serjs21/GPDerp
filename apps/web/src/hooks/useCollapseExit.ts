"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseCollapseExitOptions = {
  ref: RefObject<HTMLElement | null>;
  exiting: boolean;
  durationMs: number;
  /** CSS length of the list gap below the row; collapsed via a negative margin. */
  listGap: string;
  onComplete: () => void;
};

/**
 * Pins the row at its measured height, then ease-in collapses height and the
 * trailing list gap to 0. Resetting `exiting` restores the row's styles.
 */
export function useCollapseExit({
  ref,
  exiting,
  durationMs,
  listGap,
  onComplete,
}: UseCollapseExitOptions): void {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!exiting) {
      node.style.height = "";
      node.style.marginBottom = "";
      node.style.transition = "";
      node.style.overflow = "";
      node.style.flexShrink = "";
      return;
    }

    let notified = false;
    const notify = () => {
      if (notified) return;
      notified = true;
      onCompleteRef.current();
    };

    const fromHeight = node.getBoundingClientRect().height;
    if (fromHeight < 1) {
      notify();
      return;
    }

    node.style.transition = "none";
    node.style.flexShrink = "0";
    node.style.overflow = "hidden";
    node.style.height = `${fromHeight}px`;
    node.style.marginBottom = "0px";
    void node.offsetHeight;

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        node.style.transition = [
          `height ${durationMs}ms ease-in`,
          `margin-bottom ${durationMs}ms ease-in`,
        ].join(", ");
        node.style.height = "0px";
        node.style.marginBottom = `calc(-1 * ${listGap})`;
      });
    });

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== node || event.propertyName !== "height") return;
      notify();
    };
    node.addEventListener("transitionend", onTransitionEnd);
    const fallback = window.setTimeout(notify, durationMs + 80);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [ref, exiting, durationMs, listGap]);
}
