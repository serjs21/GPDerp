"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { computeVisibleLanterns } from "./computeVisibleLanterns";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { LanternPathControls } from "./LanternPathControls";
import { LanternPathLantern } from "./LanternPathLantern";
import { LanternPathStage } from "./LanternPathStage";
import { useLanternPathInput } from "./useLanternPathInput";
import { useLanternPathScroll } from "./useLanternPathScroll";
import { lanternPathHudLabel } from "./utils/lanternPathHudUtils";
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
  generatingDraft,
  initialFocusIndex,
  onFocusChange,
  onHaikuDeleted,
  onHaikuChanged,
  className,
  showGuides,
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
  const hudLabel = lanternPathHudLabel(t, { generatingDraft, haikus, focusIndex });

  return (
    <LanternPathStage
      ref={stageRef}
      className={className}
      showGuides={showGuides}
      hud={<p className={styles.flightPathHud}>{hudLabel}</p>}
      controls={
        <LanternPathControls
          focusIndex={focusIndex}
          haikuCount={haikus.length}
          canStepBack={canStepBack}
          canStepForward={canStepForward}
          onStepBack={stepBack}
          onStepForward={stepForward}
        />
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
