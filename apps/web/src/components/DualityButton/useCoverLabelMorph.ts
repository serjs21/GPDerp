"use client";

import { animate } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import { DUALITY_COVER_UNCOVER_MS } from "./consts/dualityButtonConsts";

type AnimLike = {
  pause?: () => void;
  cancel?: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function stopAnim(anim: AnimLike | null) {
  if (!anim) return;
  try {
    anim.pause?.();
    anim.cancel?.();
  } catch {
    // ignore teardown races
  }
}

function setRotateX(el: HTMLElement, deg: number) {
  el.style.transform = `rotateX(${deg}deg)`;
}

function readRotateX(el: HTMLElement, fallback: number) {
  const match = /rotateX\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform);
  return match ? Number(match[1]) : fallback;
}

function animateRotateX(
  el: HTMLElement | null,
  toDeg: number,
  fallbackFrom: number,
  durationMs: number,
  anims: AnimLike[],
  onComplete?: () => void,
) {
  if (!el) {
    onComplete?.();
    return;
  }
  const model = { t: 0 };
  const fromDeg = readRotateX(el, fallbackFrom);
  anims.push(
    animate(model, {
      t: 1,
      duration: durationMs,
      ease: "inOutSine",
      onUpdate: () => {
        setRotateX(el, fromDeg + (toDeg - fromDeg) * model.t);
      },
      onComplete: () => {
        setRotateX(el, toDeg);
        onComplete?.();
      },
    }),
  );
}

/**
 * Title exits via magic.css `rotateRight`; arrow flips in on rotateX.
 */
export function useCoverLabelMorph(
  expanded: boolean,
  arrowFaceRef: RefObject<HTMLElement | null>,
  durationMs = DUALITY_COVER_UNCOVER_MS,
  onSettled?: () => void,
) {
  const primedRef = useRef(false);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  useEffect(() => {
    const anims: AnimLike[] = [];
    const arrowFace = arrowFaceRef.current;

    if (prefersReducedMotion()) {
      if (arrowFace) setRotateX(arrowFace, expanded ? 0 : -90);
      primedRef.current = true;
      if (expanded) settledRef.current?.();
      return () => stopAnim(anims[0] ?? null);
    }

    if (!expanded && !primedRef.current) {
      if (arrowFace) setRotateX(arrowFace, -90);
      primedRef.current = true;
      return () => undefined;
    }

    primedRef.current = true;

    if (!expanded) {
      animateRotateX(arrowFace, -90, 0, durationMs * 0.55, anims);
      return () => {
        for (const a of anims) stopAnim(a);
      };
    }

    // Title rotateRight runs in CSS; arrow flips in over the same window.
    animateRotateX(arrowFace, 0, -90, durationMs, anims, () => {
      settledRef.current?.();
    });

    return () => {
      for (const a of anims) stopAnim(a);
    };
  }, [arrowFaceRef, durationMs, expanded]);
}
