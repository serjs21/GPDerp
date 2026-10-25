"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import {
  SteppedTransition,
  STEPPED_TRANSITION,
} from "@/components/animations/SteppedTransition";
import { Lantern } from "./Lantern";
import { LanternFrame } from "./LanternFrame";
import type { LanternTransform } from "./lanternTransform";
import {
  buildLanternFlightPoses,
  lanternPoseToFlightStyle,
  seedFromHaikuId,
} from "./buildLanternFlightPoses";
import {
  lanternTransformToFlightInput,
  prefersReducedMotion,
} from "./simulateFlight";

export type LanternSteppedFlightProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  excludeLabelIds?: string[];
  className?: string;
  widthRem?: number;
  active?: boolean;
  reducedMotion?: boolean;
  /** Forwarded to the flying Lantern (placeholder lanterns hide the date line). */
  showMeta?: boolean;
  onComplete: () => void;
  onPoseHold?: (poseIndex: number) => void;
};

/**
 * Pose-to-pose lantern delete flight: dual (or smear) fixed-position frames
 * with opacity crossfade via SteppedTransition.
 */
export function LanternSteppedFlight({
  haiku,
  transform,
  excludeLabelIds,
  className,
  widthRem = 19,
  active = true,
  reducedMotion: reducedMotionProp,
  showMeta,
  onComplete,
  onPoseHold,
}: LanternSteppedFlightProps) {
  const t = useTranslations("Lantern.lanternSteppedFlight");
  const reducedMotion = reducedMotionProp ?? prefersReducedMotion();
  const flightInput = useMemo(
    () => lanternTransformToFlightInput(transform),
    [transform],
  );
  const poses = useMemo(
    () =>
      buildLanternFlightPoses(flightInput, {
        seed: seedFromHaikuId(haiku.id),
        poseCount: STEPPED_TRANSITION.poseCount,
      }),
    [flightInput, haiku.id],
  );

  return (
    <SteppedTransition
      poses={poses}
      active={active}
      reducedMotion={reducedMotion}
      onComplete={onComplete}
      onPoseHold={onPoseHold}
      renderPose={(pose, layerOpacity) => {
        const poseOpacity = (pose.opacity ?? 1) * layerOpacity;
        const flightStyle = {
          ...lanternPoseToFlightStyle(pose, transform.positionMode, {
            x: flightInput.x,
            y: flightInput.y,
            rotate: flightInput.rotate,
          }),
          "--lantern-opacity": String(poseOpacity),
        };
        return (
          <LanternFrame
            className={className}
            transform={transform}
            style={flightStyle}
            flightExiting
            widthRem={widthRem}
            ariaLabel={t("deleting", { title: haiku.title ?? "" })}
            haikuLabels={haiku.labels}
            excludeLabelIds={excludeLabelIds}
          >
            <Lantern haiku={haiku} showActions={false} showMeta={showMeta} />
          </LanternFrame>
        );
      }}
    />
  );
}
