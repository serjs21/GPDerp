"use client";

import { animate } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import { DUALITY_COVER_UNCOVER_MS } from "./consts/dualityButtonConsts";

const CHAR_STAGGER_MS = 22;

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

function stopAll(anims: AnimLike[]) {
  for (const anim of anims) stopAnim(anim);
}

function charsOf(line: HTMLElement | null): HTMLElement[] {
  if (!line) return [];
  return Array.from(line.querySelectorAll<HTMLElement>("[data-cover-char]"));
}

function setRotateX(el: HTMLElement, deg: number) {
  el.style.transform = `rotateX(${deg}deg)`;
}

function readRotateX(el: HTMLElement, fallback: number) {
  const match = /rotateX\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform);
  return match ? Number(match[1]) : fallback;
}

function animateChars(
  line: HTMLElement | null,
  toDeg: number,
  fallbackFrom: number,
  durationMs: number,
  anims: AnimLike[],
) {
  const chars = charsOf(line);
  chars.forEach((el, i) => {
    const model = { t: 0 };
    const fromDeg = readRotateX(el, fallbackFrom);
    anims.push(
      animate(model, {
        t: 1,
        duration: durationMs,
        delay: i * CHAR_STAGGER_MS,
        ease: "inOutSine",
        onUpdate: () => {
          setRotateX(el, fromDeg + (toDeg - fromDeg) * model.t);
        },
        onComplete: () => {
          setRotateX(el, toDeg);
        },
      }),
    );
  });
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

function snap(
  expanded: boolean,
  titleLine: HTMLElement | null,
  arrowFace: HTMLElement | null,
) {
  for (const el of charsOf(titleLine)) {
    setRotateX(el, expanded ? 90 : 0);
  }
  if (arrowFace) setRotateX(arrowFace, expanded ? 0 : -90);
}

/**
 * RestartLinkButton-style rotateX flip: title chars out, arrow face in.
 */
export function useCoverLabelMorph(
  expanded: boolean,
  titleLineRef: RefObject<HTMLElement | null>,
  arrowFaceRef: RefObject<HTMLElement | null>,
  durationMs = DUALITY_COVER_UNCOVER_MS,
  onSettled?: () => void,
) {
  const primedRef = useRef(false);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  useEffect(() => {
    const anims: AnimLike[] = [];
    const titleLine = titleLineRef.current;
    const arrowFace = arrowFaceRef.current;

    if (prefersReducedMotion()) {
      snap(expanded, titleLine, arrowFace);
      primedRef.current = true;
      if (expanded) settledRef.current?.();
      return () => stopAll(anims);
    }

    if (!expanded && !primedRef.current) {
      snap(false, titleLine, arrowFace);
      primedRef.current = true;
      return () => stopAll(anims);
    }

    primedRef.current = true;

    if (!expanded) {
      animateChars(titleLine, 0, 90, durationMs * 0.55, anims);
      animateRotateX(arrowFace, -90, 0, durationMs * 0.55, anims);
      return () => stopAll(anims);
    }

    animateChars(titleLine, 90, 0, durationMs * 0.55, anims);
    animateRotateX(arrowFace, 0, -90, durationMs * 0.55, anims, () => {
      settledRef.current?.();
    });

    return () => stopAll(anims);
  }, [arrowFaceRef, durationMs, expanded, titleLineRef]);
}
