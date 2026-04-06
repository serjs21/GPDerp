"use client";

import { DeleteOutlined, ShareAltOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, message, Modal, Tooltip } from "antd";
import axios from "axios";
import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import styles from "./HaikuContainer.module.css";

export type HaikuContainerProps = {
  haiku: HaikuDto;
  onDeleted?: () => void;
};

function formatHaikuTitle(h: HaikuDto): string {
  if (h.titleSuffix <= 0) return h.title;
  return `${h.title} (${h.titleSuffix})`;
}

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function HaikuContainer({ haiku, onDeleted }: HaikuContainerProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const openDeleteConfirm = () => {
    Modal.confirm({
      title: "Delete this haiku?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      closable: true,
      icon: <WarningOutlined style={{ color: "#ff6b6b" }} />,
      onOk: async () => {
        try {
          await deleteHaiku(haiku.id);
          message.success("Haiku deleted");
          onDeleted?.();
        } catch (e) {
          if (axios.isAxiosError(e) && e.response?.status === 403) {
            message.error("You are not allowed to delete this haiku.");
          } else {
            message.error("Could not delete haiku.");
          }
          throw e;
        }
      },
    });
  };

  return (
    <article className={styles.root}>
      <div className={styles.actions}>
        <Tooltip title="Share">
          <Button
            type="text"
            size="small"
            icon={<ShareAltOutlined />}
            aria-label="Share haiku"
            onClick={() => setShareOpen(true)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label="Delete haiku"
            onClick={openDeleteConfirm}
          />
        </Tooltip>
      </div>
      <div className={styles.titleRow}>{formatHaikuTitle(haiku)}</div>
      <div className={styles.meta}>{formatCreatedAt(haiku.createdAt)}</div>
      <div className={styles.body}>{haiku.body}</div>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </article>
  );
}
