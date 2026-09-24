"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import styles from "./LabelsFilterModal.module.css";

export type LabelsFilterTab = "see" | "exclude";

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

function sameFilter(
  a: LabelsFilterApplyPayload,
  b: LabelsFilterApplyPayload,
): boolean {
  return (
    sameIdSet(a.includeIds, b.includeIds) &&
    sameIdSet(a.excludeIds, b.excludeIds)
  );
}

export function LabelsFilterModal({
  open,
  onClose,
  accountId,
  includeIds,
  excludeIds,
  onApply,
}: LabelsFilterModalProps) {
  const [tab, setTab] = useState<LabelsFilterTab>("see");
  const [draftIncludeIds, setDraftIncludeIds] = useState<string[]>(includeIds);
  const [draftExcludeIds, setDraftExcludeIds] = useState<string[]>(excludeIds);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setTab("see");
      const includeSet = new Set(includeIds);
      const safeExclude = excludeIds.filter((id) => !includeSet.has(id));
      setDraftIncludeIds(includeIds);
      setDraftExcludeIds(safeExclude);
    }
    wasOpen.current = open;
  }, [open, includeIds, excludeIds]);

  const applyDraft = useCallback(
    (next: LabelsFilterApplyPayload = {
      includeIds: draftIncludeIds,
      excludeIds: draftExcludeIds,
    }) => {
      if (
        sameFilter(next, { includeIds, excludeIds })
      ) {
        return;
      }
      onApply(next);
    },
    [draftExcludeIds, draftIncludeIds, excludeIds, includeIds, onApply],
  );

  const submitFilter = (next: LabelsFilterApplyPayload) => {
    setDraftIncludeIds(next.includeIds);
    setDraftExcludeIds(next.excludeIds);
    onApply(next);
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
        <ComicPanelTabs
          className={styles.methodRow}
          panelClassName={styles.methodPanel}
          value={tab}
          onChange={setTab}
          aria-label="Label filter mode"
          tabs={[
            {
              id: "see",
              panel: {
                background: "sunburst",
                color: "blue",
                title: "See",
                ariaLabel: "See",
              },
              content: (
                <LabelMethodIcon
                  src="/labels_filter_modal/watch.svg"
                  bubbleStyle="rectangle"
                  sourceDirection="none"
                  active={tab === "see"}
                />
              ),
            },
            {
              id: "exclude",
              panel: {
                background: "halftone",
                color: "purple",
                title: "Or not to see",
                ariaLabel: "Or not to see",
              },
              content: (
                <LabelMethodIcon
                  src="/labels_filter_modal/ignore.svg"
                  bubbleStyle="pointedArcs"
                  sourceDirection="none"
                  active={tab === "exclude"}
                />
              ),
            },
          ]}
        />

        <div className={styles.contentSlot}>
          <div className={styles.tabPane}>
            {tab === "see" ? (
              <ComicLabelPickerPanel
                active={open && tab === "see"}
                accountId={accountId}
                seedLabelIds={draftIncludeIds}
                disabledIds={draftExcludeIds}
                footerLabel="Done"
                onFooter={(ids) =>
                  submitFilter({
                    includeIds: ids,
                    excludeIds: draftExcludeIds,
                  })
                }
                onSelectionChange={setDraftIncludeIds}
              />
            ) : (
              <ComicLabelPickerPanel
                active={open && tab === "exclude"}
                accountId={accountId}
                seedLabelIds={draftExcludeIds}
                disabledIds={draftIncludeIds}
                footerLabel="Done"
                onFooter={(ids) =>
                  submitFilter({
                    includeIds: draftIncludeIds,
                    excludeIds: ids,
                  })
                }
                onSelectionChange={setDraftExcludeIds}
              />
            )}
          </div>
        </div>
      </div>
    </ComicPageDialog>
  );
}
