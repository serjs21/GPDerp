"use client";

import { useEffect } from "react";
import type { HaikuDto } from "@/api/haikus";
import { LanternSteppedFlight } from "@/components/Lantern/LanternSteppedFlight";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { prefersReducedMotion } from "@/components/Lantern/simulateFlight";
import styles from "./SVGPath.module.css";

export type ExitingPathLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  excludeLabelIds?: string[];
  onComplete: (haiku: HaikuDto) => void;
  onPoseHold?: (poseIndex: number) => void;
};

/** Owns fly-away after the path lantern unmounts from the successful delete list update. */
export function ExitingPathLantern({
  haiku,
  transform,
  excludeLabelIds,
  onComplete,
  onPoseHold,
}: ExitingPathLanternProps) {
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) onComplete(haiku);
  }, [haiku, onComplete, reduced]);

  if (reduced) return null;

  return (
    <LanternSteppedFlight
      haiku={haiku}
      transform={transform}
      excludeLabelIds={excludeLabelIds}
      className={styles.lantern}
      widthRem={19}
      onPoseHold={onPoseHold}
      onComplete={() => onComplete(haiku)}
    />
  );
}
