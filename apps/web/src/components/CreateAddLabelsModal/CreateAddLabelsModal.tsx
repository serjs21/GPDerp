"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LabelDto } from "@/api/labels";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import styles from "./CreateAddLabelsModal.module.css";

const SELECTED_PANEL_WEIGHT = 1.25;
const UNSELECTED_PANEL_WEIGHT = 0.75;

export type CreateAddLabelsTab = "create" | "add";

export type CreateAddLabelsModalProps = {
  open: boolean;
  onClose: () => void;
  haiku: HaikuDto;
  initialTab?: CreateAddLabelsTab;
  onSaved?: () => void;
  onCreated?: (label: LabelDto) => void;
};

function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

export function CreateAddLabelsModal({
  open,
  onClose,
  haiku,
  initialTab = "add",
  onSaved,
  onCreated,
}: CreateAddLabelsModalProps) {
  const [tab, setTab] = useState<CreateAddLabelsTab>(initialTab);
  /** Bump when a label is created so Add picker re-seeds / refreshes. */
  const [addEpoch, setAddEpoch] = useState(0);

  const accountId = haiku.accountId;

  const { setHaikuLabels, isSettingLabels } = useAccountLabels({
    accountId,
    autofetch: false,
  });

  const addSeedIds = useMemo(
    () => [...haiku.labels].map((l) => l.id).reverse(),
    [haiku.labels],
  );

  const [draftIds, setDraftIds] = useState<string[]>(addSeedIds);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setTab(initialTab);
      setAddEpoch(0);
      setDraftIds(addSeedIds);
    }
    wasOpen.current = open;
  }, [open, initialTab, addSeedIds]);

  const knownAddLabels = useMemo(
    () =>
      haiku.labels.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        shape: l.shape,
      })),
    [haiku.labels],
  );

  const flushAdd = useCallback(
    (ids: string[], options?: { closeOnSuccess?: boolean }) => {
      if (sameIdSet(ids, addSeedIds)) {
        if (options?.closeOnSuccess) onClose();
        return;
      }
      void setHaikuLabels({
        haikuId: haiku.id,
        labelIds: ids,
        onSuccess: async () => {
          comicToast.success("Labels saved");
          onSaved?.();
          if (options?.closeOnSuccess) onClose();
        },
        onError: async () => {
          comicToast.error("Could not save labels");
        },
      });
    },
    [addSeedIds, haiku.id, onClose, onSaved, setHaikuLabels],
  );

  const handleCreated = (label: LabelDto) => {
    onCreated?.(label);
    setAddEpoch((n) => n + 1);
    setTab("add");
  };

  const submitAdd = (ids: string[]) => {
    setDraftIds(ids);
    flushAdd(ids, { closeOnSuccess: true });
  };

  const selectTab = (next: CreateAddLabelsTab) => {
    if (next === tab) return;
    if (tab === "add") {
      flushAdd(draftIds);
    }
    setTab(next);
  };

  const handleDismiss = () => {
    flushAdd(draftIds, { closeOnSuccess: true });
    if (sameIdSet(draftIds, addSeedIds)) {
      onClose();
    }
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
        <ComicPageRow className={styles.methodRow}>
          <ComicPagePanel
            selectable
            selected={tab === "create"}
            onSelect={() => selectTab("create")}
            background="sunburst"
            color="purple"
            title="Create"
            isMotionBackground={false}
            shine={false}
            sunburstHalftone={false}
            overflowVisible
            flexWeight={tab === "create" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Create a new label"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/panel_actions/create_new.svg"
              bubbleStyle="pointedArcs"
              sourceDirection="none"
              active={tab === "create"}
            />
          </ComicPagePanel>
          <ComicPagePanel
            selectable
            selected={tab === "add"}
            onSelect={() => selectTab("add")}
            background="halftone"
            color="darkGreen"
            title="Add"
            overflowVisible
            flexWeight={tab === "add" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Add labels to this haiku"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/label_modal/tag.svg"
              bubbleStyle="diamond"
              sourceDirection="none"
              active={tab === "add"}
            />
          </ComicPagePanel>
        </ComicPageRow>

        <div className={styles.contentSlot}>
          {tab === "create" ? (
            <ComicLabelCreationModal
              embedded
              open={open && tab === "create"}
              accountId={accountId}
              onClose={handleDismiss}
              onCreated={handleCreated}
            />
          ) : (
            <ComicLabelPickerPanel
              key={`add-${addEpoch}`}
              active={open && tab === "add"}
              accountId={accountId}
              seedLabelIds={draftIds}
              knownLabels={knownAddLabels}
              footerLabel="Save"
              onFooter={submitAdd}
              onSelectionChange={setDraftIds}
              footerBusy={isSettingLabels}
            />
          )}
        </div>
      </div>
    </ComicPageDialog>
  );
}
