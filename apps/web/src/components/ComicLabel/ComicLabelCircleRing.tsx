"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import {
  buildComicLabelCircleSlots,
  type ComicLabelCircleItem,
} from "./comicLabelCircleLayout";
import { ComicLabel } from "./ComicLabel";

export type ComicLabelCircleRingProps = {
  labels: readonly ComicLabelCircleItem[];
  /** Start angle in radians (0 = east, CCW). Default top-left. */
  startAngle?: number;
  /** Ring radius as fraction of stage size from center. */
  radius?: number;
  className?: string;
  children?: ReactNode;
};

const DEFAULT_START_ANGLE = (-3 * Math.PI) / 4;
const DEFAULT_RADIUS = 0.35;

/**
 * ComicLabelCircleRing: Arrange ComicLabel components in a circle around a center element.
 */
export function ComicLabelCircleRing({
  labels,
  startAngle = DEFAULT_START_ANGLE,
  radius = DEFAULT_RADIUS,
  className,
  children,
}: ComicLabelCircleRingProps) {
  const slots = useMemo(
    () => buildComicLabelCircleSlots(labels, { startAngle, radius }),
    [labels, radius, startAngle],
  );

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      {children}
      {slots.map((slot) => (
        <ComicLabel
          key={slot.label.id}
          text={slot.label.name}
          shape="burst"
          color={slot.label.color}
          style={
            {
              position: "absolute",
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              transform: "translate(-50%, -50%)",
              margin: 0,
              width: "max-content",
              pointerEvents: "none",
              zIndex: 3,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
