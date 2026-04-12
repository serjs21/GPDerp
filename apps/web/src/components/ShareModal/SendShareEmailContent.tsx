"use client";

import { Input, Select, Typography } from "antd";
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
}: SendShareEmailContentProps) => (
  <div className={styles.root}>
    <Typography.Paragraph type="secondary" className={styles.help}>
      Add a personal note and one or more recipients.
    </Typography.Paragraph>
    <Select
      mode="tags"
      value={emails}
      onChange={onEmailsChange}
      tokenSeparators={[",", " "]}
      placeholder="Recipient emails (press Enter after each)"
      className={styles.emailSelect}
      disabled={disabled}
      autoFocus
    />
    {invalidEmails.length > 0 ? (
      <Typography.Text type="danger" className={styles.validation}>
        Invalid emails: {invalidEmails.join(", ")}
      </Typography.Text>
    ) : null}
    <Input.TextArea
      value={message}
      onChange={(e) => onMessageChange(e.target.value)}
      placeholder="A poem from your future self..."
      rows={3}
      maxLength={250}
      disabled={disabled}
    />
  </div>
);
