"use client";

import { useRef } from "react";
import { Select, Typography } from "@/components/StyledComponents";
import { POSTCARD_MESSAGE_MAX_CHARS } from "@/components/Postcard/consts/postcardMessageConsts";
import { clampPostcardMessage } from "@/components/Postcard/utils/postcardMessageFit";
import { usePostcardMessageFit } from "@/hooks/usePostcardMessageFit";
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
  const fit = usePostcardMessageFit(message);

  const handleMessageChange = (raw: string) => {
    const next = clampPostcardMessage(raw);
    const growing = next.length > message.length;
    if (growing && !fit.accepts(next)) return;
    onMessageChange(next);
  };

  return (
    <div className={styles.root}>
      <div
        ref={notebookRef}
        className={styles.notebook}
        style={notebookStyleVars()}
      >
        <NotebookPageRough hostRef={notebookRef} className={styles.paperArt} />
        <div className={styles.toRow} data-notebook-row="to">
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
        <div className={styles.lineSpacer} data-notebook-row="spacer" aria-hidden />
        <textarea
          className={styles.message}
          data-notebook-row="message"
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder="I wanted to share with you..."
          maxLength={POSTCARD_MESSAGE_MAX_CHARS}
          disabled={disabled}
          aria-label="Email message"
          aria-describedby="postcard-message-fit"
        />
      </div>
      <Typography.Text
        id="postcard-message-fit"
        type={fit.linesLeft === 0 ? "warning" : "secondary"}
        className={styles.fitHint}
        aria-live="polite"
      >
      </Typography.Text>
      {invalidEmails.length > 0 ? (
        <Typography.Text type="danger" className={styles.validation}>
          Invalid emails: {invalidEmails.join(", ")}
        </Typography.Text>
      ) : null}
    </div>
  );
};
