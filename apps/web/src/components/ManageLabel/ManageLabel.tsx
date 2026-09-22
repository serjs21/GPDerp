"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { LabelDto } from "@/api/labels";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
import { LabelActions } from "./LabelActions";
import styles from "./ManageLabel.module.css";

export type ManageLabelProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
};

export function ManageLabel({ accountId, label, onChanged }: ManageLabelProps) {
  const router = useRouter();
  const { setSelectedLabelIds } = useHaikuFilters();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });
  const shape = resolveComicLabelShapePreset(label.shape);

  const connectedTotal = label.connectedHaikus?.total ?? 0;
  const connectedItems = label.connectedHaikus?.items ?? [];
  const hasConnections = connectedTotal > 0;

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteLabel({
        labelId: label.id,
        onSuccess: async () => {
          comicToast.success("Label deleted");
          onChanged?.();
          setDeleteOpen(false);
        },
        onError: async () => {
          comicToast.error("Could not delete label");
        },
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteLabel, label.id, onChanged]);

  const handleTuneIn = useCallback(() => {
    setSelectedLabelIds([label.id]);
    router.push("/");
  }, [label.id, router, setSelectedLabelIds]);

  return (
    <article className={styles.root}>
      <ComicPageRow className={styles.strip}>
        <div className={styles.labelSlot}>
          <ComicPagePanel
            background="solid"
            color="white"
            flexWeight={1}
            className={styles.labelPanel}
            ariaLabel={label.name}
          >
            <div className={styles.labelPreview}>
              <ComicBurstLabel
                text={formatComicLabelText(label.name)}
                fill={label.color || "#888888"}
                shapeKind={shape.kind}
                spikeCount={shape.spikeCount}
                randomness={shape.randomness}
                seed={shape.id}
                fontSize={20}
              />
            </div>
          </ComicPagePanel>
        </div>

        <div className={styles.connectedSlot}>
          <ConnectedHaikusPanel
            accountId={accountId}
            labelName={label.name}
            items={connectedItems}
            total={connectedTotal}
          />
        </div>

        <LabelActions
          className={styles.actionSlot}
          labelName={label.name}
          hasConnections={hasConnections}
          onTuneIn={handleTuneIn}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </ComicPageRow>

      <ComicLabelCreationModal
        open={editOpen}
        accountId={accountId}
        label={label}
        onClose={() => setEditOpen(false)}
        onUpdated={async () => {
          onChanged?.();
        }}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        confirming={deleting}
        question="Delete this label?"
        cancelLabel="Not yet"
        confirmLabel="Delete"
      />
    </article>
  );
}
