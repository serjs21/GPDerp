"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { computeVisibleLanterns } from "./computeVisibleLanterns";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { LanternPathLantern } from "./LanternPathLantern";
import { LanternPathStage } from "./LanternPathStage";
import { useLanternPathInput } from "./useLanternPathInput";
import { useLanternPathScroll } from "./useLanternPathScroll";
import styles from "./LanternPath.module.css";

export type LanternPathProps = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
  initialFocusIndex?: number;
  onFocusChange?: (focusIndex: number) => void;
  onHaikuDeleted?: () => void;
  onHaikuChanged?: () => void;
  className?: string;
  /** Storybook/debug: show SVG path guide and stop labels. */
  showGuides?: boolean;
};

export function LanternPath({
  haikus,
  generatingDraft = null,
  initialFocusIndex,
  onFocusChange,
  onHaikuDeleted,
  onHaikuChanged,
  className,
  showGuides = false,
}: LanternPathProps) {
  const t = useTranslations("Lantern.lanternPath");
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

  useLanternPathInput(stageRef, stepForward, stepBack);

  const visibleLanterns = computeVisibleLanterns(
    haikus,
    focusIndex,
    tweenProgress,
    fromFocusIndex,
  );

  const focusHaiku = haikus[focusIndex];
  const hudLabel = generatingDraft
    ? t("generating", { subject: generatingDraft.subject })
    : focusHaiku
      ? t("focusPosition", {
          title: focusHaiku.title || t("untitled"),
          position: focusIndex + 1,
          total: haikus.length,
        })
      : t("empty");

  return (
    <LanternPathStage
      ref={stageRef}
      className={className}
      showGuides={showGuides}
      hud={<p className={styles.flightPathHud}>{hudLabel}</p>}
      controls={
        <div className={styles.flightPathControls}>
          <button
            type="button"
            className={styles.flightPathControlButton}
            aria-label={t("previous")}
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
            aria-label={t("next")}
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
          onDeleted={onHaikuDeleted}
          onChanged={onHaikuChanged}
        />
      ))}
      {generatingDraft ? (
        <LanternPathLantern
          key={`generating-${generatingDraft.requestId}`}
          generatingDraft={generatingDraft}
          pathStop={LANTERN_PATH_FOCUS_STOP}
        />
      ) : null}
    </LanternPathStage>
  );
}
