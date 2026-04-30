"use client";

import { Modal, Select, Typography, message } from "@/components/StyledComponents";
import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { LabelCreateAction } from "@/components/LabelCreateAction/LabelCreateAction";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import styles from "./styles.module.css";

export type ManageLabelsModalProps = {
  open: boolean;
  haiku: HaikuDto;
  onClose: () => void;
  onSaved?: () => void;
  loadingOverride?: boolean;
};

export function ManageLabelsModal({
  open,
  haiku,
  onClose,
  onSaved,
  loadingOverride,
}: ManageLabelsModalProps) {
  const [api, contextHolder] = message.useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { labels: availableLabels, isLoading, fetch, setHaikuLabels, isSettingLabels } = useAccountLabels({
    accountId: haiku.accountId,
    autofetch: open,
  });

  const showLoading = loadingOverride ?? isLoading;

  const selectOptions = availableLabels.map((label) => ({
    label: label.name,
    value: label.id,
    color: label.color,
  }));

  const submit = () => {
    if (showLoading) {
      onClose();
      return;
    }
    void setHaikuLabels({
      haikuId: haiku.id,
      labelIds: selectedIds,
      onSuccess: async () => {
        api.success("Labels saved");
        onSaved?.();
        onClose();
        await fetch(true);
      },
      onError: async () => {
        api.error("Could not save labels");
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Manage labels"
        open={open}
        onCancel={onClose}
        onOk={submit}
        afterOpenChange={(nextOpen) => {
          if (nextOpen) setSelectedIds(haiku.labels.map((l) => l.id));
        }}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={isSettingLabels}
        destroyOnHidden
      >
        {showLoading ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : (
          <>
            {availableLabels.length > 0 ? (
              <>
                <Typography.Paragraph type="secondary" className={styles.sectionLabel}>
                  Select labels:
                </Typography.Paragraph>
                <Select
                  mode="multiple"
                  className={styles.select}
                  placeholder="Select labels"
                  options={selectOptions}
                  value={selectedIds}
                  onChange={(next) => setSelectedIds(next)}
                />
              </>
            ) : null}

            <LabelCreateAction
              accountId={haiku.accountId}
              className={styles.createBtn}
              buttonText="Create a new label"
              onCreated={async (label) => {
                setSelectedIds((ids) => [...new Set([...ids, label.id])]);
                await fetch(true);
              }}
            />
          </>
        )}
      </Modal>
    </>
  );
}
