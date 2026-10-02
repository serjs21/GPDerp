"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import {
  measureTransformOriginClient,
  pointerAngleFromOriginDeg,
  pointerAngleFromPointDeg,
  shortestAngleDeltaDeg,
} from "./rotationAngle";

export type RotationValueMode = "absolute" | "relative";

/** Ignore relative updates inside this radius of the frozen pivot (px). */
const RELATIVE_MIN_RADIUS_PX = 12;

type UseRotationTablePointerOptions = {
  originRef: RefObject<HTMLElement | null>;
  degrees: number;
  onDegreesChange: (degrees: number) => void;
  onDegreesCommit?: (degrees: number) => void;
  deadZoneRadiusPercent?: number;
  disabled?: boolean;
  /**
   * absolute — emit atan2 degrees (celestial dial).
   * relative — emit startDegrees + unwrapped pointer delta (label scrub).
   */
  valueMode?: RotationValueMode;
  /** Stop DnD / parent handlers when interacting with the control. */
  stopPropagation?: boolean;
};

type RelativeSession = {
  originX: number;
  originY: number;
  lastPointerAngle: number;
  degrees: number;
};

export function useRotationTablePointer({
  originRef,
  degrees,
  onDegreesChange,
  onDegreesCommit,
  deadZoneRadiusPercent = 0,
  disabled = false,
  valueMode = "absolute",
  stopPropagation = false,
}: UseRotationTablePointerOptions) {
  const draggingRef = useRef(false);
  const lastDegreesRef = useRef(degrees);
  const relativeSessionRef = useRef<RelativeSession | null>(null);
  const degreesRef = useRef(degrees);
  degreesRef.current = degrees;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const origin = originRef.current;
      if (!origin) return;

      if (valueMode === "relative") {
        const session = relativeSessionRef.current;
        if (!session) return;

        const { angleDeg, distance } = pointerAngleFromPointDeg(
          clientX,
          clientY,
          session.originX,
          session.originY,
        );
        if (distance < RELATIVE_MIN_RADIUS_PX) return;

        const step = shortestAngleDeltaDeg(session.lastPointerAngle, angleDeg);
        session.lastPointerAngle = angleDeg;
        session.degrees += step;
        lastDegreesRef.current = session.degrees;
        onDegreesChange(session.degrees);
        return;
      }

      const rect = origin.getBoundingClientRect();
      const { angleDeg, distance } = pointerAngleFromOriginDeg(clientX, clientY, rect);
      const deadZoneRadius = (deadZoneRadiusPercent / 100) * (rect.width / 2);
      if (distance < deadZoneRadius) return;

      lastDegreesRef.current = angleDeg;
      onDegreesChange(angleDeg);
    },
    [deadZoneRadiusPercent, onDegreesChange, originRef, valueMode],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (stopPropagation) {
        event.stopPropagation();
      }
      event.preventDefault();
      const origin = originRef.current;
      if (!origin) return;

      if (valueMode === "relative") {
        const pivot = measureTransformOriginClient(origin);
        const { angleDeg, distance } = pointerAngleFromPointDeg(
          event.clientX,
          event.clientY,
          pivot.x,
          pivot.y,
        );
        if (distance < RELATIVE_MIN_RADIUS_PX) return;

        draggingRef.current = true;
        relativeSessionRef.current = {
          originX: pivot.x,
          originY: pivot.y,
          lastPointerAngle: angleDeg,
          degrees: degreesRef.current,
        };
        lastDegreesRef.current = degreesRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      const rect = origin.getBoundingClientRect();
      const { distance } = pointerAngleFromOriginDeg(
        event.clientX,
        event.clientY,
        rect,
      );
      const deadZoneRadius = (deadZoneRadiusPercent / 100) * (rect.width / 2);
      if (distance < deadZoneRadius) return;

      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX, event.clientY);
    },
    [
      deadZoneRadiusPercent,
      disabled,
      originRef,
      stopPropagation,
      updateFromPointer,
      valueMode,
    ],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!draggingRef.current) return;
      if (stopPropagation) {
        event.stopPropagation();
      }
      event.preventDefault();
      updateFromPointer(event.clientX, event.clientY);
    },
    [stopPropagation, updateFromPointer],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      relativeSessionRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      onDegreesCommit?.(lastDegreesRef.current);
    },
    [onDegreesCommit],
  );

  return {
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    isDraggingRef: draggingRef,
  };
}
