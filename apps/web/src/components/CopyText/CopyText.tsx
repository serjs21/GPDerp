"use client";

import { CopyOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useCopy } from "@/hooks/useCopy";
import styles from "./CopyText.module.css";

export type CopyTextProps = {
  text: string;
  /** `"link"` — render as anchor opening in a new tab; `"text"` — non-interactive span. */
  mode: "link" | "text";
  className?: string;
};

export const CopyText = ({ text, mode, className }: CopyTextProps) => {
  const { copy } = useCopy();

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {mode === "link" ? (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.textBase} ${styles.link}`}
        >
          {text}
        </a>
      ) : (
        <span className={`${styles.textBase} ${styles.plain}`}>{text}</span>
      )}
      <Button
        type="text"
        className={styles.copyButton}
        icon={<CopyOutlined />}
        aria-label="Copy to clipboard"
        onClick={() => void copy(text)}
      />
    </div>
  );
};
