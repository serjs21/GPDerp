"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
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
  /** Called immediately for optimistic UI (close modal / remove from list). */
  onDeleted?: (haiku: HaikuDto) => void;
  /** Called when the delete API fails after optimistic removal. */
  onDeleteFailed?: (haiku: HaikuDto) => void;
  /** Called after flight finishes (or immediately when reduced-motion). */
  onExitComplete?: (haiku: HaikuDto) => void;
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
  onDeleteFailed,
  onExitComplete,
  children,
}: LanternDeleteExitProps) {
  const [flightExiting, setFlightExiting] = useState(false);
  const [flightStyle, setFlightStyle] = useState<CSSProperties>(() =>
    initialFlightCssVars(transform.positionMode),
  );
  const animatingRef = useRef(false);
  const flightCancelRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDelete = useCallback(async () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const snapshot = haiku;
    const flightInput = lanternTransformToFlightInput(transform);
    const resetStyle = initialFlightCssVars(transform.positionMode);

    // Optimistic: close modal / update list before animation or API finish.
    onDeleted?.(snapshot);

    const finishExit = (notifyComplete: boolean) => {
      if (notifyComplete) onExitComplete?.(snapshot);
      flightCancelRef.current = null;
      animatingRef.current = false;
    };

    const commitDelete = async (notifyComplete: boolean) => {
      try {
        await deleteHaiku(snapshot.id);
        comicToast.success("Haiku deleted");
      } catch {
        onDeleteFailed?.(snapshot);
      } finally {
        finishExit(notifyComplete);
      }
    };

    if (prefersReducedMotion()) {
      await commitDelete(true);
      return;
    }

    setFlightExiting(true);
    setFlightStyle(resetStyle);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    // Path optimistic remove unmounts this instance; parent ExitingPathLantern owns the flyer.
    if (!mountedRef.current) {
      void commitDelete(false);
      return;
    }

    const { promise, cancel } = runSteppedLanternFlight(flightInput, setFlightStyle);
    flightCancelRef.current = cancel;

    // API runs in parallel with flight; do not block confirm/modal on animation.
    void (async () => {
      try {
        await deleteHaiku(snapshot.id);
        comicToast.success("Haiku deleted");
        await promise;
      } catch {
        cancel();
        onDeleteFailed?.(snapshot);
      } finally {
        finishExit(true);
      }
    })();
  }, [haiku, onDeleteFailed, onDeleted, onExitComplete, transform]);

  return <>{children({ onDelete: handleDelete, flightStyle, flightExiting })}</>;
}
