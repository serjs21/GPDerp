import type { RestartCharLineProps } from "./RestartLinkButton.types";
import { displayChar } from "./utils/restartLinkButtonUtils";
import styles from "./RestartLinkButton.module.css";

/** Label split into per-character spans so the hover animation can stagger them. */
export function RestartCharLine({ text, className, lineRef }: RestartCharLineProps) {
  return (
    <span ref={lineRef} className={className} aria-hidden>
      {Array.from(text).map((ch, index) => (
        <span key={`${ch}-${String(index)}`} className={styles.char} data-restart-char>
          {displayChar(ch)}
        </span>
      ))}
    </span>
  );
}
