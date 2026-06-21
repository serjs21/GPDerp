import { animate } from "animejs";
import {
  createFlyPath,
  easeOutCubic,
  flyOpacityAt,
  quadBezier,
  seedFromRect,
  type FlyPath,
} from "./paperPlaneFlyPath";
import {
  FOLD_KEYFRAMES,
  INITIAL_PLANE_VARS,
  PAPER_PLANE_FLY_MS,
  type PaperPlaneVars,
} from "./paperPlaneExitKeyframes";

const CSS_VAR_KEYS: Record<keyof PaperPlaneVars, string> = {
  rotate: "--rotate",
  planeX: "--plane-x",
  planeY: "--plane-y",
  planeOpacity: "--plane-opacity",
  textOpacity: "--text-opacity",
  borderRadius: "--border-radius",
  leftWingFirstX: "--left-wing-first-x",
  leftWingFirstY: "--left-wing-first-y",
  leftWingSecondX: "--left-wing-second-x",
  leftWingSecondY: "--left-wing-second-y",
  leftWingThirdX: "--left-wing-third-x",
  leftWingThirdY: "--left-wing-third-y",
  leftBodyFirstX: "--left-body-first-x",
  leftBodyFirstY: "--left-body-first-y",
  leftBodySecondX: "--left-body-second-x",
  leftBodySecondY: "--left-body-second-y",
  leftBodyThirdX: "--left-body-third-x",
  leftBodyThirdY: "--left-body-third-y",
  rightWingFirstX: "--right-wing-first-x",
  rightWingFirstY: "--right-wing-first-y",
  rightWingSecondX: "--right-wing-second-x",
  rightWingSecondY: "--right-wing-second-y",
  rightWingThirdX: "--right-wing-third-x",
  rightWingThirdY: "--right-wing-third-y",
  rightBodyFirstX: "--right-body-first-x",
  rightBodyFirstY: "--right-body-first-y",
  rightBodySecondX: "--right-body-second-x",
  rightBodySecondY: "--right-body-second-y",
  rightBodyThirdX: "--right-body-third-x",
  rightBodyThirdY: "--right-body-third-y",
};

const PAGE_BACKGROUND_SELECTOR = "[data-paper-plane-background]";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function applyPaperPlaneVars(el: HTMLElement, vars: PaperPlaneVars): void {
  for (const key of Object.keys(CSS_VAR_KEYS) as (keyof PaperPlaneVars)[]) {
    el.style.setProperty(CSS_VAR_KEYS[key], String(vars[key]));
  }
}

function initFlyVars(sceneEl: HTMLElement): void {
  sceneEl.style.setProperty("--fly-x", "0");
  sceneEl.style.setProperty("--fly-y", "0");
  sceneEl.style.setProperty("--fly-scale", "1");
  sceneEl.style.setProperty("--fly-rotate-delta", "0");
  sceneEl.style.setProperty("--scene-opacity", "1");
}

function applyFlyVars(
  sceneEl: HTMLElement,
  flyX: number,
  flyY: number,
  flyScale: number,
  flyRotateDelta: number,
  sceneOpacity: number,
): void {
  sceneEl.style.setProperty("--fly-x", flyX.toFixed(2));
  sceneEl.style.setProperty("--fly-y", flyY.toFixed(2));
  sceneEl.style.setProperty("--fly-scale", flyScale.toFixed(4));
  sceneEl.style.setProperty("--fly-rotate-delta", flyRotateDelta.toFixed(2));
  sceneEl.style.setProperty("--scene-opacity", sceneOpacity.toFixed(3));
}

