"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MAGIC_EXIT_COLLAPSE_MS } from "./consts/magicAnimationConsts";

type LabelRowExitOptions = {
  rootRef: RefObject<HTMLElement | null>;
  /** Parent-held exit: keep playing exit even if this instance remounts. */
  forceExiting: boolean;
  /** Class of the inner strip, measured when the root already reads 0px tall. */
  stripClassName: string;
  onExitComplete?: () => void;
};

function clearPinnedStyles(node: HTMLElement) {
  node.style.height = "";
  node.style.minHeight = "";
  node.style.marginBottom = "";
  node.style.transition = "";
  node.style.overflow = "";
  node.style.flexShrink = "";
}

/**
 * Deleted-row exit: lock the measured height (no transition), paint, then ease-in the height and
 * trailing list gap to 0 while boingOut plays. Notifies once on transition end or timeout.
 */
export function useLabelRowExit({ rootRef, forceExiting, stripClassName, onExitComplete }: LabelRowExitOptions) {
  const [exiting, setExiting] = useState(forceExiting);
  const [collapsing, setCollapsing] = useState(false);
  const exitNotifiedRef = useRef(false);
  const measuredExitHeightRef = useRef<number | null>(null);

  if (forceExiting && !exiting) setExiting(true);

  const notifyExitComplete = useCallback(() => {
    if (exitNotifiedRef.current) return;
    exitNotifiedRef.current = true;
    onExitComplete?.();
  }, [onExitComplete]);

  useEffect(() => {
    if (!exiting) {
      setCollapsing(false);
      measuredExitHeightRef.current = null;
      const node = rootRef.current;
      if (node) clearPinnedStyles(node);
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const strip = node.querySelector(`.${stripClassName}`) as HTMLElement | null;
    const liveHeight = node.getBoundingClientRect().height;
    // Keep first real measure across Strict Mode re-runs (second run sees height 0).
    if (measuredExitHeightRef.current == null || measuredExitHeightRef.current < 1) {
      if (liveHeight >= 1) {
        measuredExitHeightRef.current = liveHeight;
      } else if (strip) {
        const stripHeight = strip.getBoundingClientRect().height;
        if (stripHeight >= 1) measuredExitHeightRef.current = stripHeight;
      }
    }
    const fromHeight = measuredExitHeightRef.current ?? liveHeight;

    if (fromHeight < 1) {
      notifyExitComplete();
      return;
    }

    // Pin size without min-height:0 (that lets flex crush the row to 0 immediately).
    node.style.transition = "none";
    node.style.flexShrink = "0";
    node.style.overflow = "hidden";
    node.style.height = `${fromHeight}px`;
    node.style.marginBottom = "0px";
    void node.offsetHeight;

    setCollapsing(true);

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        node.style.transition = [
          `height ${MAGIC_EXIT_COLLAPSE_MS}ms ease-in`,
          `margin-bottom ${MAGIC_EXIT_COLLAPSE_MS}ms ease-in`,
        ].join(", ");
        node.style.height = "0px";
        node.style.marginBottom = "calc(-1 * var(--manage-label-list-gap, 2.25rem))";
      });
    });

    const onTransitionEnd = (event: Event) => {
      const te = event as globalThis.TransitionEvent;
      if (te.target !== node) return;
      if (te.propertyName !== "height") return;
      notifyExitComplete();
    };
    node.addEventListener("transitionend", onTransitionEnd);

    const fallback = window.setTimeout(() => {
      notifyExitComplete();
    }, MAGIC_EXIT_COLLAPSE_MS + 80);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [rootRef, exiting, stripClassName, notifyExitComplete]);

  return { exiting, collapsing, startExit: () => setExiting(true) };
}
