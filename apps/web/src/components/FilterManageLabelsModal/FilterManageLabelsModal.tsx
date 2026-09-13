"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { ManageLabelsPanel } from "@/components/ManageLabel";
import styles from "./FilterManageLabelsModal.module.css";

export type FilterManageLabelsTab = "filter" | "manage";

export type FilterManageLabelsModalProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  initialTab?: FilterManageLabelsTab;
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
  initialTab = "filter",
  selectedIds,
  onApply,
}: FilterManageLabelsModalProps) {
  const [tab, setTab] = useState<FilterManageLabelsTab>(initialTab);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setTab(initialTab);
      setDraftIds(selectedIds);
    }
    wasOpen.current = open;
  }, [open, initialTab, selectedIds]);

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

  const selectTab = (next: FilterManageLabelsTab) => {
    if (next === tab) return;
    if (tab === "filter") {
      applyDraft();
    }
    setTab(next);
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
          onChange={selectTab}
          tabs={[
            {
              id: "filter",
              panel: {
                background: "sunburst",
                color: "blue",
                title: "Filter",
                ariaLabel: "Filter haikus by labels",
              },
              content: (
                <LabelMethodIcon
                  src="/panel_actions/filter_label.svg"
                  bubbleStyle="diamond"
                  sourceDirection="none"
                  active={tab === "filter"}
                />
              ),
            },
            {
              id: "manage",
              panel: {
                background: "halftone",
                color: "green",
                title: "Manage",
                ariaLabel: "Manage account labels",
              },
              content: (
                <LabelMethodIcon
                  src="/panel_actions/manage.svg"
                  bubbleStyle="thought"
                  sourceDirection="none"
                  active={tab === "manage"}
                />
              ),
            },
          ]}
        />

        <div className={styles.contentSlot}>
          {tab === "filter" ? (
            <ComicLabelPickerPanel
              active={open && tab === "filter"}
              accountId={accountId}
              seedLabelIds={draftIds}
              footerLabel="Done"
              onFooter={submitFilter}
              onSelectionChange={setDraftIds}
            />
          ) : (
            <ManageLabelsPanel
              accountId={accountId}
              active={open && tab === "manage"}
              searchVariant="comic"
              showCreate
            />
          )}
        </div>
      </div>
    </ComicPageDialog>
  );
}
