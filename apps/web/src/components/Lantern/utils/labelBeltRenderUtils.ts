import type { AnimationEvent, CSSProperties } from "react";
import { labelBeltStopInsetStyle, labelBeltStopTransformOrigin } from "../config";
import { labelBeltPortalTravelSign, type LabelBeltSlot } from "../labelBeltLayout";

export function labelBeltPuffStyle(puffDelayMs: number | undefined): CSSProperties | undefined {
  return puffDelayMs != null && puffDelayMs > 0 ? { animationDelay: `${puffDelayMs}ms` } : undefined;
}

/** Fires `onPuffEnd` only for the puffIn keyframes (not nested label animations). */
export function puffInEndHandler(onPuffEnd: () => void) {
  return (event: AnimationEvent<HTMLDivElement>) => {
    if (!event.animationName.includes("puffIn")) return;
    onPuffEnd();
  };
}

export function labelBeltSlotStyle(slot: LabelBeltSlot): CSSProperties {
  return {
    ...labelBeltStopInsetStyle(slot.stop),
    transform: `rotate(${slot.rotateDeg}deg)`,
    transformOrigin: labelBeltStopTransformOrigin(slot.side),
  } as CSSProperties;
}

/** +1 → inn above out (enter from top). −1 → out above inn (enter from bottom). Idle slots read +1. */
export function labelBeltSlotTravelSign(slotId: LabelBeltSlot["id"], transitionDelta: 1 | -1 | null): 1 | -1 {
  return transitionDelta ? labelBeltPortalTravelSign(slotId, transitionDelta) : 1;
}

/** Idle: just the outgoing block. Rotating: both keyed blocks, stacked in travel order. */
export function portalStackChildren<T>(out: T, inn: T | null, innFirst: boolean): T | T[] {
  if (inn == null) return out;
  return innFirst ? [inn, out] : [out, inn];
}
