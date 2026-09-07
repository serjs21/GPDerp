"use client";

import { WarningOutlined } from "@ant-design/icons";
import { useState, type CSSProperties } from "react";
import type { LabelDto } from "@/api/labels";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import {
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { COMIC_PANEL_COLORS } from "@/components/ComicPageLayout/comicPagePresets";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { useConfirm } from "@/hooks/useConfirm";
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
  const { openConfirm } = useConfirm();
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });
  const shape = resolveComicLabelShapePreset(label.shape);

  const openDeleteConfirm = () => {
    openConfirm({
      title: "Delete this label?",
      content: "This action cannot be undone.",
      okText: "Delete",
      danger: true,
      cancelText: "Cancel",
      icon: <WarningOutlined style={{ color: "var(--accent-red)" }} />,
      onOk: async () => {
        await deleteLabel({
          labelId: label.id,
          onSuccess: async () => {
            comicToast.success("Label deleted");
            onChanged?.();
          },
          onError: async () => {
            comicToast.error("Could not delete label");
          },
        });
      },
    });
  };

  const editHoverStyle = {
    "--manage-label-hover-fill": EDIT_HOVER,
  } as CSSProperties;

  const deleteHoverStyle = {
    "--manage-label-hover-fill": DELETE_HOVER,
  } as CSSProperties;

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

        <ComicPagePanel
          selectable
          selected
          background="solid"
          color="white"
          flexWeight={1}
          className={[styles.actionPanel, styles.editPanel].join(" ")}
          style={editHoverStyle}
          ariaLabel={`Edit ${label.name}`}
          onSelect={() => setEditOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
          <img
            className={styles.actionIcon}
            src="/panel_actions/edit.svg"
            alt=""
            draggable={false}
          />
        </ComicPagePanel>

        <ComicPagePanel
          selectable
          selected
          background="solid"
          color="white"
          flexWeight={1}
          className={[styles.actionPanel, styles.deletePanel].join(" ")}
          style={deleteHoverStyle}
          ariaLabel={`Delete ${label.name}`}
          onSelect={openDeleteConfirm}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
          <img
            className={styles.actionIcon}
            src="/panel_actions/delete.svg"
            alt=""
            draggable={false}
          />
        </ComicPagePanel>
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
    </article>
  );
}
