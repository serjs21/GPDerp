import type { GmailPlainTextBodyProps } from "./GmailPlainTextBody.types";
import { linkifyPlainText } from "./utils/gmailFrameUtils";
import styles from "./GmailMessageView.module.css";

/** The text/plain alternative, shown the way Gmail renders plain mail (wrapped, links auto-linked). */
export function GmailPlainTextBody({ text }: GmailPlainTextBodyProps) {
  return (
    <div className={styles.plainText}>
      {linkifyPlainText(text).map((part, index) =>
        part.kind === "link" ? (
          <a key={index} href={part.value} target="_blank" rel="noreferrer">
            {part.value}
          </a>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </div>
  );
}
