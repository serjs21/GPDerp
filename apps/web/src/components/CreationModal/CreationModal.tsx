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
};

export function CreationModal({
  open,
  onKeepScrolling,
  onGoToHaiku,
  generatingDraft = null,
  haiku = null,
}: CreationModalProps) {
  const ariaLabel = generatingDraft
    ? `Generating haiku: ${generatingDraft.subject}`
    : haiku
      ? `Haiku lantern: ${haiku.title ?? ""}`
      : "Haiku creation";

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
        <div
          className={styles.flyIn}
          key={generatingDraft?.requestId ?? haiku?.id ?? "lantern"}
        >
          <LanternFrame
            ariaLabel={ariaLabel}
            widthRem={CREATION_LANTERN_WIDTH_REM}
            transform={CREATION_LANTERN_TRANSFORM}
            generating={Boolean(generatingDraft)}
          >
            {generatingDraft ? (
              <Lantern generatingDraft={generatingDraft} showActions={false} />
            ) : haiku ? (
              <Lantern haiku={haiku} showActions={false} />
            ) : null}
          </LanternFrame>
        </div>
      </div>
    </PathOverlay>
  );
}
