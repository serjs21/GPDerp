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
import { OverlayTitle } from "@/components/OverlayTitle";
import { SVGPanelActionButton } from "@/components/SVGPanelActionButton";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
import styles from "./ManageLabel.module.css";

export type ManageLabelProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
};

const DELETE_HOVER = "var(--accent-red, #aa1f3f)";

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

  const handleCheckThemOut = useCallback(() => {
    setSelectedLabelIds([label.id]);
    router.push("/");
  }, [label.id, router, setSelectedLabelIds]);

  const labelPreview = (
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
  );

  const connectedPanel = (
    <ConnectedHaikusPanel
      accountId={accountId}
      labelName={label.name}
      items={connectedItems}
      total={connectedTotal}
    />
  );

  return (
    <article className={styles.root}>
      <ComicPageRow className={styles.strip}>
        <OverlayTitle title="Edit" direction="bottom" className={styles.overlaySlot}>
          <button
            type="button"
            className={styles.panelButton}
            onClick={() => setEditOpen(true)}
            aria-label={`Edit ${label.name}`}
          >
            {labelPreview}
          </button>
        </OverlayTitle>

        {hasConnections ? (
          <OverlayTitle
            title="Check them out"
            direction="bottom"
            className={[styles.overlaySlot, styles.overlaySlotFan].join(" ")}
          >
            <button
              type="button"
              className={styles.panelButton}
              onClick={handleCheckThemOut}
              aria-label={`View haikus labeled ${label.name}`}
            >
              {connectedPanel}
            </button>
          </OverlayTitle>
        ) : (
          <div className={styles.overlaySlot}>{connectedPanel}</div>
        )}

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
