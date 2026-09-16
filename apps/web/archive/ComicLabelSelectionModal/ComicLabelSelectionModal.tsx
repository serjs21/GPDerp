"use client";

import { useMemo } from "react";
import type { HaikuDto } from "@/api/haikus";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import styles from "./ComicLabelSelectionModal.module.css";

type ComicLabelSelectionModalBase = {
  open: boolean;
  onClose: () => void;
};

export type ComicLabelSelectionAssignProps = ComicLabelSelectionModalBase & {
  mode?: "assign";
  haiku: HaikuDto;
  onSaved?: () => void;
  accountId?: never;
  selectedIds?: never;
  onApply?: never;
};

export type ComicLabelSelectionFilterProps = ComicLabelSelectionModalBase & {
  mode: "filter";
  accountId: string;
  selectedIds: string[];
  onApply: (ids: string[]) => void;
  haiku?: never;
  onSaved?: never;
};

export type ComicLabelSelectionModalProps =
  | ComicLabelSelectionAssignProps
  | ComicLabelSelectionFilterProps;

/**
 * Standalone assign/filter picker (archive / Storybook).
 * Prefer FilterManageLabelsModal or CreateAddLabelsModal for product entry points.
 */
export function ComicLabelSelectionModal(props: ComicLabelSelectionModalProps) {
  const { open, onClose } = props;
  const isFilter = props.mode === "filter";
  const accountId = isFilter ? props.accountId : props.haiku.accountId;
  const filterSelectedIds = isFilter ? props.selectedIds : null;
  const assignHaiku = isFilter ? null : props.haiku;

  const seedLabelIds = useMemo(() => {
    if (filterSelectedIds !== null) return filterSelectedIds;
    return [...(assignHaiku?.labels ?? [])].map((l) => l.id).reverse();
  }, [filterSelectedIds, assignHaiku]);

  const knownLabels = useMemo(() => {
    if (!assignHaiku) return [];
    return assignHaiku.labels.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      shape: l.shape,
    }));
  }, [assignHaiku]);

  const { setHaikuLabels, isSettingLabels } = useAccountLabels({
    accountId,
    autofetch: false,
  });

  const onFooter = (ids: string[]) => {
    if (isFilter) {
      props.onApply(ids);
      onClose();
      return;
    }
    void setHaikuLabels({
      haikuId: props.haiku.id,
      labelIds: ids,
      onSuccess: async () => {
        comicToast.success("Labels saved");
        props.onSaved?.();
        onClose();
      },
      onError: async () => {
        comicToast.error("Could not save labels");
      },
    });
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      title={isFilter ? "Filter labels" : "Labels"}
      className={styles.pageShell}
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        <ComicLabelPickerPanel
          active={open}
          accountId={accountId}
          seedLabelIds={seedLabelIds}
          knownLabels={knownLabels}
          footerLabel={isFilter ? "Done" : "Save"}
          onFooter={onFooter}
          footerBusy={!isFilter && isSettingLabels}
        />
      </div>
    </ComicPageDialog>
  );
}
