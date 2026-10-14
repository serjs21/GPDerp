"use client";

import { useCopy } from "@/hooks/useCopy";
import { useHaikuActionsOpenPreference } from "@/hooks/useHaikuActionsOpenPreference";
import { useLazyDialog } from "@/hooks/useLazyDialog";
import { formatHaikuPlainToText } from "@/utils/strings";
import { HaikuActionButtons } from "./HaikuActionButtons";
import type { HaikuActionId, SavedHaikuActionsProps } from "./HaikuActions.types";
import { HaikuActionsPanel } from "./HaikuActionsPanel";
import { HaikuActionsToggle } from "./HaikuActionsToggle";
import { HaikuClapBurst } from "./HaikuClapBurst";
import { loadCreateAddLabelsModal, loadShareModal, preloadHaikuActionModals } from "./haikuActionModalsLazy";
import { SavedHaikuActionModals } from "./SavedHaikuActionModals";
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
  const share = useLazyDialog(loadShareModal);
  const labels = useLazyDialog(loadCreateAddLabelsModal);
  const { deleteOpen, setDeleteOpen, deleting, handleDeleteConfirm } = useHaikuDelete({
    haiku,
    onDelete,
    onDeleted,
  });
  const { toggleWrapRef, clapPosition, clapFading, playClap } = useClapBurst();
  const { copy } = useCopy();
  const { isOpen, setOpenPreference } = useHaikuActionsOpenPreference(forcedOpen);
  const modalBlocking = share.open || labels.open || deleteOpen;
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
        share.requestOpen();
        break;
      case "label":
        labels.requestOpen();
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
          onHover={(id) => {
            preloadHaikuActionModals();
            setHoverIfLive(id);
          }}
          onFocusHover={(id, target) => {
            preloadHaikuActionModals();
            setHoverFromFocus(id, target);
          }}
          onBlur={clearHoverFromBlur}
          onAction={onActionClick}
        />
      </HaikuActionsPanel>
      <SavedHaikuActionModals
        haiku={haiku}
        share={share}
        labels={labels}
        onChanged={onChanged}
        deleteDialog={{
          open: deleteOpen,
          onOpenChange: setDeleteOpen,
          onConfirm: handleDeleteConfirm,
          confirming: deleting,
        }}
      />
    </>
  );
}
