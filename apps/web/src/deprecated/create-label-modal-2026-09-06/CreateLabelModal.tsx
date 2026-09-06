"use client";

import { Button, Input, Modal, Tooltip } from "@/components/StyledComponents";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { LabelDto } from "@/api/labels";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { Label } from "../label-tag-2026-09-06/Label";
import { getRandomLabelColor } from "@/utils/colors";
import styles from "./styles.module.css";

export type CreateLabelModalProps = {
  open: boolean;
  accountId: string;
  label?: LabelDto;
  onClose: () => void;
  onCreated?: (label: LabelDto) => void;
  onUpdated?: (label: LabelDto) => void;
};

export function CreateLabelModal({
  open,
  accountId,
  label,
  onClose,
  onCreated,
  onUpdated,
}: CreateLabelModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(getRandomLabelColor);
  const { labels, isLoading, createLabel, updateLabel, isCreating, isUpdating } = useAccountLabels({
    accountId,
    autofetch: open,
  });

  const trimmedName = name.trim();
  const isShort = trimmedName.length > 0 && trimmedName.length < 3;
  const exists = labels.some(
    (l) =>
      l.name.toLowerCase() === trimmedName.toLowerCase() &&
      (!label || l.id !== label.id),
  );
  const disabledReason = isLoading
    ? "Loading labels..."
    : trimmedName.length === 0
      ? "Enter a label name"
      : isShort
        ? "Name should be at least 3 characters"
        : exists
          ? "Label already exists in this account"
          : null;

  const submit = () => {
    if (disabledReason) return;
    if (label) {
      void updateLabel({
        labelId: label.id,
        name: trimmedName,
        color,
        shape: "classic",
        onSuccess: async (updated) => {
          comicToast.success("Label updated");
          onUpdated?.(updated);
          onClose();
        },
        onError: async () => {
          comicToast.error("Could not update label");
        },
      });
      return;
    }
    void createLabel({
      name: trimmedName,
      color,
      shape: "classic",
      onSuccess: async (created) => {
        comicToast.success("Label created");
        onCreated?.(created);
        setName("");
        setColor(getRandomLabelColor());
        onClose();
      },
      onError: async () => {
        comicToast.error("Could not create label");
      },
    });
  };

  return (
    <Modal
        title={label ? "Edit label" : "Create label"}
        open={open}
        onCancel={onClose}
        footer={[
          <div key="footer-row" className={styles.footerRow}>
            <Button key="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Tooltip key="save-tooltip" title={disabledReason ?? ""}>
              <span>
                <Button
                  key="save"
                  type="primary"
                  onClick={submit}
                  disabled={Boolean(disabledReason)}
                  loading={isCreating || isUpdating}
                >
                  Save
                </Button>
              </span>
            </Tooltip>
          </div>,
        ]}
        afterOpenChange={(nextOpen) => {
          if (nextOpen) {
            setName(label?.name ?? "");
            setColor(label?.color ?? getRandomLabelColor());
          }
        }}
        destroyOnHidden
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={64}
        />
        <div className={styles.pickerWrap}>
          <HexColorPicker color={color} onChange={setColor} style={{ width: "100%" }}/>
        </div>
        <div className={styles.previewWrap}>
          {trimmedName.length < 3 ? (
            <div className={styles.validationText}>Name should be at least 3 characters</div>
          ) : (
            <Label name={trimmedName} color={color} />
          )}
        </div>
      </Modal>
  );
}
