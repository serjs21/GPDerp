"use client";

import { animate } from "animejs";
import { useEffect, useRef, type RefObject } from "react";
import { COVER_LABEL_MORPH_MS } from "./consts/dualityButtonConsts";
import {
  coverLabelArrowRestDeg,
  coverLabelArrowStartDeg,
  coverLabelTitlePushDeg,
} from "./utils/coverLabelArcUtils";

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

function setCuePose(
  cue: HTMLElement,
  arrowDeg: number,
  titleSpinDeg: number,
  arrowOpacity: number,
) {
  cue.style.setProperty("--arrow-angle", `${arrowDeg}deg`);
  cue.style.setProperty("--title-spin", `${titleSpinDeg}deg`);
  cue.style.setProperty("--arrow-opacity", String(arrowOpacity));
}

function setTitleOpacity(titleLine: HTMLElement | null, opacity: number) {
  if (!titleLine) return;
  titleLine.style.opacity = String(opacity);
}

function readCssDeg(el: HTMLElement, prop: string, fallback: number) {
  const raw = el.style.getPropertyValue(prop).trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function readCssNumber(el: HTMLElement, prop: string, fallback: number) {
  const raw = el.style.getPropertyValue(prop).trim();
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
  cue: HTMLElement | null,
  titleLine: HTMLElement | null,
  charCount: number,
) {
  if (!cue) return;
  const start = coverLabelArrowStartDeg(charCount);
  const rest = coverLabelArrowRestDeg();
  const push = coverLabelTitlePushDeg();
  setCuePose(
    cue,
    expanded ? rest : start,
    expanded ? push : 0,
    expanded ? 1 : 0,
  );
  setTitleOpacity(titleLine, expanded ? 0 : 1);
}

/**
 * Arrow and title share the face-centered arc. On open, the arrow fades in
 * while rotating from behind the title to rest; the title spins CW and fades
 * out over the same duration.
 */
export function useCoverLabelMorph(
  expanded: boolean,
  cueRef: RefObject<HTMLElement | null>,
  titleLineRef: RefObject<HTMLElement | null>,
  charCount: number,
  durationMs = COVER_LABEL_MORPH_MS,
  onSettled?: () => void,
) {
  const primedRef = useRef(false);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  useEffect(() => {
    const anims: AnimLike[] = [];
    const cue = cueRef.current;
    const titleLine = titleLineRef.current;
    const startDeg = coverLabelArrowStartDeg(charCount);
    const restDeg = coverLabelArrowRestDeg();
    const pushDeg = coverLabelTitlePushDeg();

    if (prefersReducedMotion()) {
      snap(expanded, cue, titleLine, charCount);
      primedRef.current = true;
      if (expanded) settledRef.current?.();
      return () => stopAll(anims);
    }

    if (!expanded && !primedRef.current) {
      snap(false, cue, titleLine, charCount);
      primedRef.current = true;
      return () => stopAll(anims);
    }

    primedRef.current = true;
    if (!cue) return () => stopAll(anims);

    const toExpanded = expanded;
    const arrowFrom = readCssDeg(
      cue,
      "--arrow-angle",
      toExpanded ? startDeg : restDeg,
    );
    const arrowTo = toExpanded ? restDeg : startDeg;
    const spinFrom = readCssDeg(
      cue,
      "--title-spin",
      toExpanded ? 0 : pushDeg,
    );
    const spinTo = toExpanded ? pushDeg : 0;
    const arrowOpFrom = readCssNumber(
      cue,
      "--arrow-opacity",
      toExpanded ? 0 : 1,
    );
    const arrowOpTo = toExpanded ? 1 : 0;
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
          setCuePose(
            cue,
            arrowFrom + (arrowTo - arrowFrom) * t,
            spinFrom + (spinTo - spinFrom) * t,
            arrowOpFrom + (arrowOpTo - arrowOpFrom) * t,
          );
          setTitleOpacity(
            titleLine,
            opacityFrom + (opacityTo - opacityFrom) * t,
          );
        },
        onComplete: () => {
          setCuePose(cue, arrowTo, spinTo, arrowOpTo);
          setTitleOpacity(titleLine, opacityTo);
          if (toExpanded) settledRef.current?.();
        },
      }),
    );

    return () => stopAll(anims);
  }, [charCount, cueRef, durationMs, expanded, titleLineRef]);
}
