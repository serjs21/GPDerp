"use client";

import { DeleteOutlined, ShareAltOutlined, TagOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, message, Tooltip } from "antd";
import axios from "axios";
import { motion } from "motion/react";
import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import { ManageLabelsModal } from "@/components/ManageLabelsModal/ManageLabelsModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { useConfirm } from "@/hooks/useConfirm";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./HaikuContainer.module.css";

export type HaikuContainerProps =
  | {
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
      generatingDraft?: undefined;
    }
  | {
      generatingDraft: GeneratingDraft;
      haiku?: undefined;
      onDeleted?: undefined;
      onChanged?: undefined;
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

export function HaikuContainer(props: HaikuContainerProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const { openConfirm } = useConfirm();

  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <motion.article
        className={styles.root}
        initial={{ opacity: 0, x: -100, y: -20, minHeight: 0, height: 0 }}
        animate={{ opacity: 1, x: 0, y: 0, minHeight: "185px", height: "fit-content" }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.actions}>
          <Tooltip title="Add label">
            <Button
              type="text"
              size="small"
              disabled
              icon={<TagOutlined />}
              aria-label="Add label (disabled while generating)"
            />
          </Tooltip>
          <Tooltip title="Share">
            <Button
              type="text"
              size="small"
              icon={<ShareAltOutlined />}
              aria-label="Share haiku"
              onClick={() => setShareOpen(true)}
            />
          </Tooltip>
          <Tooltip title="Available after the haiku is saved">
            <Button
              type="text"
              size="small"
              danger
              disabled
              icon={<DeleteOutlined />}
              aria-label="Delete haiku (disabled while generating)"
            />
          </Tooltip>
        </div>
        <div className={styles.titleRow}>{subject}</div>
        <div className={styles.meta}>{createdAtLabel}</div>
        <div className={styles.body}>{content}</div>
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      </motion.article>
    );
  }

  const { haiku, onDeleted, onChanged } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
  };

  const openDeleteConfirm = () => {
    openConfirm({
      title: "Delete this haiku?",
      content: "This action cannot be undone.",
      okText: "Delete",
      danger: true,
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
      }
    });
  };

  return (
    <article className={styles.root}>
      <div className={styles.actions}>
        <Tooltip title="Add label">
          <Button
            type="text"
            size="small"
            icon={<TagOutlined />}
            aria-label="Add label"
            onClick={() => setLabelsOpen(true)}
          />
        </Tooltip>
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
      <div className={styles.labels}>
        {haiku.labels.map((label) => (
          <Label key={label.id} name={label.name} color={label.color || "default"} />
        ))}
      </div>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <ManageLabelsModal
        open={labelsOpen}
        haiku={haiku}
        onClose={() => setLabelsOpen(false)}
        onSaved={onChanged}
      />
    </article>
  );
}
