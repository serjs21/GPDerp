import type { LabelPlacement } from "../consts/labelHaloConsts";
import styles from "../LabelSlot.module.css";

type SlotRef = ((node: HTMLDivElement | null) => void) | { current: HTMLDivElement | null } | undefined;

export function mergeRefs(...refs: SlotRef[]) {
  return (node: HTMLDivElement | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    }
  };
}

export function samePlacement(a: LabelPlacement, b: LabelPlacement) {
  return a.xPercent === b.xPercent && a.yPercent === b.yPercent && a.rotateDeg === b.rotateDeg;
}

/** Rotate control shows while the slot is selected/rotating (or parent-activated) and not being dragged. */
export function slotControlsVisible(params: {
  showRotateControl: boolean;
  isDragging: boolean;
  active: boolean | undefined;
  selected: boolean;
  isRotateDragging: boolean;
}): boolean {
  const engaged = Boolean(params.active) || params.selected || params.isRotateDragging;
  return params.showRotateControl && !params.isDragging && engaged;
}

export function labelSlotClassName(params: {
  controlsVisible: boolean;
  isDragging: boolean;
  isRotateDragging: boolean;
  className: string | undefined;
}): string {
  return [
    styles.slot,
    params.controlsVisible && styles.slotActive,
    params.isDragging && styles.slotDragging,
    params.isRotateDragging && styles.slotRotateDragging,
    params.className,
  ]
    .filter(Boolean)
    .join(" ");
}
