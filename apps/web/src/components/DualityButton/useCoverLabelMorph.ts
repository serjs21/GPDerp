"use client";

import { animate } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import { COVER_LABEL_MORPH_MS } from "./consts/dualityButtonConsts";

/** How far the title is pushed radially outward (rem) as the arrow rises. */
const TITLE_PUSH_REM = 0.85;

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

function setArrowRotateX(el: HTMLElement, deg: number) {
  el.style.transform = `rotateX(${deg}deg)`;
}

function readArrowRotateX(el: HTMLElement, fallback: number) {
  const match = /rotateX\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform);
  return match ? Number(match[1]) : fallback;
}

function setTitlePose(el: HTMLElement, pushRem: number, opacity: number) {
  el.style.setProperty("--title-push", `${pushRem}rem`);
  el.style.opacity = String(opacity);
}

function readTitlePush(el: HTMLElement, fallback: number) {
  const raw = el.style.getPropertyValue("--title-push").trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function readOpacity(el: HTMLElement, fallback: number) {
  const raw = el.style.opacity;
  if (raw === "") return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function snap(
  expanded: boolean,
  titleLine: HTMLElement | null,
  arrowFace: HTMLElement | null,
) {
  if (titleLine) {
    setTitlePose(titleLine, expanded ? TITLE_PUSH_REM : 0, expanded ? 0 : 1);
  }
  if (arrowFace) setArrowRotateX(arrowFace, expanded ? 0 : -90);
}

/**
 * Arrow rises on its rotateX hinge from behind the title, pushing the title
 * radially outward while the title fades.
 */
export function useCoverLabelMorph(
  expanded: boolean,
  titleLineRef: RefObject<HTMLElement | null>,
  arrowFaceRef: RefObject<HTMLElement | null>,
  durationMs = COVER_LABEL_MORPH_MS,
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

    const toExpanded = expanded;
    const arrowFrom = arrowFace
      ? readArrowRotateX(arrowFace, toExpanded ? -90 : 0)
      : toExpanded
        ? -90
        : 0;
    const arrowTo = toExpanded ? 0 : -90;
    const pushFrom = titleLine
      ? readTitlePush(titleLine, toExpanded ? 0 : TITLE_PUSH_REM)
      : toExpanded
        ? 0
        : TITLE_PUSH_REM;
    const pushTo = toExpanded ? TITLE_PUSH_REM : 0;
    const opacityFrom = titleLine
      ? readOpacity(titleLine, toExpanded ? 1 : 0)
      : toExpanded
        ? 1
        : 0;
    const opacityTo = toExpanded ? 0 : 1;

    const model = { t: 0 };
    anims.push(
      animate(model, {
        t: 1,
        duration: durationMs,
        ease: "inOutSine",
        onUpdate: () => {
          const t = model.t;
          if (arrowFace) {
            setArrowRotateX(arrowFace, arrowFrom + (arrowTo - arrowFrom) * t);
          }
          if (titleLine) {
            setTitlePose(
              titleLine,
              pushFrom + (pushTo - pushFrom) * t,
              opacityFrom + (opacityTo - opacityFrom) * t,
            );
          }
        },
        onComplete: () => {
          if (arrowFace) setArrowRotateX(arrowFace, arrowTo);
          if (titleLine) setTitlePose(titleLine, pushTo, opacityTo);
          if (toExpanded) settledRef.current?.();
        },
      }),
    );

    return () => stopAll(anims);
  }, [arrowFaceRef, durationMs, expanded, titleLineRef]);
}
