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
  portal: HTMLElement;
  axis: "x" | "y";
  sign: 1 | -1;
  /** Entering label axis size — portal already matches final layout. */
  innSize: number;
  /** Exiting label axis size — extra travel after clearing inn. */
  outSize: number;
  innW: number;
  innH: number;
  slotId: LabelBeltSlotId;
};

function measureBurstSize(el: HTMLElement): { w: number; h: number } {
  const burst = el.querySelector("[data-comic-role='label']") as HTMLElement | null;
  const target = burst ?? el;
  return {
    w: target.offsetWidth || 48,
    h: target.offsetHeight || 28,
  };
}

/**
 * Incoming stays at 0 (final pose). Outgoing starts already pushed past the
 * incoming footprint, then travels further by its own size.
 */
function applyPortalFrame(motion: SlotMotion, t: number) {
  const { out, inn, portal, axis, sign, innSize, outSize, innW, innH } = motion;
  inn.style.transform = "";
  const outOff = sign * (innSize + t * outSize);
  if (axis === "x") {
    out.style.transform = `translate(${outOff}px, 0)`;
  } else {
    out.style.transform = `translate(0, ${outOff}px)`;
  }
  portal.style.width = `${innW}px`;
  portal.style.height = `${innH}px`;
}

function clippedLayerOverlap(out: HTMLElement, inn: HTMLElement, portal: HTMLElement): boolean {
  const clip = portal.getBoundingClientRect();
  const a = out.getBoundingClientRect();
  const b = inn.getBoundingClientRect();
  const left = Math.max(clip.left, a.left, b.left);
  const right = Math.min(clip.right, a.right, b.right);
  const top = Math.max(clip.top, a.top, b.top);
  const bottom = Math.min(clip.bottom, a.bottom, b.bottom);
  return right > left + 1 && bottom > top + 1;
}

function clearPortalFrame(refs: LabelBeltPortalLayerRefs) {
  if (refs.out) refs.out.style.transform = "";
  if (refs.inn) refs.inn.style.transform = "";
  const portal = refs.out?.parentElement ?? refs.inn?.parentElement;
  if (portal) {
    portal.style.width = "";
    portal.style.height = "";
  }
}

export type RunPortalOptions = {
  delta: 1 | -1;
  onProgress?: (t: number) => void;
  onComplete: () => void;
};

/**
 * Portal wipe where the entering label owns slot geometry from t=0.
 * Exiting label is offset by the entering footprint (no shared layout box → no snap).
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
    (options: RunPortalOptions) => {
      const { delta, onProgress, onComplete } = options;
      if (busyRef.current) return false;
      if (reduceMotion) {
        onProgress?.(1);
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
        const portal = refs.out.parentElement;
        if (!portal) continue;
        const axis = labelBeltPortalAxisForMove(fromId, slotId);
        const sign = labelBeltPortalTravelSign(slotId, delta);
        const outM = measureBurstSize(refs.out);
        const innM = measureBurstSize(refs.inn);
        const outSize = (axis === "y" ? outM.h : outM.w) + 8;
        const innSize = (axis === "y" ? innM.h : innM.w) + 8;
        motions.push({
          out: refs.out,
          inn: refs.inn,
          portal,
          axis,
          sign,
          innSize,
          outSize,
          innW: innM.w,
          innH: innM.h,
          slotId,
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
      onProgress?.(0);

      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "320659",
        },
        body: JSON.stringify({
          sessionId: "320659",
          runId: "post-fix4",
          hypothesisId: "H8-enter-owns-layout",
          location: "useLabelBeltPortalTransition.ts:t0",
          message: "inn owns portal; out pre-pushed by innSize",
          data: {
            delta,
            samples: motions.map((m) => ({
              slotId: m.slotId,
              sign: m.sign,
              innSize: m.innSize,
              outSize: m.outSize,
              outOff0: m.sign * m.innSize,
              portalW: m.innW,
              portalH: m.innH,
              clippedOverlap: clippedLayerOverlap(m.out, m.inn, m.portal),
            })),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const model = { t: 0 };
      let loggedMid = false;
      animRef.current = animate(model, {
        t: 1,
        duration: LABEL_BELT_PORTAL_MS,
        ease: "inOutQuad",
        onUpdate: () => {
          for (const motion of motions) {
            applyPortalFrame(motion, model.t);
          }
          onProgress?.(model.t);
          // #region agent log
          if (!loggedMid && model.t >= 0.45 && model.t <= 0.6) {
            loggedMid = true;
            const overlaps = motions.map((m) => ({
              slotId: m.slotId,
              clippedOverlap: clippedLayerOverlap(m.out, m.inn, m.portal),
              portalH: Math.round(m.portal.getBoundingClientRect().height),
              innH: m.innH,
              outOff: Math.round(m.sign * (m.innSize + model.t * m.outSize)),
            }));
            fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "320659",
              },
              body: JSON.stringify({
                sessionId: "320659",
                runId: "post-fix4",
                hypothesisId: "H8-enter-owns-layout",
                location: "useLabelBeltPortalTransition.ts:mid",
                message: "mid-wipe clipped overlap check",
                data: {
                  t: model.t,
                  anyOverlap: overlaps.some((o) => o.clippedOverlap),
                  overlaps,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
          }
          // #endregion
        },
        onComplete: () => {
          // #region agent log
          {
            const samples = motions.map((m) => {
              const portalRect = m.portal.getBoundingClientRect();
              const innRect = m.inn.getBoundingClientRect();
              return {
                slotId: m.slotId,
                styleMatch:
                  m.portal.style.width === `${m.innW}px` &&
                  m.portal.style.height === `${m.innH}px`,
                portalContentH: Math.round(portalRect.height),
                innContentH: Math.round(innRect.height),
                heightDelta: Math.round(portalRect.height - innRect.height),
                clippedOverlap: clippedLayerOverlap(m.out, m.inn, m.portal),
              };
            });
            fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "320659",
              },
              body: JSON.stringify({
                sessionId: "320659",
                runId: "post-fix4",
                hypothesisId: "H8-enter-owns-layout",
                location: "useLabelBeltPortalTransition.ts:t1",
                message: "before commit — portal still inn-sized",
                data: {
                  delta,
                  anyOverlap: samples.some((s) => s.clippedOverlap),
                  maxHeightDelta: Math.max(...samples.map((s) => Math.abs(s.heightDelta))),
                  samples,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
          }
          // #endregion
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
