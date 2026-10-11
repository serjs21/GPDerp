"use client";

import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { PathOverlay } from "@/components/PathOverlay";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { withDefaults } from "@/utils/props/withDefaults";
import { CreationLantern } from "./CreationLantern";
import { useCreationLanternSession } from "./useCreationLanternSession";
import { creationFlyInKey, creationLanternAriaLabel } from "./utils/creationModalUtils";
import styles from "./CreationModal.module.css";

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

const CREATION_MODAL_DEFAULTS = {
  isGenerating: false,
  showLanternActions: false,
  showLantern: true,
} as const;

export function CreationModal(props: CreationModalProps) {
  const { isGenerating, showLanternActions, showLantern } = withDefaults(props, CREATION_MODAL_DEFAULTS);
  const { open, onKeepScrolling, onGoToHaiku, generatingDraft, haiku, lanternSessionKey } = props;
  const t = useTranslations("CreationModal");
  const { activeHaiku, overlayOpen, startExit, finishExit } = useCreationLanternSession(open, haiku);

  const handleDeleted = (deleted: HaikuDto) => {
    startExit(deleted);
    props.onHaikuDeleted?.(deleted);
  };

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
          <div
            className={styles.flyIn}
            key={creationFlyInKey(lanternSessionKey, generatingDraft, activeHaiku)}
          >
            <CreationLantern
              activeHaiku={activeHaiku}
              generatingDraft={generatingDraft}
              isGenerating={isGenerating}
              showLanternActions={showLanternActions}
              ariaLabel={creationLanternAriaLabel(t, generatingDraft, activeHaiku)}
              onDeleted={handleDeleted}
              onExitComplete={finishExit}
              onHaikuDeleteFailed={props.onHaikuDeleteFailed}
              onHaikuChanged={props.onHaikuChanged}
            />
          </div>
        ) : null}
      </div>
    </PathOverlay>
  );
}
