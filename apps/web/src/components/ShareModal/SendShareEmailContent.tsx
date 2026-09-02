"use client";

import { useRef } from "react";
import { Select, Typography } from "@/components/StyledComponents";
import { NotebookPageRough } from "./NotebookPageRough";
import {
  notebookStyleVars,
} from "./notebookTokens";
import styles from "./SendShareEmailContent.module.css";

type SendShareEmailContentProps = {
  message: string;
  emails: string[];
  invalidEmails: string[];
  onMessageChange: (value: string) => void;
  onEmailsChange: (value: string[]) => void;
  disabled?: boolean;
};

export const SendShareEmailContent = ({
  message,
  emails,
  invalidEmails,
  onMessageChange,
  onEmailsChange,
  disabled = false,
}: SendShareEmailContentProps) => {
  const notebookRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.root}>
      <div
        ref={notebookRef}
        className={styles.notebook}
        style={notebookStyleVars()}
      >
        <NotebookPageRough hostRef={notebookRef} className={styles.paperArt} />
        <div className={styles.toRow}>
          <span className={styles.toPrefix} aria-hidden>
            TO:
          </span>
          <Select
            mode="tags"
            variant="borderless"
            value={emails}
            onChange={onEmailsChange}
            tokenSeparators={[",", " "]}
            placeholder="Recipient emails (press Enter after each)"
            className={styles.toInput}
            disabled={disabled}
            autoFocus
          />
        </div>
        <textarea
          className={styles.message}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="I wanted to share with you..."
          maxLength={250}
          disabled={disabled}
          aria-label="Email message"
        />
      </div>
      {invalidEmails.length > 0 ? (
        <Typography.Text type="danger" className={styles.validation}>
          Invalid emails: {invalidEmails.join(", ")}
        </Typography.Text>
      ) : null}
    </div>
  );
};
