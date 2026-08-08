import { LANTERN_EXIT_STOP_OPACITY, LANTERN_FLIGHT_PATH_REST_EPSILON } from "./lanternFlightPath.config";
import {
  getLanternFlightTransform,
  getVisibleLanternCount,
  lanternExitPathS,
  lanternInitialPathS,
  resolveLanternQueueSlot,
  sampleLanternFlightPath,
} from "./lanternFlightPath";
import { opacityAtPathS } from "./lanternFlightPathStops.config";
import type { LanternTransform } from "./lanternTransform";
import { easeInOutCubic } from "./lanternTransform";

export type AnimatedLanternQueueSlot = {
  journeyS?: number;
  pathS?: number;
  transform?: LanternTransform;
};

export const LANTERN_QUEUE_TRANSITION_MS = 500;

/** Normalized x for push-out off the left edge of the guide box. */
export const LANTERN_PUSH_OUT_TARGET_X = -0.14;

/** Normalized y for push-out toward the bottom-left corner. */
export const LANTERN_PUSH_OUT_TARGET_Y = 0;

export type LanternQueueAnimationPhase =
  | "idle"
  | "fadeToExit"
  | "pushOut"
  | "pullIn"
  | "fadeFromExit";

export type LanternQueueScrollState = {
  pushedOutCount: number;
  /** 0 = stop-1, 1 = stop-0 when resting between animations. */
  fadeProgress: number;
  phase: LanternQueueAnimationPhase;
  phaseT: number;
  animFromFade: number;
  animToFade: number;
  animStartTime: number | null;
};

