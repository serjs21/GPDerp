"use client";

import { animate } from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  LABEL_BELT_RING_ORDER,
  labelBeltPortalAxisForMove,
  labelBeltPortalTravelSign,
  type LabelBeltSlotId,
} from "./labelBeltLayout";

export const LABEL_BELT_PORTAL_MS = 420;

type AnimLike = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

function stopAnim(anim: AnimLike | null) {
  if (!anim) return;
  try {
    anim.pause?.();
    anim.cancel?.();
    anim.revert?.();
  } catch {
    // ignore teardown races
  }
}

export type LabelBeltPortalLayerRefs = {
  out: HTMLElement | null;
  inn: HTMLElement | null;
};

type SlotMotion = {
  out: HTMLElement;
  inn: HTMLElement;
  axis: "x" | "y";
  sign: 1 | -1;
};

function applyPortalFrame(motion: SlotMotion, t: number) {
  const { out, inn, axis, sign } = motion;
  const outPct = sign * t * 100;
  const inPct = -sign * (1 - t) * 100;
  if (axis === "x") {
    out.style.transform = `translate(${outPct}%, 0)`;
    inn.style.transform = `translate(${inPct}%, 0)`;
  } else {
    out.style.transform = `translate(0, ${outPct}%)`;
    inn.style.transform = `translate(0, ${inPct}%)`;
  }
}

function clearPortalFrame(refs: LabelBeltPortalLayerRefs) {
  if (refs.out) refs.out.style.transform = "";
  if (refs.inn) refs.inn.style.transform = "";
}

/**
 * Dual-layer portal scroll for overflow rotation.
 * Shared `t` drives every slot so the portion leaving a source seam
 * matches the portion entering the target seam.
 */
export function useLabelBeltPortalTransition() {
  const reduceMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const animRef = useRef<AnimLike | null>(null);
  const layerRefs = useRef<Map<LabelBeltSlotId, LabelBeltPortalLayerRefs>>(new Map());

  useEffect(() => {
    return () => stopAnim(animRef.current);
  }, []);

  const setLayerRef = useCallback(
    (slotId: LabelBeltSlotId, layer: "out" | "inn", el: HTMLElement | null) => {
      const prev = layerRefs.current.get(slotId) ?? { out: null, inn: null };
      layerRefs.current.set(slotId, {
        ...prev,
        [layer === "out" ? "out" : "inn"]: el,
      });
    },
    [],
  );

  const runPortal = useCallback(
    (delta: 1 | -1, onComplete: () => void) => {
      if (busyRef.current) return false;
      if (reduceMotion) {
        onComplete();
        return true;
      }

      const motions: SlotMotion[] = [];
      for (let i = 0; i < LABEL_BELT_RING_ORDER.length; i += 1) {
        const slotId = LABEL_BELT_RING_ORDER[i]!;
        const fromIndex =
          (i + delta + LABEL_BELT_RING_ORDER.length) % LABEL_BELT_RING_ORDER.length;
        const fromId = LABEL_BELT_RING_ORDER[fromIndex]!;
        const refs = layerRefs.current.get(slotId);
        if (!refs?.out || !refs.inn) continue;
        const axis = labelBeltPortalAxisForMove(fromId, slotId);
        const sign = labelBeltPortalTravelSign(fromId, slotId);
        // #region agent log
        {
          const slotEl = refs.out.closest("[data-belt-slot]") as HTMLElement | null;
          const portalEl = refs.out.parentElement;
          const burst = refs.out.querySelector("[data-comic-role='label']") as HTMLElement | null;
          const rotateDeg = slotEl ? Number.parseFloat(slotEl.dataset.rotateDeg || "0") : NaN;
          fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "8e01e4",
            },
            body: JSON.stringify({
              sessionId: "8e01e4",
              runId: "post-fix",
              hypothesisId: "H1-H2",
              location: "useLabelBeltPortalTransition.ts:runPortal",
              message: "portal motion axis vs slot tilt",
              data: {
                slotId,
                fromId,
                axis,
                sign,
                rotateDeg,
                textAlignedAxis: Math.abs(rotateDeg) > 5 && axis === "x" ? "likely-along-text" : "ok-or-mid",
                expectPerpToText: axis === "y",
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          if (portalEl && burst) {
            const p = portalEl.getBoundingClientRect();
            const b = burst.getBoundingClientRect();
            const cs = getComputedStyle(portalEl);
            fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "8e01e4",
              },
              body: JSON.stringify({
                sessionId: "8e01e4",
                runId: "post-fix",
                hypothesisId: "H3-H4-H5",
                location: "useLabelBeltPortalTransition.ts:runPortal",
                message: "portal vs burst rects",
                data: {
                  slotId,
                  portalW: Math.round(p.width),
                  portalH: Math.round(p.height),
                  burstW: Math.round(b.width),
                  burstH: Math.round(b.height),
                  widthDelta: Math.round(b.width - p.width),
                  heightDelta: Math.round(b.height - p.height),
                  portalOverflow: cs.overflow,
                  portalMaxWidth: cs.maxWidth,
                  portalPadTop: cs.paddingTop,
                  portalPadLeft: cs.paddingLeft,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
          }
        }
        // #endregion
        motions.push({
          out: refs.out,
          inn: refs.inn,
          axis,
          sign,
        });
      }

      if (motions.length === 0) {
        onComplete();
        return true;
      }

      busyRef.current = true;
      setBusy(true);
      stopAnim(animRef.current);

      for (const motion of motions) {
        applyPortalFrame(motion, 0);
      }

      const model = { t: 0 };
      animRef.current = animate(model, {
        t: 1,
        duration: LABEL_BELT_PORTAL_MS,
        ease: "inOutQuad",
        onUpdate: () => {
          for (const motion of motions) {
            applyPortalFrame(motion, model.t);
          }
        },
        onComplete: () => {
          animRef.current = null;
          busyRef.current = false;
          setBusy(false);
          for (const refs of layerRefs.current.values()) {
            clearPortalFrame(refs);
          }
          onComplete();
        },
      });

      return true;
    },
    [reduceMotion],
  );

  return { busy, setLayerRef, runPortal };
}
