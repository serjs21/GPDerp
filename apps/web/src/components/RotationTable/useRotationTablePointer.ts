"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import {
  pointerAngleFromOriginDeg,
  shortestAngleDeltaDeg,
} from "./rotationAngle";

export type RotationValueMode = "absolute" | "relative";

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
  const sessionRef = useRef<{
    startPointerAngle: number;
    startDegrees: number;
  } | null>(null);
  const degreesRef = useRef(degrees);
  degreesRef.current = degrees;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const origin = originRef.current;
      if (!origin) return;

      const rect = origin.getBoundingClientRect();
      const { angleDeg, distance } = pointerAngleFromOriginDeg(clientX, clientY, rect);
      const deadZoneRadius = (deadZoneRadiusPercent / 100) * (rect.width / 2);
      if (distance < deadZoneRadius) return;

      let next = angleDeg;
      if (valueMode === "relative") {
        const session = sessionRef.current;
        if (!session) return;
        next =
          session.startDegrees +
          shortestAngleDeltaDeg(session.startPointerAngle, angleDeg);
      }

      lastDegreesRef.current = next;
      onDegreesChange(next);
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

      const rect = origin.getBoundingClientRect();
      const { angleDeg, distance } = pointerAngleFromOriginDeg(
        event.clientX,
        event.clientY,
        rect,
      );
      const deadZoneRadius = (deadZoneRadiusPercent / 100) * (rect.width / 2);
      if (distance < deadZoneRadius && valueMode === "absolute") return;

      draggingRef.current = true;
      sessionRef.current = {
        startPointerAngle: angleDeg,
        startDegrees: degreesRef.current,
      };
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
      sessionRef.current = null;
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
