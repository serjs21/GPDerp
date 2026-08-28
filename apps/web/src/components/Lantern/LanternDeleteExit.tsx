"use client";

import axios from "axios";
import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { message } from "@/components/StyledComponents";
import type { LanternTransform } from "./lanternTransform";
import {
  initialFlightCssVars,
  LANTERN_FLIGHT_EXIT_MS,
  lanternTransformToFlightInput,
  prefersReducedMotion,
  simulateFlight,
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

function waitForFlightExit(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, LANTERN_FLIGHT_EXIT_MS);
  });
}

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
          requestAnimationFrame(() => {
            setFlightStyle(simulateFlight(flightInput));
            resolve();
          });
        });
      });

      await waitForFlightExit();

      await deleteHaiku(haiku.id);
      message.success("Haiku deleted");
      onDeleted?.();
    } catch (e) {
      setFlightExiting(false);
      setFlightStyle(resetStyle);
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        message.error("You are not allowed to delete this haiku.");
      } else {
        message.error("Could not delete haiku.");
      }
      throw e;
    } finally {
      animatingRef.current = false;
    }
  }, [haiku.id, onDeleted, transform]);

  return <>{children({ onDelete: handleDelete, flightStyle, flightExiting })}</>;
}
