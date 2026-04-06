"use client";

import { Modal, Radio, Typography } from "antd";
import { useState } from "react";

export type ShareMethod = "link" | "email";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShareModal({ open, onClose }: ShareModalProps) {
  const [method, setMethod] = useState<ShareMethod>("link");

  return (
    <Modal
      title="Share haiku"
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: "none" } }}
      destroyOnHidden
      afterOpenChange={(nextOpen) => {
        if (nextOpen) setMethod("link");
      }}
    >
      <Radio.Group
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        options={[
          { value: "link" as const, label: "Create a share link" },
          { value: "email" as const, label: "Share via mail" },
        ]}
      />
      <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
        Sharing is not wired up yet — this dialog is a placeholder.
      </Typography.Paragraph>
    </Modal>
  );
}
