"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import styles from "./FilterManageLabelsModal.module.css";

export type FilterManageLabelsModalProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  selectedIds: string[];
  onApply: (ids: string[]) => void;
};

function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

export function FilterManageLabelsModal({
  open,
  onClose,
  accountId,
  selectedIds,
  onApply,
}: FilterManageLabelsModalProps) {
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setDraftIds(selectedIds);
    }
    wasOpen.current = open;
  }, [open, selectedIds]);

  const applyDraft = useCallback(
    (ids: string[] = draftIds) => {
      if (sameIdSet(ids, selectedIds)) return;
      onApply(ids);
    },
    [draftIds, onApply, selectedIds],
  );

  const submitFilter = (ids: string[]) => {
    setDraftIds(ids);
    onApply(ids);
    onClose();
  };

  const handleDismiss = () => {
    applyDraft();
    onClose();
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleDismiss();
      }}
    >
      <div className={styles.body}>
        <div className={styles.contentSlot}>
          <ComicLabelPickerPanel
            active={open}
            accountId={accountId}
            seedLabelIds={draftIds}
            footerLabel="Done"
            onFooter={submitFilter}
            onSelectionChange={setDraftIds}
          />
        </div>
      </div>
    </ComicPageDialog>
  );
}
