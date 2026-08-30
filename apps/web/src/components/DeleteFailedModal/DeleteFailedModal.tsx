"use client";

import { Button, Modal, Typography } from "@/components/StyledComponents";
import styles from "./DeleteFailedModal.module.css";

export type DeleteFailedModalProps = {
  open: boolean;
  retrying?: boolean;
  onRetry: () => void;
  onLeaveItBe: () => void;
};

export function DeleteFailedModal({
  open,
  retrying = false,
  onRetry,
  onLeaveItBe,
}: DeleteFailedModalProps) {
  return (
    <Modal
      open={open}
      title="Deletion failed"
      onCancel={onLeaveItBe}
      footer={
        <div className={styles.footer}>
          <Button onClick={onLeaveItBe} disabled={retrying}>
            Leave it be
          </Button>
          <Button type="primary" danger loading={retrying} onClick={onRetry}>
            Retry
          </Button>
        </div>
      }
      destroyOnHidden
      className={styles.modal}
    >
      <Typography.Paragraph type="secondary" className={styles.body}>
        We couldn&apos;t delete this haiku. You can try again, or leave it in your list.
      </Typography.Paragraph>
    </Modal>
  );
}
