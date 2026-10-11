"use client";

import { useRef } from "react";
import type { DraggableLabelProps } from "./DraggableLabel.types";
import { LabelSlot } from "./LabelSlot";
import { PuffInWrap } from "./PuffInWrap";
import { useHaloDraggable } from "./useHaloDraggable";
import styles from "./LabelHalo.module.css";

/** A halo label positioned by percentage; draggable and rotatable when interactive. */
export function DraggableLabel({
  label,
  rotateDeg,
  isDragging,
  interactive,
  dropRef,
  outlineRef,
  onDragActiveChange,
  onPositionDraft,
  onRotateDraft,
  onPlacementCommit,
  puffDelayMs,
  onPuffEnd,
}: DraggableLabelProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const slotFocusRef = useRef<HTMLDivElement | null>(null);
  useHaloDraggable({
    interactive,
    labelId: label.id,
    rotateDeg,
    wrapRef,
    visualRef,
    slotFocusRef,
    dropRef,
    outlineRef,
    onDragActiveChange,
    onPositionDraft,
    onPlacementCommit,
  });

  return (
    <div
      ref={wrapRef}
      className={[styles.slotWrap, isDragging && styles.slotWrapDragging].filter(Boolean).join(" ")}
      style={{ left: `${label.xPercent}%`, top: `${label.yPercent}%` }}
    >
      <div ref={visualRef} className={styles.slotVisual}>
        <PuffInWrap delayMs={puffDelayMs} onPuffEnd={onPuffEnd}>
          <LabelSlot
            id={label.id}
            name={label.name}
            color={label.color}
            shape={label.shape}
            xPercent={label.xPercent}
            yPercent={label.yPercent}
            connection={label.connection ?? "start"}
            rotateDeg={rotateDeg}
            isDragging={isDragging}
            disabled={!interactive}
            showRotateControl={interactive}
            rootRef={(node) => {
              slotFocusRef.current = node;
            }}
            onRotateDraft={interactive ? (next) => onRotateDraft(label.id, next) : undefined}
            onPlacementCommit={interactive ? (placement) => onPlacementCommit(label.id, placement) : undefined}
          />
        </PuffInWrap>
      </div>
    </div>
  );
}
