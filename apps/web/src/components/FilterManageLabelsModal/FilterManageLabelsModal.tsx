"use client";

import { useEffect, useState } from "react";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { ManageLabelsPanel } from "@/components/ManageLabel";
import styles from "./FilterManageLabelsModal.module.css";

const SELECTED_PANEL_WEIGHT = 1.25;
const UNSELECTED_PANEL_WEIGHT = 0.75;

export type FilterManageLabelsTab = "filter" | "manage";

export type FilterManageLabelsModalProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  initialTab?: FilterManageLabelsTab;
  selectedIds: string[];
  onApply: (ids: string[]) => void;
};

export function FilterManageLabelsModal({
  open,
  onClose,
  accountId,
  initialTab = "filter",
  selectedIds,
  onApply,
}: FilterManageLabelsModalProps) {
  const [tab, setTab] = useState<FilterManageLabelsTab>(initialTab);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
  }, [open, initialTab]);

  const submitFilter = (ids: string[]) => {
    onApply(ids);
    onClose();
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        <ComicPageRow className={styles.methodRow}>
          <ComicPagePanel
            selectable
            selected={tab === "filter"}
            onSelect={() => setTab("filter")}
            background="sunburst"
            color="teal"
            title="Filter"
            isMotionBackground={false}
            shine={false}
            sunburstHalftone={false}
            overflowVisible
            flexWeight={tab === "filter" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Filter haikus by labels"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/label_modal/filter.svg"
              bubbleStyle="pointedArcs"
              sourceDirection="none"
              active={tab === "filter"}
            />
          </ComicPagePanel>
          <ComicPagePanel
            selectable
            selected={tab === "manage"}
            onSelect={() => setTab("manage")}
            background="halftone"
            color="orange"
            title="Manage"
            overflowVisible
            flexWeight={tab === "manage" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Manage account labels"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/label_modal/tag.svg"
              bubbleStyle="rectangle"
              sourceDirection="none"
              active={tab === "manage"}
            />
          </ComicPagePanel>
        </ComicPageRow>

        <div className={styles.contentSlot}>
          {tab === "filter" ? (
            <ComicLabelPickerPanel
              active={open && tab === "filter"}
              accountId={accountId}
              seedLabelIds={selectedIds}
              footerLabel="Done"
              onFooter={submitFilter}
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
