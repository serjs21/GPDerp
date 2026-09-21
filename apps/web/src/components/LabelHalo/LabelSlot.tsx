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
  LABEL_HALO_ROTATE_ICON_SRC,
  LABEL_SLOT_ROTATE_STEP_DEG,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import {
  transformOriginForConnection,
  type LabelHaloAnchor,
} from "./consts/labelHaloConnectionPoints";
import styles from "./LabelSlot.module.css";

/** Horizontal pixels → degrees while dragging the rotation control. */
const ROTATE_DRAG_DEG_PER_PX = 0.5;
const ROTATE_DRAG_MOVE_THRESHOLD_PX = 3;

export type LabelSlotProps = {
  id: string;
  name: string;
  color: string;
  shape?: string;
  connectionPointId: string;
  /** Which label edge is the connection / rotate axis. */
  connection?: LabelHaloAnchor;
  rotateDeg: number;
  /** Called on focus out (and after connection-point drop via parent). */
  onPlacementCommit?: (placement: LabelPlacement) => void;
  isDragging?: boolean;
  /** When true, show rotation control (hover / focus / click / drag). */
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
  moved: boolean;
};

export function LabelSlot({
  id,
  name,
  color,
  shape,
  connectionPointId,
  connection = "start",
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
  const showControl =
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

  const onRotatePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    rotateDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startDeg: draftRotateRef.current,
      moved: false,
    };
    setSelected(true);
    setIsRotateDragging(true);
  };

  const onRotatePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = rotateDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) >= ROTATE_DRAG_MOVE_THRESHOLD_PX) {
      drag.moved = true;
    }
    setDraft(drag.startDeg + dx * ROTATE_DRAG_DEG_PER_PX);
  };

  const endRotatePointer = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = rotateDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved) {
      // Click: nudge in the outward direction for this connection.
      nudge(connection === "start" ? LABEL_SLOT_ROTATE_STEP_DEG : -LABEL_SLOT_ROTATE_STEP_DEG);
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
        showControl ? styles.slotActive : "",
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
        className={[
          styles.rotateWrap,
          connection === "end" ? styles.rotateWrapEnd : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          transform: `rotate(${draftRotateDeg}deg)`,
          transformOrigin: transformOriginForConnection(connection),
        }}
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
        <button
          type="button"
          className={styles.rotateControl}
          tabIndex={showControl && !disabled ? 0 : -1}
          aria-label="Rotate label — drag horizontally to adjust"
          aria-hidden={!showControl}
          disabled={disabled}
          onPointerDown={onRotatePointerDown}
          onPointerMove={onRotatePointerMove}
          onPointerUp={endRotatePointer}
          onPointerCancel={endRotatePointer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
          <img
            className={styles.rotateIcon}
            src={LABEL_HALO_ROTATE_ICON_SRC}
            alt=""
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
}
