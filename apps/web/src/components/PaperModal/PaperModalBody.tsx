"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { PaperModalBodyProps } from "./PaperModalBody.types";
import { PaperModalHeader } from "./PaperModalHeader";
import styles from "./PaperModal.module.css";

/** Header, accessible description (hidden placeholder when absent), content, and footer. */
export function PaperModalBody({ title, description, showClose, children, footer }: PaperModalBodyProps) {
  return (
    <div className={styles.body}>
      <PaperModalHeader title={title} showClose={showClose} />

      {description ? (
        <Dialog.Description className={styles.description}>{description}</Dialog.Description>
      ) : (
        <Dialog.Description className={styles.visuallyHidden}> </Dialog.Description>
      )}

      {children ? <div className={styles.children}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
