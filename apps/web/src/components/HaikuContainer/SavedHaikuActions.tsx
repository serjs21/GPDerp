"use client";

import { useState } from "react";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { useCopy } from "@/hooks/useCopy";
import { useHaikuActionsOpenPreference } from "@/hooks/useHaikuActionsOpenPreference";
import { formatHaikuPlainToText, formatHaikuTitle } from "@/utils/strings";
import { HaikuActionButtons } from "./HaikuActionButtons";
import type { HaikuActionId, SavedHaikuActionsProps } from "./HaikuActions.types";
import { HaikuActionsPanel } from "./HaikuActionsPanel";
import { HaikuActionsToggle } from "./HaikuActionsToggle";
import { HaikuClapBurst } from "./HaikuClapBurst";
import { useClapBurst } from "./useClapBurst";
import { useHaikuActionsHover } from "./useHaikuActionsHover";
import { useHaikuDelete } from "./useHaikuDelete";

/** Toggle + actions panel for a saved haiku, and the share / labels / delete modals it opens. */
export function SavedHaikuActions({
  haiku,
  onDeleted,
  onChanged,
  onDelete,
  forcedHover,
  forcedOpen,
}: SavedHaikuActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const { deleteOpen, setDeleteOpen, deleting, handleDeleteConfirm } = useHaikuDelete({
    haiku,
    onDelete,
    onDeleted,
  });
  const { toggleWrapRef, clapPosition, clapFading, playClap } = useClapBurst();
  const { copy } = useCopy();
  const { isOpen, setOpenPreference } = useHaikuActionsOpenPreference(forcedOpen);
  const modalBlocking = shareOpen || labelsOpen || deleteOpen;
  const { activeHover, setHoverIfLive, clearHover, setHoverFromFocus, clearHoverFromBlur } =
    useHaikuActionsHover(forcedHover, modalBlocking);

  const handleToggle = () => {
    const next = !isOpen;
    if (next) playClap();
    setOpenPreference(next);
  };

  const onActionClick = (id: HaikuActionId) => {
    clearHover();
    switch (id) {
      case "delete":
        setDeleteOpen(true);
        break;
      case "share":
        setShareOpen(true);
        break;
      case "label":
        setLabelsOpen(true);
        break;
      case "copy":
        void copy(formatHaikuPlainToText(haiku));
        break;
    }
  };

  return (
    <>
      <HaikuActionsToggle wrapRef={toggleWrapRef} isOpen={isOpen} onToggle={handleToggle} />
      <HaikuClapBurst position={clapPosition} fading={clapFading} />
      <HaikuActionsPanel open={isOpen && !modalBlocking} onMouseLeave={clearHover}>
        <HaikuActionButtons
          activeHover={activeHover}
          onHover={setHoverIfLive}
          onFocusHover={setHoverFromFocus}
          onBlur={clearHoverFromBlur}
          onAction={onActionClick}
        />
      </HaikuActionsPanel>
      <ShareModal
        haikuId={haiku.id}
        haikuSubject={formatHaikuTitle(haiku)}
        haiku={haiku}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
      <CreateAddLabelsModal
        open={labelsOpen}
        haiku={haiku}
        initialTab="add"
        onClose={() => setLabelsOpen(false)}
        onSaved={onChanged}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        confirming={deleting}
      />
    </>
  );
}
