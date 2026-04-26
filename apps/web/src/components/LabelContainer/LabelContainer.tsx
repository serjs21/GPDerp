"use client";

import { DeleteOutlined, EditOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, message, Tooltip } from "@/components/StyledComponents";
import { useState } from "react";
import type { LabelDto } from "@/api/labels";
import { CreateLabelModal } from "@/components/CreateLabelModal/CreateLabelModal";
import { Label } from "@/components/Label/Label";
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
            message.success("Label deleted");
            onChanged?.();
          },
          onError: async () => {
            message.error("Could not delete label");
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
      <Label name={label.name} color={label.color} />
      <div className={styles.meta}>{new Date(label.createdAt).toLocaleString()}</div>
      <CreateLabelModal
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
