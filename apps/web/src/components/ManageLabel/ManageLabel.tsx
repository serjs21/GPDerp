"use client";

import { useCallback, useState } from "react";
import type { LabelDto } from "@/api/labels";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { COMIC_PANEL_COLORS } from "@/components/ComicPageLayout/comicPagePresets";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SVGPanelActionButton } from "@/components/SVGPanelActionButton";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import styles from "./ManageLabel.module.css";

export type ManageLabelProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
};

const EDIT_HOVER = COMIC_PANEL_COLORS.info.base;
const DELETE_HOVER = "var(--accent-red, #aa1f3f)";

export function ManageLabel({ accountId, label, onChanged }: ManageLabelProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });
  const shape = resolveComicLabelShapePreset(label.shape);

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

  return (
    <article className={styles.root}>
      <ComicPageRow className={styles.strip}>
        <ComicPagePanel
          background="solid"
          color="white"
          overflowVisible
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

        <SVGPanelActionButton
          src="/panel_actions/edit.svg"
          label="Edit"
          ariaLabel={`Edit ${label.name}`}
          hoverFill={EDIT_HOVER}
          onSelect={() => setEditOpen(true)}
          className={styles.actionSlot}
        />

        <SVGPanelActionButton
          src="/panel_actions/delete.svg"
          label="Delete"
          ariaLabel={`Delete ${label.name}`}
          hoverFill={DELETE_HOVER}
          invertIconOnHover
          onSelect={() => setDeleteOpen(true)}
          className={styles.actionSlot}
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
