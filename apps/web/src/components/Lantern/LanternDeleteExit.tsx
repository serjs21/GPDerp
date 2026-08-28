"use client";

import axios from "axios";
import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { message } from "@/components/StyledComponents";
import type { LanternTransform } from "./lanternTransform";
import {
  initialFlightCssVars,
  lanternTransformToFlightInput,
  prefersReducedMotion,
  runSteppedLanternFlight,
} from "./simulateFlight";

export type LanternDeleteExitProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  onDeleted?: () => void;
  onChanged?: () => void;
  children: (args: {
    onDelete: () => Promise<void>;
    flightStyle: CSSProperties;
    flightExiting: boolean;
  }) => ReactNode;
};

export function LanternDeleteExit({
  haiku,
  transform,
  onDeleted,
  onChanged,
  children,
}: LanternDeleteExitProps) {
  const [flightExiting, setFlightExiting] = useState(false);
  const [flightStyle, setFlightStyle] = useState<CSSProperties>(() =>
    initialFlightCssVars(transform.positionMode),
  );
  const animatingRef = useRef(false);
  const flightCancelRef = useRef<(() => void) | null>(null);

  const handleDelete = useCallback(async () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const flightInput = lanternTransformToFlightInput(transform);
    const resetStyle = initialFlightCssVars(transform.positionMode);

    try {
      if (prefersReducedMotion()) {
        await deleteHaiku(haiku.id);
        message.success("Haiku deleted");
        onDeleted?.();
        return;
      }

      setFlightExiting(true);
      setFlightStyle(resetStyle);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const { promise, cancel } = runSteppedLanternFlight(flightInput, setFlightStyle);
      flightCancelRef.current = cancel;
      await promise;

      await deleteHaiku(haiku.id);
      message.success("Haiku deleted");
      onDeleted?.();
    } catch (e) {
      flightCancelRef.current?.();
      setFlightExiting(false);
      setFlightStyle(resetStyle);
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        message.error("You are not allowed to delete this haiku.");
      } else {
        message.error("Could not delete haiku.");
      }
      throw e;
    } finally {
      flightCancelRef.current = null;
      animatingRef.current = false;
    }
  }, [haiku.id, onDeleted, transform]);

  return <>{children({ onDelete: handleDelete, flightStyle, flightExiting })}</>;
}
