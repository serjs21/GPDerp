"use client";

import { useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { RotationTable } from "@/components/RotationTable";
import { withDefaults } from "@/utils/props/withDefaults";
import type { LabelPlacement } from "./consts/labelHaloConsts";
import { type LabelHaloAnchor } from "./consts/labelHaloConnectionPoints";
import { LabelSlotRotateControl } from "./LabelSlotRotateControl";
import { useLabelSlotRotation } from "./useLabelSlotRotation";
import { labelSlotClassName, mergeRefs, slotControlsVisible } from "./utils/labelSlotUtils";
import styles from "./LabelSlot.module.css";

export type LabelSlotProps = {
  id: string;
  name: string;
  color: string;
  shape?: string;
  xPercent: number;
  yPercent: number;
  /** Which label edge is the rotate axis. */
  connection?: LabelHaloAnchor;
  rotateDeg: number;
  /** Called on focus out / outside click when placement changed. */
  onPlacementCommit?: (placement: LabelPlacement) => void;
  /** Live draft rotation (for drag preview). */
  onRotateDraft?: (rotateDeg: number) => void;
  isDragging?: boolean;
  /** When true, show rotation control (parent-driven). */
  active?: boolean;
  /** When false, never render/show the rotate control. */
  showRotateControl?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Ref to the slot root (anime.js createDraggable target). */
  rootRef?: (node: HTMLDivElement | null) => void;
};

const LABEL_SLOT_DEFAULTS = { isDragging: false, showRotateControl: true, disabled: false };

export function LabelSlot(props: LabelSlotProps) {
  const { id, name, isDragging, showRotateControl, disabled } = withDefaults(props, LABEL_SLOT_DEFAULTS);
  const t = useTranslations("LabelHalo.slot");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rotation = useLabelSlotRotation({
    xPercent: props.xPercent,
    yPercent: props.yPercent,
    rotateDeg: props.rotateDeg,
    onPlacementCommit: props.onPlacementCommit,
    onRotateDraft: props.onRotateDraft,
    disabled,
    rootRef,
  });
  const preset = resolveComicLabelShapePreset(props.shape);
  const controlsVisible = slotControlsVisible({
    showRotateControl,
    isDragging,
    active: props.active,
    selected: rotation.selected,
    isRotateDragging: rotation.isRotateDragging,
  });

  return (
    <div
      id={`label-slot-${id}`}
      ref={mergeRefs(rootRef, props.rootRef)}
      className={labelSlotClassName({
        controlsVisible,
        isDragging,
        isRotateDragging: rotation.isRotateDragging,
        className: props.className,
      })}
      style={props.style}
      role="group"
      tabIndex={disabled ? -1 : 0}
      aria-label={t("ariaLabel", { name, degrees: Math.round(rotation.draftRotateDeg) })}
      aria-disabled={disabled || undefined}
      onClick={rotation.select}
      onFocus={rotation.select}
      onBlur={rotation.onFocusOut}
      onKeyDown={rotation.onKeyDown}
    >
      <RotationTable
        className={styles.rotationTable}
        degrees={rotation.draftRotateDeg}
        onDegreesChange={rotation.rotateTo}
        onDegreesCommit={rotation.endRotateDrag}
        transformOrigin="center center"
        applyTransform
        valueMode="relative"
        disabled={disabled || !showRotateControl}
        contentClassName={styles.rotateContent}
        control={
          showRotateControl ? <LabelSlotRotateControl visible={controlsVisible} disabled={disabled} /> : null
        }
        stopPropagationOnControl
      >
        <div className={styles.burstWrap}>
          <ComicBurstLabel
            text={formatComicLabelText(name)}
            fill={props.color}
            shapeKind={preset.kind}
            spikeCount={preset.spikeCount}
            randomness={preset.randomness}
            seed={preset.id}
          />
        </div>
      </RotationTable>
    </div>
  );
}
