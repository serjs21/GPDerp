import type { HeaderToolFaceProps } from "./HeaderToolFace.types";
import styles from "./HeaderToolButton.module.css";

/** One stacked face of a header tool button (icon, or hover name sliding in). */
export function HeaderToolFace({ hidden, enterFrom, children }: HeaderToolFaceProps) {
  const className = [
    styles.face,
    enterFrom === "left" ? styles.faceFromLeft : "",
    enterFrom === "right" ? styles.faceFromRight : "",
    hidden ? styles.faceHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} aria-hidden={hidden || undefined}>
      {children}
    </span>
  );
}
