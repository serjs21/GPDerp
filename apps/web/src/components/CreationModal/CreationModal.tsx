"use client";

import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { PathOverlay } from "@/components/PathOverlay";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./CreationModal.module.css";

/** Resting pose from PathOverlay App view (devtools) — centered, mid-low. */
const CREATION_LANTERN_WIDTH_REM = 20;
const CREATION_LANTERN_TRANSFORM: LanternTransform = {
  positionMode: "percent",
  x: 0.5,
  y: 0.70635, // --lantern-bottom: 29.365%
  scale: 1,
  rotate: 0,
  opacity: 1,
};

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
  onHaikuDeleted?: () => void;
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
  onHaikuDeleted,
  onHaikuChanged,
}: CreationModalProps) {
  const ariaLabel = generatingDraft
    ? `Generating haiku: ${generatingDraft.subject}`
    : haiku
      ? `Haiku lantern: ${haiku.title ?? ""}`
      : "Haiku creation";

  const flyInKey =
    lanternSessionKey ?? generatingDraft?.requestId ?? haiku?.id ?? "lantern";

  return (
    <PathOverlay
      open={open}
      fillOrigin="vertical"
      seam="straight"
      onKeepScrolling={onKeepScrolling}
      onGoToBeginning={onGoToHaiku}
      onClose={onKeepScrolling}
    >
      <div className={styles.stage}>
        <div className={styles.flyIn} key={flyInKey}>
          <LanternFrame
            ariaLabel={ariaLabel}
            widthRem={CREATION_LANTERN_WIDTH_REM}
            transform={CREATION_LANTERN_TRANSFORM}
            generating={isGenerating}
          >
            {generatingDraft ? (
              <Lantern generatingDraft={generatingDraft} showActions={false} />
            ) : haiku ? (
              <Lantern
                haiku={haiku}
                showActions={showLanternActions}
                onDeleted={onHaikuDeleted}
                onChanged={onHaikuChanged}
              />
            ) : null}
          </LanternFrame>
        </div>
      </div>
    </PathOverlay>
  );
}
