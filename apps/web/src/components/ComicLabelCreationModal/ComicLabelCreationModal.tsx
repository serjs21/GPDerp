"use client";

import { useTranslations } from "next-intl";
import type { LabelDto } from "@/api/labels";
import { ComicPageDialog, ComicPageRow } from "@/components/ComicPageLayout";
import { withDefaults } from "@/utils/props/withDefaults";
import { resolveComicLabelShapePreset } from "./comicLabelShapes";
import { LabelColorPanel } from "./LabelColorPanel";
import { LabelPreviewPanel } from "./LabelPreviewPanel";
import { LabelSaveButton } from "./LabelSaveButton";
import { LabelShapeGrid } from "./LabelShapeGrid";
import { useLabelDraft } from "./useLabelDraft";
import { useLabelSave } from "./useLabelSave";
import { labelSaveBlockReason } from "./utils/labelValidationUtils";
import styles from "./ComicLabelCreationModal.module.css";

export type ComicLabelCreationModalProps = {
  open: boolean;
  accountId: string;
  label?: LabelDto;
  onClose: () => void;
  onCreated?: (label: LabelDto) => void;
  onUpdated?: (label: LabelDto) => void;
  /**
   * When true, render the form body only (no outer ComicPageDialog).
   * Parent controls visibility with `open` and owns the dialog shell.
   */
  embedded?: boolean;
  className?: string;
};

const COMIC_LABEL_CREATION_MODAL_DEFAULTS = { embedded: false };

export function ComicLabelCreationModal(props: ComicLabelCreationModalProps) {
  const { open, embedded } = withDefaults(props, COMIC_LABEL_CREATION_MODAL_DEFAULTS);
  const { label, onClose } = props;
  const t = useTranslations("ComicLabelCreationModal");
  const draft = useLabelDraft(open, label);
  const { labels, isLoading, busy, save } = useLabelSave({
    open,
    embedded,
    accountId: props.accountId,
    label,
    onClose,
    onCreated: props.onCreated,
    onUpdated: props.onUpdated,
    onCreateReset: draft.resetForNextLabel,
  });
  const blockReason = labelSaveBlockReason(t, {
    isLoading,
    trimmedName: draft.trimmedName,
    labels,
    editing: label,
  });

  const body = (
    <div className={[styles.body, embedded && styles.bodyEmbedded, props.className].filter(Boolean).join(" ")}>
      <ComicPageRow columns="2fr-1fr" className={styles.topRow}>
        <LabelPreviewPanel
          name={draft.name}
          trimmedName={draft.trimmedName}
          color={draft.color}
          shape={resolveComicLabelShapePreset(draft.shapeId)}
          nameInputRef={draft.nameInputRef}
          onNameChange={draft.setName}
        />
        <LabelColorPanel
          color={draft.color}
          onColorChange={draft.setColor}
          pickerOpen={draft.pickerOpen}
          onPickerOpenChange={draft.setPickerOpen}
        />
      </ComicPageRow>
      <LabelShapeGrid shapeId={draft.shapeId} color={draft.color} onShapeChange={draft.setShapeId} />
      <LabelSaveButton
        mode={label ? "edit" : "create"}
        color={draft.color}
        blockReason={blockReason}
        busy={busy}
        onSave={() => save({ name: draft.trimmedName, color: draft.color, shape: draft.shapeId })}
      />
    </div>
  );

  if (embedded) return open ? body : null;

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {body}
    </ComicPageDialog>
  );
}
