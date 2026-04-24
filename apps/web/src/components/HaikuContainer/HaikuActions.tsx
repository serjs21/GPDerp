"use client";

import { CopyOutlined, DeleteOutlined, ShareAltOutlined, TagOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, message, Tooltip } from "@/components/StyledComponents";
import axios from "axios";
import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { SakuraPetalLoader } from "@/components/Loaders";
import { ManageLabelsModal } from "@/components/ManageLabelsModal/ManageLabelsModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { useConfirm } from "@/hooks/useConfirm";
import { useCopy } from "@/hooks/useCopy"; 
import styles from "./HaikuActions.module.css";
import { formatHaikuPlainToText } from "@/utils/strings";

export type HaikuActionsProps =
  | { variant: "generating" }
  | {
      variant: "saved";
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
    };

export const HaikuActions = (props: HaikuActionsProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const { openConfirm } = useConfirm();
  const { copy } = useCopy();

  if (props.variant === "generating") {
    return (
        <Tooltip title="Saving this haiku…">
          <span className={styles.loaderWrap}>
            <SakuraPetalLoader compact />
          </span>
        </Tooltip>
    );
  }

  const { haiku, onDeleted, onChanged } = props;

  const openDeleteConfirm = () => {
    openConfirm({
      title: "Delete this haiku?",
      content: "This action cannot be undone.",
      okText: "Delete",
      danger: true,
      cancelText: "Cancel",
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
    <>
    <Tooltip title="Copy to clipboard">
      <Button
        type="text"
        size="small"
        className={styles.copyButton}
        icon={<CopyOutlined />}
        aria-label="Copy to clipboard"
        onClick={() => void copy(formatHaikuPlainToText(haiku))}
      />
      </Tooltip>
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
      <ShareModal haikuId={haiku.id} open={shareOpen} onClose={() => setShareOpen(false)} />
      <ManageLabelsModal
        open={labelsOpen}
        haiku={haiku}
        onClose={() => setLabelsOpen(false)}
        onSaved={onChanged}
      />
    </>
  );
};
