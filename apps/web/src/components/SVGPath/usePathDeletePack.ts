"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { prefersReducedMotion } from "@/components/Lantern/simulateFlight";
import type { DeletePack, ExitingLantern, HaikusRef } from "./SVGPath.types";

const SVG_PATH_DELETE_PACK_MS = 450;
/** Start neighbor pack when exit flight first holds this pose (0-based; 3 = 4th frame). */
const DELETE_PACK_CUE_POSE_INDEX = 3;

/**
 * Deleted lanterns fly off as exiting overlays while their neighbors pack into the vacated slot;
 * the pack tween starts on the exit flight's pose cue (or immediately under reduced motion).
 */
export function usePathDeletePack(haikusRef: HaikusRef, onHaikuDeleted: ((haiku: HaikuDto) => void) | undefined) {
  const [exitingLanterns, setExitingLanterns] = useState<ExitingLantern[]>([]);
  const [deletePack, setDeletePack] = useState<DeletePack | null>(null);
  const [deletePackT, setDeletePackT] = useState(1);
  const deletePackAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const deletePackStartedRef = useRef(false);

  const startDeletePackAnimation = useCallback(() => {
    if (deletePackStartedRef.current) return;
    deletePackStartedRef.current = true;
    deletePackAnimationRef.current?.stop();
    deletePackAnimationRef.current = animate(0, 1, {
      duration: SVG_PATH_DELETE_PACK_MS / 1000,
      ease: "easeOut",
      onUpdate: (value) => setDeletePackT(value),
      onComplete: () => {
        setDeletePack(null);
        setDeletePackT(1);
        deletePackAnimationRef.current = null;
      },
    });
  }, []);

  const handleLanternDeleted = useCallback(
    (haiku: HaikuDto, transform: LanternTransform) => {
      const prevIndexById = new Map(haikusRef.current.map((h, index) => [h.id, index]));
      setExitingLanterns((prev) =>
        prev.some((entry) => entry.haiku.id === haiku.id)
          ? prev
          : [...prev, { haiku, transform }],
      );
      setDeletePack({ prevIndexById });
      setDeletePackT(0);
      deletePackStartedRef.current = false;
      deletePackAnimationRef.current?.stop();
      deletePackAnimationRef.current = null;
      onHaikuDeleted?.(haiku);
      // Reduced-motion skips stepped flight cues — pack immediately.
      if (prefersReducedMotion()) {
        startDeletePackAnimation();
      }
    },
    [haikusRef, onHaikuDeleted, startDeletePackAnimation],
  );

  const handleExitPoseHold = useCallback(
    (poseIndex: number) => {
      if (poseIndex >= DELETE_PACK_CUE_POSE_INDEX) {
        startDeletePackAnimation();
      }
    },
    [startDeletePackAnimation],
  );

  const handleLanternExitComplete = useCallback((haiku: HaikuDto) => {
    // Safety: if the flyer finished before the pack cue, still pack neighbors.
    startDeletePackAnimation();
    setExitingLanterns((prev) => prev.filter((entry) => entry.haiku.id !== haiku.id));
  }, [startDeletePackAnimation]);

  useEffect(() => {
    return () => {
      deletePackAnimationRef.current?.stop();
    };
  }, []);

  const exitingIds = useMemo(
    () => new Set(exitingLanterns.map((entry) => entry.haiku.id)),
    [exitingLanterns],
  );

  return {
    exitingLanterns,
    exitingIds,
    deletePack,
    deletePackT,
    packingActive: deletePack != null && deletePackT < 1,
    handleLanternDeleted,
    handleExitPoseHold,
    handleLanternExitComplete,
  };
}