export function createLanternQueueScrollState(): LanternQueueScrollState {
  return {
    pushedOutCount: 0,
    fadeProgress: 0,
    phase: "idle",
    phaseT: 0,
    animFromFade: 0,
    animToFade: 0,
    animStartTime: null,
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Scroll-linked fade progress for queue slot resolution (0 = stop-1, 1 = stop-0). */
export function getQueueScrollProgress(state: LanternQueueScrollState): number {
  if (state.phase === "idle") {
    return state.fadeProgress;
  }

  if (state.phase === "fadeToExit" || state.phase === "fadeFromExit") {
    return lerp(state.animFromFade, state.animToFade, state.phaseT);
  }

  return state.animFromFade;
}

export function getLanternPushOutTransform(t: number): LanternTransform {
  const exit = sampleLanternFlightPath(lanternExitPathS());
  const eased = easeInOutCubic(clamp01(t));

  return {
    x: lerp(exit.x, LANTERN_PUSH_OUT_TARGET_X, eased),
    y: lerp(exit.y, LANTERN_PUSH_OUT_TARGET_Y, eased),
    scale: exit.scale,
    rotate: exit.rotate,
    opacity: lerp(LANTERN_EXIT_STOP_OPACITY, 0, eased),
    positionMode: "percent",
  };
}

function startPhase(
  state: LanternQueueScrollState,
  phase: LanternQueueAnimationPhase,
  animFromFade: number,
  animToFade: number,
  now: number,
): LanternQueueScrollState {
  return {
    ...state,
    phase,
    phaseT: 0,
    animFromFade,
    animToFade,
    animStartTime: now,
  };
}

export function requestLanternQueueScrollStep(
  state: LanternQueueScrollState,
  direction: number,
  lanternCount: number,
  now: number = performance.now(),
): LanternQueueScrollState {
  if (lanternCount <= 0 || direction === 0 || state.phase !== "idle") {
    return state;
  }

  const maxPushedOut = Math.max(0, lanternCount - 1);

  if (direction > 0) {
    if (state.fadeProgress < 1 - LANTERN_FLIGHT_PATH_REST_EPSILON) {
      return startPhase(state, "fadeToExit", state.fadeProgress, 1, now);
    }

    if (state.pushedOutCount < maxPushedOut) {
      return startPhase(state, "pushOut", 1, 1, now);
    }

    return state;
  }

  if (state.pushedOutCount > 0 && state.fadeProgress <= LANTERN_FLIGHT_PATH_REST_EPSILON) {
    return {
      ...startPhase(
        { ...state, pushedOutCount: state.pushedOutCount - 1 },
        "pullIn",
        1,
        1,
        now,
      ),
    };
  }

  if (state.fadeProgress > LANTERN_FLIGHT_PATH_REST_EPSILON) {
    return startPhase(state, "fadeFromExit", state.fadeProgress, 0, now);
  }

  return state;
}

export function tickLanternQueueAnimation(
  state: LanternQueueScrollState,
  now: number,
): LanternQueueScrollState {
  if (state.phase === "idle" || state.animStartTime === null) {
    return state;
  }

  const linearT = clamp01((now - state.animStartTime) / LANTERN_QUEUE_TRANSITION_MS);

  if (linearT < 1) {
    return { ...state, phaseT: linearT };
  }

  const completed = (() => {
    switch (state.phase) {
      case "fadeToExit":
        return {
          ...state,
          fadeProgress: 1,
          phase: "idle" as const,
          phaseT: 0,
          animStartTime: null,
        };
      case "pushOut":
        return {
          ...state,
          fadeProgress: 0,
          pushedOutCount: state.pushedOutCount + 1,
          phase: "idle" as const,
          phaseT: 0,
          animStartTime: null,
        };
      case "pullIn":
        return {
          ...state,
          fadeProgress: 1,
          phase: "idle" as const,
          phaseT: 0,
          animStartTime: null,
        };
      case "fadeFromExit":
        return {
          ...state,
          fadeProgress: 0,
          phase: "idle" as const,
          phaseT: 0,
          animStartTime: null,
        };
      default:
        return { ...state, phase: "idle" as const, phaseT: 0, animStartTime: null };
    }
  })();

  // #region agent log
  if (typeof fetch !== "undefined") {
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
    body: JSON.stringify({
      sessionId: "a4f3b7",
      runId: "post-fix",
      hypothesisId: "H2",
      location: "lanternQueueExitAnimation.ts:tickLanternQueueAnimation",
      message: "queue animation phase completed",
      data: {
        fromPhase: state.phase,
        fadeProgress: completed.fadeProgress,
        pushedOutCount: completed.pushedOutCount,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  }
  // #endregion

  return completed;
}

function getNewestExitSlot(
  state: LanternQueueScrollState,
  lanternCount: number,
): AnimatedLanternQueueSlot | null {
  const visibleCount = getVisibleLanternCount(lanternCount, state.pushedOutCount);
  if (visibleCount <= 0) return null;

  const eased = easeInOutCubic(state.phaseT);
  const fadeT = state.phaseT;

  switch (state.phase) {
    case "fadeToExit": {
      const pathS = lerp(state.animFromFade, state.animToFade, fadeT);
      return { pathS };
    }
    case "pushOut":
      return { transform: getLanternPushOutTransform(eased) };
    case "pullIn":
      return { transform: getLanternPushOutTransform(1 - eased) };
    case "fadeFromExit": {
      const pathS = lerp(state.animFromFade, state.animToFade, fadeT);
      return { pathS };
    }
    default:
      if (state.fadeProgress <= LANTERN_FLIGHT_PATH_REST_EPSILON) {
        return null;
      }
      if (state.fadeProgress >= 1 - LANTERN_FLIGHT_PATH_REST_EPSILON) {
        return { pathS: lanternExitPathS() };
      }
      return { pathS: state.fadeProgress };
  }
}

export function resolveAnimatedQueueSlots(
  state: LanternQueueScrollState,
  lanternCount: number,
): Array<{ index: number; slot: AnimatedLanternQueueSlot }> {
  const visibleCount = getVisibleLanternCount(lanternCount, state.pushedOutCount);
  const newestIndex = Math.max(0, visibleCount - 1);
  const scrollProgress = getQueueScrollProgress(state);
  const newestExitSlot = getNewestExitSlot(state, lanternCount);
  const slots: Array<{ index: number; slot: AnimatedLanternQueueSlot }> = [];

  for (let index = 0; index < visibleCount; index += 1) {
    if (index === newestIndex && newestExitSlot) {
      slots.push({ index, slot: newestExitSlot });
      continue;
    }

    slots.push({
      index,
      slot: resolveLanternQueueSlot(scrollProgress, index, lanternCount, {
        visibleLanternCount: visibleCount,
      }),
    });
  }

  return slots;
}

/** Single-lantern exit slot for carousel departures (segment-0 fade / push-out). */
export function resolveSingleLanternExitSlot(
  state: LanternQueueScrollState,
): AnimatedLanternQueueSlot | null {
  const slots = resolveAnimatedQueueSlots(state, 1);
  return slots.at(-1)?.slot ?? null;
}

export function isLanternQueueSlotVisible(
  slot: AnimatedLanternQueueSlot,
  phase: LanternQueueAnimationPhase = "idle",
): boolean {
  if (phase === "fadeToExit" || phase === "fadeFromExit") {
    return true;
  }

  if (slot.transform) {
    if (phase === "pullIn" || phase === "pushOut") {
      return true;
    }
    return (slot.transform.opacity ?? 1) > 0.01;
  }

  if (slot.journeyS !== undefined) {
    return true;
  }

  const pathS = slot.pathS ?? lanternInitialPathS();
  return opacityAtPathS(pathS) > 0.01;
}
