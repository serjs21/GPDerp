"use client";

import { createDraggable } from "animejs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import {
  LABEL_HALO_DROP_PAD_REM,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import { LabelSlot } from "./LabelSlot";
import {
  clearDropAreaRoughOutline,
  paintDropAreaRoughOutline,
} from "./utils/dropAreaRoughOutline";
import styles from "./LabelHalo.module.css";

export type LabelHaloProps = {
  labels: LabelHaloLabelItem[];
  /** Lantern (or other) content centered inside the padded drop area. */
  children?: ReactNode;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the halo region. */
  ariaLabel?: string;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function percentFromRect(
  el: HTMLElement,
  container: HTMLElement,
): { xPercent: number; yPercent: number } {
  const elRect = el.getBoundingClientRect();
  const box = container.getBoundingClientRect();
  const width = Math.max(1, box.width);
  const height = Math.max(1, box.height);
  const cx = elRect.left + elRect.width / 2 - box.left;
  const cy = elRect.top + elRect.height / 2 - box.top;
  return {
    xPercent: clampPercent((cx / width) * 100),
    yPercent: clampPercent((cy / height) * 100),
  };
}

type DraggableLabelProps = {
  label: LabelHaloLabelItem;
  rotateDeg: number;
  isDragging: boolean;
  dropRef: RefObject<HTMLDivElement | null>;
  outlineRef: RefObject<SVGSVGElement | null>;
  onDragActiveChange: (labelId: string, active: boolean) => void;
  onPositionDraft: (labelId: string, xPercent: number, yPercent: number) => void;
  onRotateDraft: (labelId: string, rotateDeg: number) => void;
  onPlacementCommit: (labelId: string, placement: LabelPlacement) => void;
};

function DraggableLabel({
  label,
  rotateDeg,
  isDragging,
  dropRef,
  outlineRef,
  onDragActiveChange,
  onPositionDraft,
  onRotateDraft,
  onPlacementCommit,
}: DraggableLabelProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const slotFocusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = wrapRef.current;
    const container = dropRef.current;
    if (!target || !container) return;

    const bakePosition = (draggable: { setX: (x: number, mute?: boolean) => void; setY: (y: number, mute?: boolean) => void }) => {
      const drop = dropRef.current;
      if (!drop) return;
      const next = percentFromRect(target, drop);
      target.style.left = `${next.xPercent}%`;
      target.style.top = `${next.yPercent}%`;
      draggable.setX(0, true);
      draggable.setY(0, true);
      onPositionDraft(label.id, next.xPercent, next.yPercent);
      return next;
    };

    const instance = createDraggable(target, {
      container,
      dragThreshold: 6,
      releaseStiffness: 0,
      releaseDamping: 0,
      onGrab: () => {
        onDragActiveChange(label.id, true);
        const svg = outlineRef.current;
        if (svg) paintDropAreaRoughOutline(svg);
        slotFocusRef.current?.focus({ preventScroll: true });
      },
      onRelease: () => {
        bakePosition(instance);
      },
      onSettle: () => {
        bakePosition(instance);
        onDragActiveChange(label.id, false);
      },
    });

    return () => {
      instance.revert();
    };
  }, [dropRef, outlineRef, label.id, onDragActiveChange, onPositionDraft]);

  return (
    <div
      ref={wrapRef}
      className={[styles.slotWrap, isDragging ? styles.slotWrapDragging : ""]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${label.xPercent}%`,
        top: `${label.yPercent}%`,
      }}
    >
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
        rootRef={(node) => {
          slotFocusRef.current = node;
        }}
        onRotateDraft={(next) => onRotateDraft(label.id, next)}
        onPlacementCommit={(placement) => onPlacementCommit(label.id, placement)}
      />
    </div>
  );
}

export function LabelHalo({
  labels,
  children,
  onPlacementCommit,
  className,
  style,
  ariaLabel = "Label halo",
}: LabelHaloProps) {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<SVGSVGElement | null>(null);
  const activeDragIdsRef = useRef<Set<string>>(new Set());

  const [draft, setDraft] = useState<LabelHaloLabelItem[]>(labels);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [rotateById, setRotateById] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const label of labels) map[label.id] = label.rotateDeg;
    return map;
  });

  useEffect(() => {
    setDraft(labels);
    setRotateById((prev) => {
      const next = { ...prev };
      for (const label of labels) {
        if (next[label.id] == null) next[label.id] = label.rotateDeg;
      }
      return next;
    });
  }, [labels]);

  const onPositionDraft = useCallback((labelId: string, xPercent: number, yPercent: number) => {
    setDraft((current) =>
      current.map((label) =>
        label.id === labelId ? { ...label, xPercent, yPercent } : label,
      ),
    );
  }, []);

  const onDragActiveChange = useCallback((labelId: string, active: boolean) => {
    const set = activeDragIdsRef.current;
    if (active) set.add(labelId);
    else set.delete(labelId);
    setDraggingId(active ? labelId : set.size ? [...set][set.size - 1]! : null);
    if (set.size === 0) clearDropAreaRoughOutline(outlineRef.current);
  }, []);

  const onRotateDraft = useCallback((labelId: string, next: number) => {
    setRotateById((prev) => ({ ...prev, [labelId]: next }));
  }, []);

  const commitPlacement = useCallback(
    (labelId: string, placement: LabelPlacement) => {
      setRotateById((prev) => ({ ...prev, [labelId]: placement.rotateDeg }));
      setDraft((current) =>
        current.map((label) =>
          label.id === labelId
            ? {
                ...label,
                xPercent: placement.xPercent,
                yPercent: placement.yPercent,
                rotateDeg: placement.rotateDeg,
              }
            : label,
        ),
      );
      onPlacementCommit?.(labelId, placement);
    },
    [onPlacementCommit],
  );

  return (
    <div
      ref={dropRef}
      className={[styles.halo, className].filter(Boolean).join(" ")}
      style={
        {
          ...style,
          "--label-halo-pad": `${LABEL_HALO_DROP_PAD_REM}rem`,
        } as CSSProperties
      }
      role="region"
      aria-label={ariaLabel}
    >
      <div className={styles.content}>{children}</div>

      <svg ref={outlineRef} className={styles.outline} aria-hidden />

      {draft.map((label) => (
        <DraggableLabel
          key={label.id}
          label={label}
          rotateDeg={rotateById[label.id] ?? label.rotateDeg}
          isDragging={draggingId === label.id}
          dropRef={dropRef}
          outlineRef={outlineRef}
          onDragActiveChange={onDragActiveChange}
          onPositionDraft={onPositionDraft}
          onRotateDraft={onRotateDraft}
          onPlacementCommit={commitPlacement}
        />
      ))}
    </div>
  );
}
