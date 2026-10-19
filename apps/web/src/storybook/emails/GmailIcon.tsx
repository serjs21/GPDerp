import { GMAIL_ICON_PATHS } from "./consts/gmailPreviewConsts";
import type { GmailIconProps } from "./GmailIcon.types";
import styles from "./GmailMessageView.module.css";

/** Decorative Gmail chrome icon in a round hover target. */
export function GmailIcon({ name }: GmailIconProps) {
  return (
    <span className={styles.iconButton} aria-hidden>
      <svg viewBox="0 0 24 24" className={styles.icon}>
        <path d={GMAIL_ICON_PATHS[name]} />
      </svg>
    </span>
  );
}
