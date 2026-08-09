"use client";

import { useEffect, useRef } from "react";
import type { HaikuDto } from "@/api/haikus";
import { computeVisibleLanterns } from "./computeVisibleLanterns";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { LanternPathLantern } from "./LanternPathLantern";
import { LanternPathStage } from "./LanternPathStage";
import { useLanternPathScroll } from "./useLanternPathScroll";
import styles from "../Lantern.stories.module.css";

export type LanternPathProps = {
  haikus: HaikuDto[];
  initialFocusIndex?: number;
  onFocusChange?: (focusIndex: number) => void;
  className?: string;
};

export function LanternPath({
  haikus,
  initialFocusIndex,
  onFocusChange,
  className,
}: LanternPathProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    stepForward,
    stepBack,
    canStepForward,
    canStepBack,
  } = useLanternPathScroll(haikus, { initialFocusIndex, onFocusChange });

  const visibleLanterns = computeVisibleLanterns(
    haikus,
    focusIndex,
    tweenProgress,
    fromFocusIndex,
  );

  const focusHaiku = haikus[focusIndex];
  const hudLabel = focusHaiku
    ? `${focusHaiku.title || "Haiku"} · ${focusIndex + 1} / ${haikus.length}`
    : "No haikus";

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = Math.sign(event.deltaY);
      if (direction > 0) stepForward();
      if (direction < 0) stepBack();
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [stepBack, stepForward]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepForward();
      if (event.key === "ArrowLeft") stepBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepBack, stepForward]);

  return (
    <LanternPathStage
      ref={stageRef}
      className={className}
      hud={<p className={styles.flightPathHud}>{hudLabel}</p>}
      controls={
        <div className={styles.flightPathControls}>
          <button
            type="button"
            className={styles.flightPathControlButton}
            aria-label="Previous haiku"
            disabled={!canStepBack}
            onClick={stepBack}
          >
            ←
          </button>
          <span className={styles.flightPathControlLabel}>
            stop-{LANTERN_PATH_FOCUS_STOP} ({focusIndex + 1} / {Math.max(haikus.length, 1)})
          </span>
          <button
            type="button"
            className={styles.flightPathControlButton}
            aria-label="Next haiku"
            disabled={!canStepForward}
            onClick={stepForward}
          >
            →
          </button>
        </div>
      }
    >
      {visibleLanterns.map(({ haikuIndex, haiku, pathStop }) => (
        <LanternPathLantern
          key={haiku.id ?? `lantern-${haikuIndex}`}
          haiku={haiku}
          pathStop={pathStop}
        />
      ))}
    </LanternPathStage>
  );
}