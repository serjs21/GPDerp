"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { RotationTable } from "@/components/RotationTable";
import {
  LABEL_HALO_ROTATE_ICON_SRC,
  LABEL_SLOT_ROTATE_STEP_DEG,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import { type LabelHaloAnchor } from "./consts/labelHaloConnectionPoints";
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

function mergeRefs(
  ...refs: Array<((node: HTMLDivElement | null) => void) | { current: HTMLDivElement | null } | undefined>
) {
  return (node: HTMLDivElement | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    }
  };
}

function samePlacement(a: LabelPlacement, b: LabelPlacement) {
  return (
    a.xPercent === b.xPercent &&
    a.yPercent === b.yPercent &&
    a.rotateDeg === b.rotateDeg
  );
}

export function LabelSlot({
  id,
  name,
  color,
  shape,
  xPercent,
  yPercent,
  connection: _connection = "start",
  rotateDeg,
  onPlacementCommit,
  onRotateDraft,
  isDragging = false,
  active: activeProp,
  showRotateControl = true,
  disabled = false,
  className,
  style,
  rootRef: rootRefProp,
}: LabelSlotProps) {
  const t = useTranslations("LabelHalo.slot");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draftRotateRef = useRef(rotateDeg);
  const xPercentRef = useRef(xPercent);
  const yPercentRef = useRef(yPercent);
  xPercentRef.current = xPercent;
  yPercentRef.current = yPercent;
  const onPlacementCommitRef = useRef(onPlacementCommit);
  onPlacementCommitRef.current = onPlacementCommit;
  const onRotateDraftRef = useRef(onRotateDraft);
  onRotateDraftRef.current = onRotateDraft;
  const [draftRotateDeg, setDraftRotateDeg] = useState(rotateDeg);
  const [selected, setSelected] = useState(false);
  const [isRotateDragging, setIsRotateDragging] = useState(false);
  const committedRef = useRef<LabelPlacement>({ xPercent, yPercent, rotateDeg });

  useEffect(() => {
    draftRotateRef.current = rotateDeg;
    setDraftRotateDeg(rotateDeg);
  }, [rotateDeg]);

  const preset = resolveComicLabelShapePreset(shape);
  const controlsVisible =
    showRotateControl &&
    !isDragging &&
    (Boolean(activeProp) || selected || isRotateDragging);

  const commitIfChanged = () => {
    const next: LabelPlacement = {
      xPercent: xPercentRef.current,
      yPercent: yPercentRef.current,
      rotateDeg: draftRotateRef.current,
    };
    if (samePlacement(committedRef.current, next)) return;
    committedRef.current = next;
    onPlacementCommitRef.current?.(next);
  };

  const setDraft = (next: number) => {
    draftRotateRef.current = next;
    setDraftRotateDeg(next);
    onRotateDraftRef.current?.(next);
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

  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    blurSelection();
  };

  useEffect(() => {
    if (!selected && !isRotateDragging) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setSelected(false);
      setIsRotateDragging(false);
      commitIfChanged();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [selected, isRotateDragging]);

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

  const rotateControl = showRotateControl ? (
    <button
      type="button"
      className={styles.rotateControl}
      tabIndex={controlsVisible && !disabled ? 0 : -1}
      aria-label={t("rotateAriaLabel")}
      aria-hidden={!controlsVisible}
      disabled={disabled}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
      <img
        className={styles.rotateIcon}
        src={LABEL_HALO_ROTATE_ICON_SRC}
        alt=""
        draggable={false}
      />
    </button>
  ) : null;

  return (
    <div
      id={`label-slot-${id}`}
      ref={mergeRefs(rootRef, rootRefProp)}
      className={[
        styles.slot,
        controlsVisible ? styles.slotActive : "",
        isDragging ? styles.slotDragging : "",
        isRotateDragging ? styles.slotRotateDragging : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="group"
      tabIndex={disabled ? -1 : 0}
      aria-label={t("ariaLabel", { name, degrees: Math.round(draftRotateDeg) })}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) setSelected(true);
      }}
      onFocus={() => {
        if (!disabled) setSelected(true);
      }}
      onBlur={onFocusOut}
      onKeyDown={onKeyDown}
    >
      <RotationTable
        className={styles.rotationTable}
        degrees={draftRotateDeg}
        onDegreesChange={(next) => {
          setSelected(true);
          setIsRotateDragging(true);
          setDraft(next);
        }}
        onDegreesCommit={() => {
          setIsRotateDragging(false);
        }}
        transformOrigin="center center"
        applyTransform
        valueMode="relative"
        disabled={disabled || !showRotateControl}
        contentClassName={styles.rotateContent}
        control={rotateControl}
        stopPropagationOnControl
      >
        <div className={styles.burstWrap}>
          <ComicBurstLabel
            text={formatComicLabelText(name)}
            fill={color}
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
