"use client";

import { animate } from "animejs";
import { useEffect, useRef, useState } from "react";
import { STEPPED_TRANSITION } from "./steppedTransition.config";
import type {
  SteppedFadeMode,
  SteppedTransitionLayer,
  TransitionPose,
} from "./steppedTransitionTypes";

type Animatable = {
  pause?: () => void;
  cancel?: () => void;
};

function stopAnimation(animation: Animatable | null) {
  if (!animation) return;
  try {
    animation.pause?.();
    animation.cancel?.();
  } catch {
    // ignore teardown races
  }
}

function poseDistance(a: TransitionPose, b: TransitionPose): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function midpointPose(a: TransitionPose, b: TransitionPose): TransitionPose {
  return {
    progress: (a.progress + b.progress) / 2,
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    rotation: (a.rotation + b.rotation) / 2,
    scale: ((a.scale ?? 1) + (b.scale ?? 1)) / 2,
    opacity: Math.min(
      STEPPED_TRANSITION.smearOpacityCap,
      ((a.opacity ?? 1) + (b.opacity ?? 1)) / 2,
    ),
  };
}

function waitMs(ms: number, signal: { cancelled: boolean }): Promise<void> {
  if (ms <= 0 || signal.cancelled) return Promise.resolve();
  return new Promise((resolve) => {
    const id = window.setTimeout(() => {
      window.clearInterval(poll);
      resolve();
    }, ms);
    const poll = window.setInterval(() => {
      if (!signal.cancelled) return;
      window.clearTimeout(id);
      window.clearInterval(poll);
      resolve();
    }, 16);
  });
}

function animateOpacity(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number) => void,
  signal: { cancelled: boolean },
): { promise: Promise<void>; cancel: () => void } {
  const model = { t: from };
  let animation: Animatable | null = null;
  let settleTimer: number | null = null;
  let settled = false;

  const promise = new Promise<void>((resolve) => {
    if (signal.cancelled) {
      resolve();
      return;
    }

    const duration = Math.max(1, durationMs);
    const settle = () => {
      if (settled) return;
      settled = true;
      if (!signal.cancelled) onUpdate(to);
      resolve();
    };

    // Timeout guarantees completion under Jest fake timers even if Anime.js
    // does not advance its own clock.
    settleTimer = window.setTimeout(settle, duration);

    try {
      animation = animate(model, {
        t: to,
        duration,
        ease: "inOutQuad",
        onUpdate: () => {
          if (!signal.cancelled) onUpdate(model.t);
        },
        onComplete: () => {
          if (settleTimer != null) window.clearTimeout(settleTimer);
          settleTimer = null;
          settle();
        },
      }) as Animatable;
    } catch {
      onUpdate(from);
    }
  });

  return {
    promise,
    cancel: () => {
      stopAnimation(animation);
      if (settleTimer != null) window.clearTimeout(settleTimer);
      settleTimer = null;
    },
  };
}

export type UseSteppedTransitionOptions = {
  poses: TransitionPose[];
  active: boolean;
  holdMs?: number;
  crossfadeMs?: number;
  /** Default `crossfade`. Use `outThenCut` for stop-motion (fade out, then snap). */
  fadeMode?: SteppedFadeMode;
  reducedMotion?: boolean;
  onComplete?: () => void;
  /** Fired when a discrete pose hold begins (not during crossfade). */
  onPoseHold?: (poseIndex: number) => void;
};

function initialSoloLayers(
  poses: TransitionPose[],
  active: boolean,
): SteppedTransitionLayer[] {
  if (!active || poses.length === 0) return [];
  const solo = poses.length === 1;
  return [
    {
      pose: poses[0]!,
      opacity: 1,
      role: "solo",
      key: solo ? "solo-0" : "hold-0",
    },
  ];
}

/**
 * HOLD → CROSSFADE (opacity only) → COMMIT state machine.
 * Never spatially tweens between poses.
 */
