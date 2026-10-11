import type { BurstOverlayProps } from "./BurstOverlay.types";
import styles from "./ComicBurstLabel.module.css";

/** Lettering over the silhouette: custom content, icon + lettering, or lettering alone. */
export function BurstOverlay({ text, textColor, leading, children }: BurstOverlayProps) {
  if (children) {
    return (
      <span className={styles.labelContent} aria-hidden>
        {children}
      </span>
    );
  }
  if (leading) {
    return (
      <span className={styles.labelWithLeading} style={{ color: textColor }} aria-hidden>
        <span className={styles.labelLeading}>{leading}</span>
        <span className={styles.labelLettering}>{text}</span>
      </span>
    );
  }
  return (
    <span className={styles.labelText} style={{ color: textColor }} aria-hidden>
      {text}
    </span>
  );
}
