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
import { useMemo, useState, type CSSProperties } from "react";
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
}: {
  label: LabelHaloLabelItem;
  point: LabelHaloConnectionPoint;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: label.id,
    data: { labelId: label.id, connectionPointId: label.connectionPointId },
  });

  const style: CSSProperties = {
    ...slotPositionStyle(point),
    transform: CSS.Translate.toString(transform) ?? undefined,
    opacity: isDragging ? 0.35 : 1,
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

  const pointsById = useMemo(() => {
    const map = new Map<string, LabelHaloConnectionPoint>();
    for (const point of connectionPoints) map.set(point.id, point);
    return map;
  }, [connectionPoints]);

  const activeLabel = activeId ? labels.find((label) => label.id === activeId) : null;
  const activePoint = activeLabel
    ? pointsById.get(activeLabel.connectionPointId)
    : undefined;
  const showMarkers = activeId != null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const labelId = String(event.active.id);
    const label = labels.find((item) => item.id === labelId);
    setActiveId(null);
    if (!label || !event.over) return;

    const overId = String(event.over.id);
    if (!overId.startsWith("point:")) return;
    const connectionPointId = overId.slice("point:".length);
    if (!pointsById.has(connectionPointId)) return;
    if (connectionPointId === label.connectionPointId) return;

    onPlacementCommit?.(labelId, {
      connectionPointId,
      rotateDeg: label.rotateDeg,
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
              onPlacementCommit={onPlacementCommit}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLabel ? (
          <div className={styles.dragOverlay}>
            <LabelSlot
              id={activeLabel.id}
              name={activeLabel.name}
              color={activeLabel.color}
              shape={activeLabel.shape}
              connectionPointId={activeLabel.connectionPointId}
              connection={activePoint?.connection ?? "start"}
              rotateDeg={activeLabel.rotateDeg}
              isDragging
              active
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