export function useSteppedTransition(options: UseSteppedTransitionOptions): {
  layers: SteppedTransitionLayer[];
} {
  const {
    poses,
    active,
    holdMs = STEPPED_TRANSITION.holdMs,
    crossfadeMs = STEPPED_TRANSITION.crossfadeMs,
    fadeMode = "crossfade",
    reducedMotion = false,
    onComplete,
    onPoseHold,
  } = options;

  // Seed first pose synchronously so mount does not paint an empty frame
  // (idle→stepping swap would otherwise flash opacity 1→0→1).
  const [layers, setLayers] = useState<SteppedTransitionLayer[]>(() =>
    initialSoloLayers(poses, active),
  );
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onPoseHoldRef = useRef(onPoseHold);
  onPoseHoldRef.current = onPoseHold;
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    const signal = { cancelled: false };
    let opacityCancel: (() => void) | null = null;

    const finish = () => {
      if (signal.cancelled || completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    };

    if (!active || poses.length === 0) {
      setLayers([]);
      return;
    }

    if (poses.length === 1) {
      setLayers([
        { pose: poses[0]!, opacity: 1, role: "solo", key: "solo-0" },
      ]);
      finish();
      return;
    }

    const run = async () => {
      if (reducedMotion) {
        const first = poses[0]!;
        const last = poses[poses.length - 1]!;
        setLayers([
          { pose: first, opacity: 1, role: "outgoing", key: "rm-out" },
          { pose: last, opacity: 0, role: "incoming", key: "rm-in" },
        ]);
        const fade = animateOpacity(
          0,
          1,
          STEPPED_TRANSITION.reducedMotionCrossfadeMs,
          (t) => {
            if (signal.cancelled) return;
            setLayers([
              { pose: first, opacity: 1 - t, role: "outgoing", key: "rm-out" },
              { pose: last, opacity: t, role: "incoming", key: "rm-in" },
            ]);
          },
          signal,
        );
        opacityCancel = fade.cancel;
        await fade.promise;
        if (signal.cancelled) return;
        setLayers([{ pose: last, opacity: 1, role: "solo", key: "rm-end" }]);
        finish();
        return;
      }

      for (let i = 0; i < poses.length; i++) {
        if (signal.cancelled) return;
        const current = poses[i]!;
        setLayers([
          { pose: current, opacity: 1, role: "solo", key: `hold-${i}` },
        ]);
        onPoseHoldRef.current?.(i);

        if (i === poses.length - 1) {
          finish();
          return;
        }

        await waitMs(holdMs, signal);
        if (signal.cancelled) return;

        // Hard cut: skip opacity fade for instantaneous stop-motion.
        if (crossfadeMs <= 0) {
          continue;
        }

        // Fade out current pose fully, then snap to next on the following hold.
        if (fadeMode === "outThenCut") {
          setLayers([
            { pose: current, opacity: 1, role: "outgoing", key: `out-${i}` },
          ]);
          const fadeOut = animateOpacity(0, 1, crossfadeMs, (t) => {
            if (signal.cancelled) return;
            setLayers([
              {
                pose: current,
                opacity: 1 - t,
                role: "outgoing",
                key: `out-${i}`,
              },
            ]);
          }, signal);
          opacityCancel = fadeOut.cancel;
          await fadeOut.promise;
          opacityCancel = null;
          if (signal.cancelled) return;
          continue;
        }

        const next = poses[i + 1]!;
        const smear =
          poseDistance(current, next) >= STEPPED_TRANSITION.smearDistancePx
            ? midpointPose(current, next)
            : null;

        setLayers([
          { pose: current, opacity: 1, role: "outgoing", key: `out-${i}` },
          ...(smear
            ? [
                {
                  pose: smear,
                  opacity: 0,
                  role: "smear" as const,
                  key: `smear-${i}`,
                },
              ]
            : []),
          { pose: next, opacity: 0, role: "incoming", key: `in-${i}` },
        ]);

        const fade = animateOpacity(0, 1, crossfadeMs, (t) => {
          if (signal.cancelled) return;
          const smearOpacity = smear
            ? Math.sin(Math.PI * t) * STEPPED_TRANSITION.smearOpacityCap
            : 0;
          setLayers([
            { pose: current, opacity: 1 - t, role: "outgoing", key: `out-${i}` },
            ...(smear
              ? [
                  {
                    pose: smear,
                    opacity: smearOpacity,
                    role: "smear" as const,
                    key: `smear-${i}`,
                  },
                ]
              : []),
            { pose: next, opacity: t, role: "incoming", key: `in-${i}` },
          ]);
        }, signal);
        opacityCancel = fade.cancel;
        await fade.promise;
        opacityCancel = null;
        if (signal.cancelled) return;
      }
    };

    void run();

    return () => {
      signal.cancelled = true;
      opacityCancel?.();
    };
  }, [active, poses, holdMs, crossfadeMs, fadeMode, reducedMotion]);

  return { layers };
}