function darkenRgb(color: string, amount: number): string {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return color;
  const factor = 1 - amount;
  const r = Math.round(Number(match[1]) * factor);
  const g = Math.round(Number(match[2]) * factor);
  const b = Math.round(Number(match[3]) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

function samplePaperColors(contentEl: HTMLElement, sceneEl: HTMLElement): void {
  const sampleTarget =
    (contentEl.firstElementChild as HTMLElement | null) ?? contentEl;
  const bg = getComputedStyle(sampleTarget).backgroundColor;
  const wing = bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "rgb(212, 207, 192)";
  sceneEl.style.setProperty("--paper-wing", wing);
  sceneEl.style.setProperty("--paper-body", darkenRgb(wing, 0.08));
  sceneEl.style.setProperty("--paper-body-dark", darkenRgb(wing, 0.16));
}

function animatePartial(
  el: HTMLElement,
  model: PaperPlaneVars,
  to: Partial<PaperPlaneVars>,
  duration: number,
): { promise: Promise<void>; cancel: () => void } {
  const keys = Object.keys(to) as (keyof PaperPlaneVars)[];
  const target: Record<string, number> = {};
  for (const key of keys) {
    target[key] = to[key] as number;
  }

  let animation: { cancel: () => void } | null = null;

  const promise = new Promise<void>((resolve) => {
    animation = animate(model, {
      ...target,
      duration: Math.max(1, duration),
      ease: "inOutQuad",
      onUpdate: () => applyPaperPlaneVars(el, model),
      onComplete: () => resolve(),
    });
  });

  return {
    promise,
    cancel: () => animation?.cancel(),
  };
}

async function runFoldPhase(sceneEl: HTMLElement, contentEl: HTMLElement): Promise<void> {
  samplePaperColors(contentEl, sceneEl);
  initFlyVars(sceneEl);
  const model: PaperPlaneVars = { ...INITIAL_PLANE_VARS };
  applyPaperPlaneVars(sceneEl, model);

  const cancels: Array<() => void> = [];
  try {
    for (const step of FOLD_KEYFRAMES) {
      const { promise, cancel } = animatePartial(sceneEl, model, step.to, step.duration);
      cancels.push(cancel);
      await promise;
      if (step.setAfter) {
        Object.assign(model, step.setAfter);
        applyPaperPlaneVars(sceneEl, model);
      }
    }
  } finally {
    cancels.forEach((c) => c());
  }
}

function getFlyLayerHost(sceneEl: HTMLElement): HTMLElement {
  const pageRoot = sceneEl.closest("[data-page-root]");
  const fromPage = pageRoot?.querySelector(PAGE_BACKGROUND_SELECTOR);
  if (fromPage instanceof HTMLElement) return fromPage;

  const global = document.querySelector(PAGE_BACKGROUND_SELECTOR);
  if (global instanceof HTMLElement) return global;

  return document.body;
}

type FlyAttachment = {
  spacer: HTMLElement;
  originalParent: HTMLElement;
  originalNextSibling: ChildNode | null;
};

function pinSceneFlyBox(sceneEl: HTMLElement, rect: DOMRect): { width: number; height: number } {
  const width = sceneEl.offsetWidth;
  const height = sceneEl.offsetHeight;
  const left = rect.left + rect.width / 2 - width / 2;
  const top = rect.top + rect.height / 2 - height / 2;

  sceneEl.style.setProperty("--fly-aspect-w", String(width));
  sceneEl.style.setProperty("--fly-aspect-h", String(height));
  sceneEl.style.left = `${left}px`;
  sceneEl.style.top = `${top}px`;
  sceneEl.style.width = `${width}px`;
  sceneEl.style.height = `${height}px`;

  return { width, height };
}

function attachSceneToFlyLayer(sceneEl: HTMLElement, rect: DOMRect): FlyAttachment {
  const originalParent = sceneEl.parentElement;
  if (!originalParent) {
    throw new Error("PaperPlaneExit scene has no parent element");
  }

  const { width, height } = pinSceneFlyBox(sceneEl, rect);

  const spacer = document.createElement("div");
  spacer.setAttribute("aria-hidden", "true");
  spacer.style.width = `${width}px`;
  spacer.style.height = `${height}px`;
  spacer.style.flexShrink = "0";
  spacer.style.pointerEvents = "none";

  const originalNextSibling = sceneEl.nextSibling;
  originalParent.insertBefore(spacer, sceneEl);

  const host = getFlyLayerHost(sceneEl);
  host.appendChild(sceneEl);

  sceneEl.dataset.flying = "true";

  return { spacer, originalParent, originalNextSibling };
}

function detachSceneFromFlyLayer(sceneEl: HTMLElement, attachment: FlyAttachment): void {
  delete sceneEl.dataset.flying;
  sceneEl.style.removeProperty("left");
  sceneEl.style.removeProperty("top");
  sceneEl.style.removeProperty("width");
  sceneEl.style.removeProperty("height");
  sceneEl.style.removeProperty("--fly-aspect-w");
  sceneEl.style.removeProperty("--fly-aspect-h");

  if (attachment.originalNextSibling) {
    attachment.originalParent.insertBefore(sceneEl, attachment.originalNextSibling);
  } else {
    attachment.originalParent.appendChild(sceneEl);
  }

  attachment.spacer.remove();
}

type FlyProgressModel = { t: number };

function animateFlyTransform(
  sceneEl: HTMLElement,
  path: FlyPath,
): { promise: Promise<void>; cancel: () => void } {
  const model: FlyProgressModel = { t: 0 };
  let animation: { cancel: () => void } | null = null;

  const promise = new Promise<void>((resolve) => {
    animation = animate(model, {
      t: 1,
      duration: PAPER_PLANE_FLY_MS,
      ease: "linear",
      onUpdate: () => {
        const eased = easeOutCubic(model.t);
        const flyX = quadBezier(0, path.midX, path.endX, eased);
        const flyY = quadBezier(0, path.midY, path.endY, eased);
        const flyScale = 1 + (path.endScale - 1) * eased;
        const flyRotateDelta = path.rotateDelta * eased;
        const sceneOpacity = flyOpacityAt(eased);
        applyFlyVars(sceneEl, flyX, flyY, flyScale, flyRotateDelta, sceneOpacity);
      },
      onComplete: () => resolve(),
    });
  });

  return {
    promise,
    cancel: () => animation?.cancel(),
  };
}

export type PaperPlaneExitRun = {
  promise: Promise<void>;
  cancel: () => void;
};

export function runPaperPlaneExit(
  sceneEl: HTMLElement | null,
  contentEl: HTMLElement | null,
): PaperPlaneExitRun {
  if (!sceneEl || !contentEl) {
    return { promise: Promise.resolve(), cancel: () => {} };
  }

  if (prefersReducedMotion()) {
    return { promise: Promise.resolve(), cancel: () => {} };
  }

  let cancelled = false;
  let flyCancel: (() => void) | null = null;
  let flyAttachment: FlyAttachment | null = null;

  const promise = (async () => {
    sceneEl.dataset.exiting = "true";
    await runFoldPhase(sceneEl, contentEl);
    if (cancelled) return;

    const rect = sceneEl.getBoundingClientRect();
    flyAttachment = attachSceneToFlyLayer(sceneEl, rect);
    const path = createFlyPath(seedFromRect(rect));
    const fly = animateFlyTransform(sceneEl, path);
    flyCancel = () => {
      fly.cancel();
      if (flyAttachment) detachSceneFromFlyLayer(sceneEl, flyAttachment);
    };

    await fly.promise;
    if (cancelled) return;
  })().finally(() => {
    if (flyAttachment) {
      detachSceneFromFlyLayer(sceneEl, flyAttachment);
      flyAttachment = null;
    }
    delete sceneEl.dataset.exiting;
    delete sceneEl.dataset.flying;
  });

  return {
    promise,
    cancel: () => {
      cancelled = true;
      flyCancel?.();
      if (flyAttachment) {
        detachSceneFromFlyLayer(sceneEl, flyAttachment);
        flyAttachment = null;
      }
      delete sceneEl.dataset.exiting;
      delete sceneEl.dataset.flying;
    },
  };
}
