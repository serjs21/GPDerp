"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { PathOverlay } from "@/components/PathOverlay";
import {
  defaultStopLanternTransformFallback,
  SVG_PATH_LANTERN_WIDTH_REM,
} from "@/components/SVGPath/consts/pathLanternLayoutConsts";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./CreationModal.module.css";

/** Same width + stop-20 pose as SVGPath list / creation overlay. */
const CREATION_LANTERN_WIDTH_REM = SVG_PATH_LANTERN_WIDTH_REM;
const CREATION_LANTERN_TRANSFORM = defaultStopLanternTransformFallback();

export type CreationModalProps = {
  open: boolean;
  onKeepScrolling: () => void;
  onGoToHaiku: () => void;
  generatingDraft?: GeneratingDraft | null;
  /** Optional saved haiku once complete (stories can pass a mock). */
  haiku?: HaikuDto | null;
  /** When true, lantern shows generating shimmer (draft may be stale after stream ends). */
  isGenerating?: boolean;
  /** Stable fly-in key for the whole create session (requestId); avoids remount on save. */
  lanternSessionKey?: string | null;
  /** Show hover actions on a saved lantern (e.g. Storybook clickability checks). */
  showLanternActions?: boolean;
  /** When false, PathOverlay chrome only — lantern lives on SVGPath guideBox (aligned). */
  showLantern?: boolean;
  onHaikuDeleted?: (haiku: HaikuDto) => void;
  onHaikuDeleteFailed?: (haiku: HaikuDto) => void;
  onHaikuChanged?: () => void;
};

export function CreationModal({
  open,
  onKeepScrolling,
  onGoToHaiku,
  generatingDraft = null,
  haiku = null,
  isGenerating = false,
  lanternSessionKey = null,
  showLanternActions = false,
  showLantern = true,
  onHaikuDeleted,
  onHaikuDeleteFailed,
  onHaikuChanged,
}: CreationModalProps) {
  const t = useTranslations("CreationModal");
  // Keep the lantern mounted for flight after parent clears haiku / closes open.
  const [exitingHaiku, setExitingHaiku] = useState<HaikuDto | null>(null);
  const activeHaiku = haiku ?? exitingHaiku;
  const overlayOpen = open || exitingHaiku != null;

  useEffect(() => {
    if (open && haiku) setExitingHaiku(null);
  }, [open, haiku]);

  const ariaLabel = generatingDraft
    ? t("generating", { subject: generatingDraft.subject })
    : activeHaiku
      ? t("haikuLantern", { title: activeHaiku.title ?? "" })
      : t("creation");

  // Prefer session key so draft→saved does not remount .flyIn.
  const flyInKey =
    lanternSessionKey ?? generatingDraft?.requestId ?? activeHaiku?.id ?? "lantern";

  return (
    <PathOverlay
      open={overlayOpen}
      fillOrigin="vertical"
      seam="straight"
      onKeepScrolling={onKeepScrolling}
      onGoToBeginning={onGoToHaiku}
      onClose={onKeepScrolling}
    >
      <div className={styles.stage}>
        {showLantern ? (
          <div className={styles.flyIn} key={flyInKey}>
            {activeHaiku ? (
              <LanternDeleteExit
                haiku={activeHaiku}
                transform={CREATION_LANTERN_TRANSFORM}
                widthRem={CREATION_LANTERN_WIDTH_REM}
                onDeleted={(deleted) => {
                  setExitingHaiku(deleted);
                  onHaikuDeleted?.(deleted);
                }}
                onDeleteFailed={onHaikuDeleteFailed}
                onExitComplete={() => setExitingHaiku(null)}
                onChanged={onHaikuChanged}
              >
                {({ onDelete, flightStyle, flightExiting }) => (
                  <LanternFrame
                    ariaLabel={ariaLabel}
                    widthRem={CREATION_LANTERN_WIDTH_REM}
                    transform={CREATION_LANTERN_TRANSFORM}
                    style={flightStyle}
                    flightExiting={flightExiting}
                    suppressReveal
                  >
                    <Lantern
                      haiku={activeHaiku}
                      showActions={showLanternActions && !flightExiting}
                      onDelete={onDelete}
                      onChanged={onHaikuChanged}
                    />
                  </LanternFrame>
                )}
              </LanternDeleteExit>
            ) : generatingDraft ? (
              <LanternFrame
                ariaLabel={ariaLabel}
                widthRem={CREATION_LANTERN_WIDTH_REM}
                transform={CREATION_LANTERN_TRANSFORM}
                generating={isGenerating}
              >
                <Lantern generatingDraft={generatingDraft} showActions={false} />
              </LanternFrame>
            ) : null}
          </div>
        ) : null}
      </div>
    </PathOverlay>
  );
}
