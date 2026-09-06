"use client";

import { CopyOutlined, DeleteOutlined, ShareAltOutlined, TagOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "@/components/StyledComponents";
import axios from "axios";
import { useCallback, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SakuraPetalLoader } from "@/components/Loaders";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { ShareModal } from "@/components/ShareModal/ShareModal";
import { useCopy } from "@/hooks/useCopy";
import styles from "./HaikuActions.module.css";
import { formatHaikuPlainToText, formatHaikuTitle } from "@/utils/strings";

export type HaikuActionsProps =
  | { variant: "generating" }
  | {
      variant: "saved";
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
      /** When set, confirm delegates delete to this handler (animation + API orchestration). */
      onDelete?: () => Promise<void>;
    };

export const HaikuActions = (props: HaikuActionsProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { copy } = useCopy();

  const haiku = props.variant === "saved" ? props.haiku : null;
  const onDeleted = props.variant === "saved" ? props.onDeleted : undefined;
  const onDelete = props.variant === "saved" ? props.onDelete : undefined;

  const handleDeleteConfirm = useCallback(async () => {
    if (!haiku) return;
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
        setDeleteOpen(false);
        return;
      }
      await deleteHaiku(haiku.id);
      comicToast.success("Haiku deleted");
      onDeleted?.();
      setDeleteOpen(false);
    } catch (e) {
      if (onDelete) {
        setDeleteOpen(false);
        return;
      }
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        comicToast.error("You are not allowed to delete this haiku.");
      } else {
        comicToast.error("Could not delete haiku.");
      }
    } finally {
      setDeleting(false);
    }
  }, [haiku, onDelete, onDeleted]);

  if (props.variant === "generating") {
    return (
      <Tooltip title="Saving this haiku…">
        <span className={styles.loaderWrap}>
          <SakuraPetalLoader compact />
        </span>
      </Tooltip>
    );
  }

  const { haiku: savedHaiku, onChanged } = props;

  return (
    <>
      <Tooltip title="Delete">
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          aria-label="Delete haiku"
          onClick={() => setDeleteOpen(true)}
        />
      </Tooltip>
    <Tooltip title="Copy to clipboard">
      <Button
        type="text"
        size="small"
        className={styles.copyButton}
        icon={<CopyOutlined />}
        aria-label="Copy to clipboard"
        onClick={() => void copy(formatHaikuPlainToText(savedHaiku))}
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
      <ShareModal
        haikuId={savedHaiku.id}
        haikuSubject={formatHaikuTitle(savedHaiku)}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
      <CreateAddLabelsModal
        open={labelsOpen}
        haiku={savedHaiku}
        initialTab="add"
        onClose={() => setLabelsOpen(false)}
        onSaved={onChanged}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        confirming={deleting}
      />
    </>
  );
};
