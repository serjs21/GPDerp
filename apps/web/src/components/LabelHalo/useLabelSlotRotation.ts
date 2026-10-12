"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type RefObject } from "react";
import { LABEL_SLOT_ROTATE_STEP_DEG, type LabelPlacement } from "./consts/labelHaloConsts";
import type { LabelSlotProps } from "./LabelSlot";
import { samePlacement } from "./utils/labelSlotUtils";

type LatestSlotProps = Pick<LabelSlotProps, "xPercent" | "yPercent" | "onPlacementCommit" | "onRotateDraft">;

/** Commit the current position + draft rotation unless it matches the last committed placement. */
function commitPlacementIfChanged(
  latestRef: RefObject<LatestSlotProps>,
  draftRotateRef: RefObject<number>,
  committedRef: RefObject<LabelPlacement>,
) {
  const latest = latestRef.current;
  const next: LabelPlacement = {
    xPercent: latest.xPercent,
    yPercent: latest.yPercent,
    rotateDeg: draftRotateRef.current,
  };
  if (samePlacement(committedRef.current, next)) return;
  committedRef.current = next;
  latest.onPlacementCommit?.(next);
}

type LabelSlotRotationOptions = Pick<
  LabelSlotProps,
  "xPercent" | "yPercent" | "rotateDeg" | "onPlacementCommit" | "onRotateDraft"
> & {
  disabled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
};

/**
 * Selection + rotation for one label slot: arrow keys / rotation-table drags update a draft angle,
 * and leaving the slot (blur, Escape, outside pointer down) commits the placement if it changed.
 */
export function useLabelSlotRotation({
  xPercent,
  yPercent,
  rotateDeg,
  onPlacementCommit,
  onRotateDraft,
  disabled,
  rootRef,
}: LabelSlotRotationOptions) {
  const draftRotateRef = useRef(rotateDeg);
  const latestRef = useRef<LatestSlotProps>({ xPercent, yPercent, onPlacementCommit, onRotateDraft });
  const committedRef = useRef<LabelPlacement>({ xPercent, yPercent, rotateDeg });
  const [draftRotateDeg, setDraftRotateDeg] = useState(rotateDeg);
  const [selected, setSelected] = useState(false);
  const [isRotateDragging, setIsRotateDragging] = useState(false);

  useLayoutEffect(() => {
    latestRef.current = { xPercent, yPercent, onPlacementCommit, onRotateDraft };
  }, [xPercent, yPercent, onPlacementCommit, onRotateDraft]);

  const [syncedRotateDeg, setSyncedRotateDeg] = useState(rotateDeg);
  if (syncedRotateDeg !== rotateDeg) {
    setSyncedRotateDeg(rotateDeg);
    setDraftRotateDeg(rotateDeg);
  }

  useEffect(() => {
    draftRotateRef.current = rotateDeg;
  }, [rotateDeg]);

  const commitIfChanged = () => commitPlacementIfChanged(latestRef, draftRotateRef, committedRef);

  const setDraft = (next: number) => {
    draftRotateRef.current = next;
    setDraftRotateDeg(next);
    latestRef.current.onRotateDraft?.(next);
  };

  const nudge = (delta: number) => {
    setDraft(draftRotateRef.current + delta);
    setSelected(true);
  };

  const blurSelection = () => {
    setSelected(false);
    setIsRotateDragging(false);
    commitIfChanged();
  };

  useEffect(() => {
    if (!selected && !isRotateDragging) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setSelected(false);
      setIsRotateDragging(false);
      commitPlacementIfChanged(latestRef, draftRotateRef, committedRef);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [selected, isRotateDragging, rootRef]);

  const select = () => {
    if (!disabled) setSelected(true);
  };

  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    blurSelection();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nudge(-LABEL_SLOT_ROTATE_STEP_DEG);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nudge(LABEL_SLOT_ROTATE_STEP_DEG);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      blurSelection();
      rootRef.current?.blur();
    }
  };

  const rotateTo = (next: number) => {
    setSelected(true);
    setIsRotateDragging(true);
    setDraft(next);
  };

  return {
    draftRotateDeg,
    selected,
    isRotateDragging,
    select,
    onFocusOut,
    onKeyDown,
    rotateTo,
    endRotateDrag: () => setIsRotateDragging(false),
  };
}
