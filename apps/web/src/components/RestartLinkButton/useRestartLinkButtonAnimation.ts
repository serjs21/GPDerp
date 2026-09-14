"use client";

import { animate } from "animejs";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

const TEXT_MS = 220;
const CHAR_STAGGER_MS = 22;
const HIPOINTS_MS = 300;
const EMBLEM_MS = 200;
const BANNER_MS = 180;

type AnimLike = {
  pause?: () => void;
  cancel?: () => void;
};

export type RestartLinkButtonAnimationRefs = {
  idleChars: RefObject<HTMLElement | null>;
  hoverChars: RefObject<HTMLElement | null>;
  hipoints: RefObject<HTMLElement | null>;
  filterIcon: RefObject<HTMLElement | null>;
  reviveLockup: RefObject<HTMLElement | null>;
  reviveBanner: RefObject<HTMLElement | null>;
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
  return Array.from(line.querySelectorAll<HTMLElement>("[data-restart-char]"));
}

function setRotateX(el: HTMLElement, deg: number) {
  el.style.transform = `rotateX(${deg}deg)`;
}

function setChars(line: HTMLElement | null, deg: number) {
  for (const el of charsOf(line)) setRotateX(el, deg);
}

function readRotateX(el: HTMLElement, fallback: number) {
  const match = /rotateX\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform);
  return match ? Number(match[1]) : fallback;
}

function animateChars(
  line: HTMLElement | null,
  toDeg: number,
  fallbackFrom: number,
  anims: AnimLike[],
) {
  const chars = charsOf(line);
  chars.forEach((el, i) => {
    const model = { t: 0 };
    const fromDeg = readRotateX(el, fallbackFrom);
    anims.push(
      animate(model, {
        t: 1,
        duration: TEXT_MS,
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

function setHipoints(el: HTMLElement | null, percent: number) {
  if (!el) return;
  el.style.transform = `translateY(${percent}%)`;
}

function setFilter(el: HTMLElement | null, opacity: number, scale: number) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.transform = `scale(${scale})`;
}

function setLockup(el: HTMLElement | null, opacity: number, scale: number) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function setBanner(el: HTMLElement | null, opacity: number, scale: number) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.setProperty("--revive-banner-scale", String(scale));
}

function snap(expanded: boolean, refs: RestartLinkButtonAnimationRefs) {
  const hasRevive = Boolean(refs.reviveLockup.current);
  setChars(refs.idleChars.current, expanded ? 90 : 0);
  setChars(refs.hoverChars.current, expanded ? 0 : -90);
  setHipoints(refs.hipoints.current, expanded ? 0 : 100);
  setFilter(refs.filterIcon.current, expanded && hasRevive ? 0 : 1, expanded && hasRevive ? 0.6 : 1);
  setLockup(refs.reviveLockup.current, expanded ? 1 : 0, expanded ? 1 : 0.72);
  setBanner(refs.reviveBanner.current, expanded ? 1 : 0, expanded ? 1 : 0.86);
}

function tweenNumber(
  from: number,
  to: number,
  duration: number,
  delay: number,
  apply: (value: number) => void,
  anims: AnimLike[],
) {
  const model = { t: 0 };
  apply(from);
  anims.push(
    animate(model, {
      t: 1,
      duration,
      delay,
      ease: "inOutSine",
      onUpdate: () => {
        apply(from + (to - from) * model.t);
      },
      onComplete: () => {
        apply(to);
      },
    }),
  );
}

function readPercent(el: HTMLElement | null, fallback: number) {
  if (!el) return fallback;
  const match = /translateY\((-?\d+(?:\.\d+)?)%\)/.exec(el.style.transform);
  return match ? Number(match[1]) : fallback;
}

function readOpacity(el: HTMLElement | null, fallback: number) {
  if (!el || el.style.opacity === "") return fallback;
  const value = Number(el.style.opacity);
  return Number.isFinite(value) ? value : fallback;
}

function playHipoints(
  expanded: boolean,
  el: HTMLElement | null,
  anims: AnimLike[],
) {
  if (!el) return;
  tweenNumber(
    readPercent(el, expanded ? 100 : 0),
    expanded ? 0 : 100,
    HIPOINTS_MS,
    0,
    (value) => setHipoints(el, value),
    anims,
  );
}

function playRevive(
  expanded: boolean,
  filter: HTMLElement | null,
  lockup: HTMLElement | null,
  banner: HTMLElement | null,
  anims: AnimLike[],
) {
  if (!lockup || !filter) return;
  tweenNumber(
    readOpacity(filter, expanded ? 1 : 0),
    expanded ? 0 : 1,
    EMBLEM_MS,
    expanded ? 0 : 80,
    (v) => setFilter(filter, v, 0.6 + 0.4 * v),
    anims,
  );
  tweenNumber(
    readOpacity(lockup, expanded ? 0 : 1),
    expanded ? 1 : 0,
    EMBLEM_MS,
    40,
    (v) => setLockup(lockup, v, 0.72 + 0.28 * v),
    anims,
  );
  tweenNumber(
    readOpacity(banner, expanded ? 0 : 1),
    expanded ? 1 : 0,
    BANNER_MS,
    expanded ? 120 : 0,
    (v) => setBanner(banner, v, 0.86 + 0.14 * v),
    anims,
  );
}

function play(expanded: boolean, refs: RestartLinkButtonAnimationRefs, anims: AnimLike[]) {
  animateChars(refs.idleChars.current, expanded ? 90 : 0, expanded ? 0 : 90, anims);
  animateChars(refs.hoverChars.current, expanded ? 0 : -90, expanded ? -90 : 0, anims);
  playHipoints(expanded, refs.hipoints.current, anims);
  playRevive(
    expanded,
    refs.filterIcon.current,
    refs.reviveLockup.current,
    refs.reviveBanner.current,
    anims,
  );
}

export function useRestartLinkButtonAnimation(
  expanded: boolean,
  enabled: boolean,
  refs: RestartLinkButtonAnimationRefs,
  resetKey: string,
  startExpanded = false,
) {
  const primedRef = useRef(false);

  useLayoutEffect(() => {
    snap(startExpanded, refs);
    primedRef.current = startExpanded;
  }, [refs, resetKey, startExpanded]);

  useEffect(() => {
    const anims: AnimLike[] = [];
    if (!enabled) {
      snap(false, refs);
      primedRef.current = false;
      return () => stopAll(anims);
    }
    if (prefersReducedMotion()) {
      snap(expanded, refs);
      primedRef.current = true;
      return () => stopAll(anims);
    }
    if (!expanded && !primedRef.current) {
      snap(false, refs);
      primedRef.current = true;
      return () => stopAll(anims);
    }
    primedRef.current = true;
    play(expanded, refs, anims);
    return () => stopAll(anims);
  }, [enabled, expanded, refs, resetKey]);
}
