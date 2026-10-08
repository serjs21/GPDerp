"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import styles from "./LabelsFilterModal.module.css";

export type LabelsFilterApplyPayload = {
  includeIds: string[];
  excludeIds: string[];
};

export type LabelsFilterModalProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  includeIds: string[];
  excludeIds: string[];
  onApply: (next: LabelsFilterApplyPayload) => void;
};

function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

export function LabelsFilterModal({
  open,
  onClose,
  accountId,
  includeIds,
  excludeIds,
  onApply,
}: LabelsFilterModalProps) {
  const t = useTranslations("LabelsFilterModal");
  const [draftIncludeIds, setDraftIncludeIds] = useState<string[]>(includeIds);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraftIncludeIds(includeIds);
  }

  // Exclusions are no longer editable here; pass the current ones through unchanged.
  const applyInclude = useCallback(
    (nextIncludeIds: string[]) => {
      if (sameIdSet(nextIncludeIds, includeIds)) return;
      onApply({ includeIds: nextIncludeIds, excludeIds });
    },
    [excludeIds, includeIds, onApply],
  );

  const submitFilter = (ids: string[]) => {
    setDraftIncludeIds(ids);
    onApply({ includeIds: ids, excludeIds });
    onClose();
  };

  const handleDismiss = () => {
    applyInclude(draftIncludeIds);
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
          <div className={styles.tabPane}>
            <ComicLabelPickerPanel
              active={open}
              accountId={accountId}
              seedLabelIds={draftIncludeIds}
              footerLabel={t("filter")}
              onFooter={submitFilter}
              onSelectionChange={setDraftIncludeIds}
            />
          </div>
        </div>
      </div>
    </ComicPageDialog>
  );
}
