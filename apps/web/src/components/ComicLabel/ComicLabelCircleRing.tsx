"use client";

import { useCallback, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import type { ComicalBubbleTarget } from "@/components/ComicConfirmModal/useComicalBubbles";
import { COMIC_LABEL_DEFAULT_BUBBLE_STYLE } from "./comicLabelBubblePresets";
import {
  buildComicLabelCircleSlots,
  comicLabelOriginsKey,
  type ComicLabelCircleItem,
} from "./comicLabelCircleLayout";
import { resolveComicLabelFill } from "./comicLabelColors";
import { ComicLabel } from "./ComicLabel";
import { useComicLabelCircleSlotOrigins } from "./useComicLabelCircleSlotOrigins";

export type ComicLabelCircleRingProps = {
  labels: readonly ComicLabelCircleItem[];
  /** Start angle in radians (0 = east, CCW). Default top-left. */
  startAngle?: number;
  /** Ring radius as fraction of stage size from center. */
  radius?: number;
  className?: string;
  stageClassName?: string;
  children?: ReactNode;
};

const DEFAULT_START_ANGLE = (-3 * Math.PI) / 4;
const DEFAULT_RADIUS = 0.35;

export function ComicLabelCircleRing({
  labels,
  startAngle = DEFAULT_START_ANGLE,
  radius = DEFAULT_RADIUS,
  className,
  stageClassName,
  children,
}: ComicLabelCircleRingProps) {
  const targetRefs = useRef(new Map<string, HTMLElement | null>());
  const stageRef = useRef<HTMLDivElement | null>(null);

  const slots = useMemo(
    () => buildComicLabelCircleSlots(labels, { startAngle, radius }),
    [labels, radius, startAngle],
  );

  const slotOrigins = useComicLabelCircleSlotOrigins(stageRef, targetRefs, slots);
  const originsKey = comicLabelOriginsKey(slotOrigins);

  const targetsKey = [
    slots
      .map(
        (slot) =>
          `${slot.label.id}:${slot.sourceDirection}:${resolveComicLabelFill(slot.label.color)}`,
      )
      .join("|"),
    originsKey,
  ].join("::");

  const getTargets = useCallback(
    (): ComicalBubbleTarget[] =>
      slots.map((slot) => ({
        element: targetRefs.current.get(slot.label.id) ?? null,
        style: COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
        sourceDirection: "none",
        backgroundColors: [resolveComicLabelFill(slot.label.color)],
        variant: "label",
      })),
    [slots],
  );

  const setTargetRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      targetRefs.current.set(id, node);
    } else {
      targetRefs.current.delete(id);
    }
  }, []);

  return (
    <div className={className}>
      <ComicBubbleStage
        ref={stageRef}
        active
        targetsKey={targetsKey}
        getTargets={getTargets}
        className={stageClassName}
      >
        {children}
        {slots.map((slot) => {
          const origin = slotOrigins[slot.label.id];
          return (
            <ComicLabel
              key={slot.label.id}
              ref={(node) => setTargetRef(slot.label.id, node)}
              mode="embedded"
              name={slot.label.name}
              color={slot.label.color}
              sourceDirection="none"
              style={
                {
                  position: "absolute",
                  left: origin ? `${origin.left}px` : `${slot.x}%`,
                  top: origin ? `${origin.top}px` : `${slot.y}%`,
                  transform: "none",
                  margin: 0,
                  width: "max-content",
                  pointerEvents: "none",
                  zIndex: 3,
                } as CSSProperties
              }
            />
          );
        })}
      </ComicBubbleStage>
    </div>
  );
}
