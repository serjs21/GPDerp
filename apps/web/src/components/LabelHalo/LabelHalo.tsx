"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  connectionPointInsetStyle,
  DEFAULT_LABEL_HALO_CONNECTION_POINTS,
  LABEL_HALO_CONNECTION_POINT_SRC,
  slotPositionStyle,
  type LabelHaloConnectionPoint,
  type LabelHaloLabelItem,
  type LabelPlacement,
} from "./consts/labelHaloConsts";
import { LabelSlot } from "./LabelSlot";
import styles from "./LabelHalo.module.css";

export type LabelHaloProps = {
  labels: LabelHaloLabelItem[];
  connectionPoints?: LabelHaloConnectionPoint[];
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the halo region. */
  ariaLabel?: string;
};

function DraggableLabelSlot({
  label,
  point,
  onPlacementCommit,
  onRotateDraft,
}: {
  label: LabelHaloLabelItem;
  point: LabelHaloConnectionPoint;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  onRotateDraft: (labelId: string, rotateDeg: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: label.id,
    data: {
      labelId: label.id,
      connectionPointId: label.connectionPointId,
      rotateDeg: label.rotateDeg,
    },
  });

  const style: CSSProperties = {
    ...slotPositionStyle(point),
    transform: CSS.Translate.toString(transform) ?? undefined,
    // Source is hidden while dragging — only DragOverlay shows the preview.
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div className={styles.point} style={style}>
      <LabelSlot
        id={label.id}
        name={label.name}
        color={label.color}
        shape={label.shape}
        connectionPointId={label.connectionPointId}
        connection={point.connection}
        rotateDeg={label.rotateDeg}
        isDragging={isDragging}
        setNodeRef={setNodeRef}
        dragListeners={listeners}
        dragAttributes={attributes}
        onRotateDraft={(next) => onRotateDraft(label.id, next)}
        onPlacementCommit={(placement) => onPlacementCommit?.(label.id, placement)}
      />
    </div>
  );
}

function ConnectionDroppable({
  point,
  showMarker,
}: {
  point: LabelHaloConnectionPoint;
  showMarker: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `point:${point.id}`,
    data: { connectionPointId: point.id },
  });

  if (!showMarker) return null;

  return (
    <div
      ref={setNodeRef}
      className={[styles.pointDroppable, isOver ? styles.pointDroppableOver : ""]
        .filter(Boolean)
        .join(" ")}
      style={connectionPointInsetStyle(point)}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
      <img
        className={styles.pointMarker}
        src={LABEL_HALO_CONNECTION_POINT_SRC}
        alt=""
        draggable={false}
      />
    </div>
  );
}

export function LabelHalo({
  labels,
  connectionPoints = DEFAULT_LABEL_HALO_CONNECTION_POINTS,
  onPlacementCommit,
  className,
  style,
  ariaLabel = "Label halo",
}: LabelHaloProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const draftRotateByIdRef = useRef<Map<string, number>>(new Map());
  const [, bumpDraft] = useState(0);

  const pointsById = useMemo(() => {
    const map = new Map<string, LabelHaloConnectionPoint>();
    for (const point of connectionPoints) map.set(point.id, point);
    return map;
  }, [connectionPoints]);

  const rotateFor = useCallback(
    (label: LabelHaloLabelItem) =>
      draftRotateByIdRef.current.get(label.id) ?? label.rotateDeg,
    [],
  );

  const onRotateDraft = useCallback((labelId: string, next: number) => {
    draftRotateByIdRef.current.set(labelId, next);
    bumpDraft((n) => n + 1);
  }, []);

  const commitPlacement = useCallback(
    (labelId: string, placement: LabelPlacement) => {
      draftRotateByIdRef.current.set(labelId, placement.rotateDeg);
      onPlacementCommit?.(labelId, placement);
    },
    [onPlacementCommit],
  );

  const activeLabel = activeId ? labels.find((label) => label.id === activeId) : null;
  const activePoint = activeLabel
    ? pointsById.get(activeLabel.connectionPointId)
    : undefined;
  const showMarkers = activeId != null;

  const onDragStart = (event: DragStartEvent) => {
    const labelId = String(event.active.id);
    const label = labels.find((item) => item.id === labelId);
    if (label && !draftRotateByIdRef.current.has(labelId)) {
      draftRotateByIdRef.current.set(labelId, label.rotateDeg);
    }
    setActiveId(labelId);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const labelId = String(event.active.id);
    const label = labels.find((item) => item.id === labelId);
    const rotateDeg =
      draftRotateByIdRef.current.get(labelId) ?? label?.rotateDeg ?? 0;
    setActiveId(null);
    if (!label || !event.over) return;

    const overId = String(event.over.id);
    if (!overId.startsWith("point:")) return;
    const connectionPointId = overId.slice("point:".length);
    if (!pointsById.has(connectionPointId)) return;
    if (connectionPointId === label.connectionPointId) return;

    commitPlacement(labelId, {
      connectionPointId,
      rotateDeg,
    });
  };

  const onDragCancel = () => setActiveId(null);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        className={[styles.halo, className].filter(Boolean).join(" ")}
        style={style}
        role="region"
        aria-label={ariaLabel}
      >
        {connectionPoints.map((point) => (
          <ConnectionDroppable key={point.id} point={point} showMarker={showMarkers} />
        ))}

        {labels.map((label) => {
          const point = pointsById.get(label.connectionPointId);
          if (!point) return null;
          return (
            <DraggableLabelSlot
              key={label.id}
              label={label}
              point={point}
              onPlacementCommit={commitPlacement}
              onRotateDraft={onRotateDraft}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLabel ? (
          <div className={styles.dragOverlay}>
            <LabelSlot
              id={`overlay-${activeLabel.id}`}
              name={activeLabel.name}
              color={activeLabel.color}
              shape={activeLabel.shape}
              connectionPointId={activeLabel.connectionPointId}
              connection={activePoint?.connection ?? "start"}
              rotateDeg={rotateFor(activeLabel)}
              isDragging
              showRotateControl={false}
              disabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
