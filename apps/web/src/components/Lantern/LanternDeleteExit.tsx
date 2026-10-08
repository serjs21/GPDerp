"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import axios from "axios";
import { LanternSteppedFlight } from "./LanternSteppedFlight";
import type { LanternTransform } from "./lanternTransform";
import {
  initialFlightCssVars,
  prefersReducedMotion,
} from "./simulateFlight";

export type LanternDeleteExitProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  /** Called after successful delete (remove from list / mount path exit flyer). */
  onDeleted?: (haiku: HaikuDto) => void;
  /** Called when delete fails after the haiku was already removed (legacy / restore). */
  onDeleteFailed?: (haiku: HaikuDto) => void;
  /** Called after flight finishes (or immediately when reduced-motion). */
  onExitComplete?: (haiku: HaikuDto) => void;
  /** Fired when stepped flight first holds a pose (path pack cue). */
  onPoseHold?: (poseIndex: number) => void;
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
  onExitComplete,
  onPoseHold,
  widthRem = 20,
  lanternClassName,
  excludeLabelIds,
  children,
}: LanternDeleteExitProps) {
  const t = useTranslations("Lantern.lanternDeleteExit");
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

    try {
      await deleteHaiku(snapshot.id);
      comicToast.success(t("deleted"));
    } catch (error) {
      animatingRef.current = false;
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        comicToast.error(t("deleteForbidden"));
      } else {
        comicToast.error(t("deleteFailed"));
      }
      throw error;
    }

    // Path remove unmounts this instance; parent ExitingPathLantern owns the flyer.
    onDeleted?.(snapshot);

    if (prefersReducedMotion()) {
      onExitComplete?.(snapshot);
      animatingRef.current = false;
      return;
    }

    // Let React commit list removal / unmount before choosing in-place vs path flyer.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    if (!mountedRef.current) {
      animatingRef.current = false;
      return;
    }

    // In-place flight (CreationModal): start flyer and return so the confirm modal can close.
    setFlightActive(true);
    setFlightExiting(true);

    void (async () => {
      await new Promise<void>((resolve) => {
        flightResolveRef.current = resolve;
      });

      onExitComplete?.(snapshot);
      flightResolveRef.current = null;
      animatingRef.current = false;
    })();
  }, [haiku, onDeleted, onExitComplete, t]);

  if (flightExiting) {
    return (
      <LanternSteppedFlight
        haiku={haiku}
        transform={transform}
        excludeLabelIds={excludeLabelIds}
        className={lanternClassName}
        widthRem={widthRem}
        active={flightActive}
        onPoseHold={onPoseHold}
        onComplete={() => {
          flightResolveRef.current?.();
          flightResolveRef.current = null;
        }}
      />
    );
  }

  return <>{children({ onDelete: handleDelete, flightStyle, flightExiting: false })}</>;
}
