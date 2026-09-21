"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import {
  LABEL_SLOT_ROTATE_STEP_DEG,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import styles from "./LabelSlot.module.css";

/** Horizontal pixels → degrees while dragging a rotation arrow. */
const ROTATE_DRAG_DEG_PER_PX = 0.5;
const ROTATE_DRAG_MOVE_THRESHOLD_PX = 3;

export type LabelSlotProps = {
  id: string;
  name: string;
  color: string;
  shape?: string;
  connectionPointId: string;
  rotateDeg: number;
  /** Called on focus out (and after connection-point drop via parent). */
  onPlacementCommit?: (placement: LabelPlacement) => void;
  isDragging?: boolean;
  /** When true, show rotation arrows (hover / focus / click / drag). */
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  setNodeRef?: Ref<HTMLDivElement>;
  dragListeners?: HTMLAttributes<HTMLElement>;
  dragAttributes?: HTMLAttributes<HTMLElement>;
};

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

type RotateDragSession = {
  pointerId: number;
  startX: number;
  startDeg: number;
  /** Click nudge direction when the pointer barely moves. */
  clickDelta: number;
  moved: boolean;
};

export function LabelSlot({
  id,
  name,
  color,
  shape,
  connectionPointId,
  rotateDeg,
  onPlacementCommit,
  isDragging = false,
  active: activeProp,
  disabled = false,
  className,
  style,
  setNodeRef,
  dragListeners,
  dragAttributes,
}: LabelSlotProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draftRotateRef = useRef(rotateDeg);
  const rotateDragRef = useRef<RotateDragSession | null>(null);
  const [draftRotateDeg, setDraftRotateDeg] = useState(rotateDeg);
  const [selected, setSelected] = useState(false);
  const [isRotateDragging, setIsRotateDragging] = useState(false);
  const committedRef = useRef({ connectionPointId, rotateDeg });

  useEffect(() => {
    draftRotateRef.current = rotateDeg;
    setDraftRotateDeg(rotateDeg);
    committedRef.current = { connectionPointId, rotateDeg };
  }, [connectionPointId, rotateDeg]);

  const preset = resolveComicLabelShapePreset(shape);
  const showArrows =
    Boolean(activeProp) || selected || isDragging || isRotateDragging;

  const commitIfChanged = () => {
    const next = {
      connectionPointId,
      rotateDeg: draftRotateRef.current,
    };
    const prev = committedRef.current;
    if (
      prev.connectionPointId === next.connectionPointId &&
      prev.rotateDeg === next.rotateDeg
    ) {
      return;
    }
    committedRef.current = next;
    onPlacementCommit?.(next);
  };

  const setDraft = (next: number) => {
    draftRotateRef.current = next;
    setDraftRotateDeg(next);
  };

  const nudge = (delta: number) => {
    setDraft(draftRotateRef.current + delta);
    setSelected(true);
  };

  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    setSelected(false);
    commitIfChanged();
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
    }
  };

  const onArrowPointerDown =
    (clickDelta: number) => (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      rotateDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startDeg: draftRotateRef.current,
        clickDelta,
        moved: false,
      };
      setSelected(true);
      setIsRotateDragging(true);
    };

  const onArrowPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = rotateDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) >= ROTATE_DRAG_MOVE_THRESHOLD_PX) {
      drag.moved = true;
    }
    setDraft(drag.startDeg + dx * ROTATE_DRAG_DEG_PER_PX);
  };

  const endArrowPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = rotateDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved) {
      nudge(drag.clickDelta);
    }
    rotateDragRef.current = null;
    setIsRotateDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      id={`label-slot-${id}`}
      ref={mergeRefs(rootRef, setNodeRef)}
      className={[
        styles.slot,
        showArrows ? styles.slotActive : "",
        isDragging ? styles.slotDragging : "",
        isRotateDragging ? styles.slotRotateDragging : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="group"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${name} label, ${Math.round(draftRotateDeg)} degrees`}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) setSelected(true);
      }}
      onFocus={() => {
        if (!disabled) setSelected(true);
      }}
      onBlur={onFocusOut}
      onKeyDown={onKeyDown}
      {...dragAttributes}
      {...dragListeners}
    >
      <div
        className={styles.burstWrap}
        style={{ transform: `rotate(${draftRotateDeg}deg)` }}
      >
        <ComicBurstLabel
          text={formatComicLabelText(name)}
          fill={color}
          shapeKind={preset.kind}
          spikeCount={preset.spikeCount}
          randomness={preset.randomness}
          seed={preset.id}
        />
      </div>
      <div className={styles.arrows} aria-hidden={!showArrows}>
        <button
          type="button"
          className={styles.arrowButton}
          tabIndex={showArrows && !disabled ? 0 : -1}
          aria-label="Rotate left — drag horizontally to adjust"
          disabled={disabled}
          onPointerDown={onArrowPointerDown(-LABEL_SLOT_ROTATE_STEP_DEG)}
          onPointerMove={onArrowPointerMove}
          onPointerUp={endArrowPointer}
          onPointerCancel={endArrowPointer}
        >
          ↺
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          tabIndex={showArrows && !disabled ? 0 : -1}
          aria-label="Rotate right — drag horizontally to adjust"
          disabled={disabled}
          onPointerDown={onArrowPointerDown(LABEL_SLOT_ROTATE_STEP_DEG)}
          onPointerMove={onArrowPointerMove}
          onPointerUp={endArrowPointer}
          onPointerCancel={endArrowPointer}
        >
          ↻
        </button>
      </div>
    </div>
  );
}
