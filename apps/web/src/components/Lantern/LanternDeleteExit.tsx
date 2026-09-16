"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { LanternSteppedFlight } from "./LanternSteppedFlight";
import type { LanternTransform } from "./lanternTransform";
import {
  initialFlightCssVars,
  prefersReducedMotion,
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
  /** Passed through to in-place stepped flight (CreationModal). */
  widthRem?: number;
  lanternClassName?: string;
  excludeLabelIds?: string[];
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
  widthRem = 20,
  lanternClassName,
  excludeLabelIds,
  children,
}: LanternDeleteExitProps) {
  const [flightExiting, setFlightExiting] = useState(false);
  const [flightActive, setFlightActive] = useState(true);
  const [flightStyle] = useState<CSSProperties>(() =>
    initialFlightCssVars(transform.positionMode),
  );
  const animatingRef = useRef(false);
  const mountedRef = useRef(true);
  const flightResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      flightResolveRef.current?.();
      flightResolveRef.current = null;
    };
  }, []);

  const handleDelete = useCallback(async () => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    const snapshot = haiku;

    // Optimistic: close modal / update list before animation or API finish.
    onDeleted?.(snapshot);

    const finishExit = (notifyComplete: boolean) => {
      if (notifyComplete) onExitComplete?.(snapshot);
      flightResolveRef.current = null;
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

    setFlightActive(true);
    setFlightExiting(true);

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

    const flightPromise = new Promise<void>((resolve) => {
      flightResolveRef.current = resolve;
    });

    // API runs in parallel with flight; do not block confirm/modal on animation.
    void (async () => {
      try {
        await deleteHaiku(snapshot.id);
        comicToast.success("Haiku deleted");
        await flightPromise;
      } catch {
        setFlightActive(false);
        flightResolveRef.current?.();
        flightResolveRef.current = null;
        onDeleteFailed?.(snapshot);
      } finally {
        finishExit(true);
      }
    })();
  }, [haiku, onDeleteFailed, onDeleted, onExitComplete]);

  if (flightExiting) {
    return (
      <LanternSteppedFlight
        haiku={haiku}
        transform={transform}
        excludeLabelIds={excludeLabelIds}
        className={lanternClassName}
        widthRem={widthRem}
        active={flightActive}
        onComplete={() => {
          flightResolveRef.current?.();
          flightResolveRef.current = null;
        }}
      />
    );
  }

  return <>{children({ onDelete: handleDelete, flightStyle, flightExiting: false })}</>;
}
