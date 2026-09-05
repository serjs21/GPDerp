"use client";

import { animate } from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  LABEL_BELT_RING_ORDER,
  labelBeltPortalTravelSign,
  type LabelBeltSlotId,
} from "./labelBeltLayout";

export const LABEL_BELT_PORTAL_MS = 420;
/** Must match `.portalStack { gap }` in LabelBelt.module.css */
export const LABEL_BELT_STACK_GAP_REM = 1;

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

type LabelBeltPortalLayerRefs = {
  out: HTMLElement | null;
  inn: HTMLElement | null;
  stack: HTMLElement | null;
};

type SlotMotion = {
  stack: HTMLElement;
  portal: HTMLElement;
  /** +1: inn above out, scroll from -(innH+gap) → 0. −1: out above inn, scroll from 0 → -(outH+gap). */
  sign: 1 | -1;
  outH: number;
  innH: number;
  innW: number;
  gap: number;
};

function measureBlock(el: HTMLElement): { w: number; h: number } {
  return {
    w: el.offsetWidth || 48,
    h: el.offsetHeight || 28,
  };
}

function remToPx(rem: number): number {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:1rem;visibility:hidden";
  document.body.appendChild(probe);
  const px = probe.offsetWidth || 16;
  probe.remove();
  return rem * px;
}

function stackTravel(sign: 1 | -1, outH: number, innH: number, gap: number) {
  const y0 = sign > 0 ? -(innH + gap) : 0;
  const y1 = sign > 0 ? 0 : -(outH + gap);
  return { y0, y1 };
}

/**
 * Stacked-block wipe: both labels are normal flow blocks; the portal clips.
 * At t=1 the entering block sits at the top of the clip — same pose as static.
 */
function applyStackFrame(motion: SlotMotion, t: number) {
  const { stack, portal, sign, outH, innH, innW, gap } = motion;
  const { y0, y1 } = stackTravel(sign, outH, innH, gap);
  const y = y0 + (y1 - y0) * t;
  stack.style.transform = `translate(0, ${y}px)`;
  // Clip window = entering label box (final static size).
  portal.style.width = `${innW}px`;
  portal.style.height = `${innH}px`;
}

function clearPortalInlineStyles(layerRefs: Map<LabelBeltSlotId, LabelBeltPortalLayerRefs>) {
  for (const refs of layerRefs.values()) {
    if (refs.stack) refs.stack.style.transform = "";
    const portal = refs.stack?.parentElement;
    if (portal) {
      portal.style.width = "";
      portal.style.height = "";
    }
  }
}

export type RunPortalOptions = {
  delta: 1 | -1;
  onProgress?: (t: number) => void;
  onComplete: () => void;
};

/**
 * Dual-label stacked scroll inside a clip sized to the entering label.
 * Entering block ends at the top of the portal — identical to idle layout.
 * Does not clear transforms on complete (avoids end blink); LabelBelt clears
 * after the idle commit in useLayoutEffect.
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
    (slotId: LabelBeltSlotId, layer: "out" | "inn" | "stack", el: HTMLElement | null) => {
      const prev = layerRefs.current.get(slotId) ?? { out: null, inn: null, stack: null };
      layerRefs.current.set(slotId, { ...prev, [layer]: el });
    },
    [],
  );

  const clearInlineStyles = useCallback(() => {
    clearPortalInlineStyles(layerRefs.current);
  }, []);

  const runPortal = useCallback(
    (options: RunPortalOptions) => {
      const { delta, onProgress, onComplete } = options;
      if (busyRef.current) return false;
      if (reduceMotion) {
        onProgress?.(1);
        onComplete();
        return true;
      }

      const gap = remToPx(LABEL_BELT_STACK_GAP_REM);
      const motions: SlotMotion[] = [];
      for (const slotId of LABEL_BELT_RING_ORDER) {
        const refs = layerRefs.current.get(slotId);
        if (!refs?.out || !refs.inn || !refs.stack) continue;
        const portal = refs.stack.parentElement;
        if (!portal) continue;
        const sign = labelBeltPortalTravelSign(slotId, delta);
        const outM = measureBlock(refs.out);
        const innM = measureBlock(refs.inn);
        motions.push({
          stack: refs.stack,
          portal,
          sign,
          outH: outM.h,
          innH: innM.h,
          innW: innM.w,
          gap,
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
        applyStackFrame(motion, 0);
      }
      onProgress?.(0);

      const model = { t: 0 };
      animRef.current = animate(model, {
        t: 1,
        duration: LABEL_BELT_PORTAL_MS,
        ease: "inOutQuad",
        onUpdate: () => {
          for (const motion of motions) {
            applyStackFrame(motion, model.t);
          }
          onProgress?.(model.t);
        },
        onComplete: () => {
          // Keep final stack pose until React idle commit; clearing here caused
          // sign=-1 to flash the outgoing label (transform snap back to 0).
          animRef.current = null;
          busyRef.current = false;
          setBusy(false);
          onComplete();
        },
      });

      return true;
    },
    [reduceMotion],
  );

  return { busy, setLayerRef, runPortal, clearInlineStyles };
}
