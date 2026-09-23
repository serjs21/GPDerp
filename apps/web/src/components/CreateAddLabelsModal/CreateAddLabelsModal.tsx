"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LabelDto } from "@/api/labels";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicLabelPickerPanel } from "@/components/ComicLabelPickerPanel";
import { ComicPageDialog } from "@/components/ComicPageLayout";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import { comicToast } from "@/components/ComicToast";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { HAIKU_LABELS_MAX } from "@/components/LabelHalo/consts/labelHaloConsts";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { enqueueLabelBeltPuffIn } from "@/components/Lantern/utils/labelBeltEnterQueue";
import styles from "./CreateAddLabelsModal.module.css";

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
      const capped = ids.slice(0, HAIKU_LABELS_MAX);
      if (capped.length < ids.length) {
        comicToast.error(`A haiku can have at most ${HAIKU_LABELS_MAX} labels`);
      }
      if (sameIdSet(capped, addSeedIds)) {
        if (options?.closeOnSuccess) onClose();
        return;
      }
      void setHaikuLabels({
        haikuId: haiku.id,
        labelIds: capped,
        onSuccess: async () => {
          const previous = new Set(addSeedIds);
          const addedInSelectionOrder = capped.filter((id) => !previous.has(id));
          enqueueLabelBeltPuffIn(addedInSelectionOrder);
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
        <ComicPanelTabs
          className={styles.methodRow}
          panelClassName={styles.methodPanel}
          value={tab}
          onChange={selectTab}
          tabs={[
            {
              id: "create",
              panel: {
                background: "sunburst",
                color: "purple",
                title: "Create",
                ariaLabel: "Create a new one",
              },
              content: (
                <LabelMethodIcon
                  src="/panel_actions/create_new.svg"
                  bubbleStyle="pointedArcs"
                  sourceDirection="none"
                  active={tab === "create"}
                />
              ),
            },
            {
              id: "add",
              panel: {
                background: "halftone",
                color: "darkGreen",
                title: "Add",
                ariaLabel: "Add labels to this haiku",
              },
              content: (
                <LabelMethodIcon
                  src="/label_modal/tag.svg"
                  bubbleStyle="diamond"
                  sourceDirection="none"
                  active={tab === "add"}
                />
              ),
            },
          ]}
        />

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
              maxSelected={HAIKU_LABELS_MAX}
            />
          )}
        </div>
      </div>
    </ComicPageDialog>
  );
}
