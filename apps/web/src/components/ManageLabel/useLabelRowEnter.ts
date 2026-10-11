"use client";

import { useEffect, useState, type AnimationEvent, type RefObject } from "react";

type LabelRowEnterOptions = {
  rootRef: RefObject<HTMLElement | null>;
  animateEnter: boolean;
  enterDelayMs: number;
  labelId: string;
  onEnterAnimationEnd?: () => void;
};

/** boingInUp for newly added rows: scrolls the row into view when its staggered entrance starts. */
export function useLabelRowEnter({
  rootRef,
  animateEnter,
  enterDelayMs,
  labelId,
  onEnterAnimationEnd,
}: LabelRowEnterOptions) {
  const [entering, setEntering] = useState(animateEnter);
  const [enterKey, setEnterKey] = useState({ animateEnter, labelId });

  if (enterKey.animateEnter !== animateEnter || enterKey.labelId !== labelId) {
    setEnterKey({ animateEnter, labelId });
    if (animateEnter) setEntering(true);
  }

  useEffect(() => {
    if (!entering) return;
    const node = rootRef.current;
    if (!node) return;
    const delay = Math.max(0, enterDelayMs);
    const timer = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [rootRef, entering, enterDelayMs, labelId]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    const name = event.animationName;
    if (entering && (name.includes("boingInUp") || name.includes("manageLabelBoingIn"))) {
      setEntering(false);
      onEnterAnimationEnd?.();
    }
  };

  return { entering, handleAnimationEnd };
}
