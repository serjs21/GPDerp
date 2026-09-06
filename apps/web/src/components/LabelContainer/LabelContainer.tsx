"use client";

import { DeleteOutlined, EditOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "@/components/StyledComponents";
import { useState } from "react";
import type { LabelDto } from "@/api/labels";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { useConfirm } from "@/hooks/useConfirm";
import styles from "./LabelContainer.module.css";

export type LabelContainerProps = {
  accountId: string;
  label: LabelDto;
  onChanged?: () => void;
};

export function LabelContainer({ accountId, label, onChanged }: LabelContainerProps) {
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

  return (
    <article className={styles.root}>
      <div className={styles.actions}>
        <Tooltip title="Edit">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditOpen(true)} />
        </Tooltip>
        <Tooltip title="Delete">
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={openDeleteConfirm} />
        </Tooltip>
      </div>
      <ComicBurstLabel
        text={formatComicLabelText(label.name)}
        fill={label.color || "#888888"}
        shapeKind={shape.kind}
        spikeCount={shape.spikeCount}
        randomness={shape.randomness}
        seed={shape.id}
        fontSize={20}
      />
      <div className={styles.meta}>{new Date(label.createdAt).toLocaleString()}</div>
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
