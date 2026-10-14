"use client";

import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { formatHaikuTitle } from "@/utils/strings";
import type { SavedHaikuActionModalsProps } from "./SavedHaikuActionModals.types";

/** Share / labels (code-split, mounted on first open) and delete modals for a saved haiku. */
export function SavedHaikuActionModals({ haiku, share, labels, onChanged, deleteDialog }: SavedHaikuActionModalsProps) {
  const ShareModal = share.Component;
  const CreateAddLabelsModal = labels.Component;
  return (
    <>
      {ShareModal ? (
        <ShareModal
          haikuId={haiku.id}
          haikuSubject={formatHaikuTitle(haiku)}
          haiku={haiku}
          open={share.open}
          onClose={() => share.setOpen(false)}
        />
      ) : null}
      {CreateAddLabelsModal ? (
        <CreateAddLabelsModal
          open={labels.open}
          haiku={haiku}
          initialTab="add"
          onClose={() => labels.setOpen(false)}
          onSaved={onChanged}
        />
      ) : null}
      <DeleteConfirmModal {...deleteDialog} />
    </>
  );
}
