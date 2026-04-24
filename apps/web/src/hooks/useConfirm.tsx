"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/StyledComponents";

export type ConfirmOptions = {
  title: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  okType?: "primary" | "dashed" | "link" | "text" | "default";
  danger?: boolean;
  icon?: ReactNode;
  closable?: boolean;
  onOk: () => Promise<void> | void;
};

export function useConfirm() {
  const openConfirm = (options: ConfirmOptions) => {
    Modal.confirm({
      title: options.title,
      content: options.content,
      okText: options.okText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      okType: options.okType ?? "primary",
      okButtonProps: options.danger ? { danger: true } : undefined,
      icon: options.icon,
      closable: true,
      onOk: options.onOk,
    });
  };

  return { openConfirm };
}
