"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { angleToSlot } from "@/theme/celestialTime";

const DEFAULT_DEAD_ZONE_RADIUS_PERCENT = 18;

type UseDialPointerSelectionOptions = {
  onChange: (slot: number) => void;
  deadZoneRadiusPercent?: number;
};

export function useDialPointerSelection({
  onChange,
  deadZoneRadiusPercent = DEFAULT_DEAD_ZONE_RADIUS_PERCENT,
}: UseDialPointerSelectionOptions) {
  const faceRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const face = faceRef.current;
      if (!face) return;

      const rect = face.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const deadZoneRadius = (deadZoneRadiusPercent / 100) * (rect.width / 2);

      if (distance < deadZoneRadius) return;

      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      onChange(angleToSlot(angleDeg));
    },
    [deadZoneRadiusPercent, onChange],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      event.preventDefault();
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return {
    faceRef,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
