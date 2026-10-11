import type { ReactNode } from "react";
import styles from "../ComicToast.module.css";

/** Plain-text toasts longer than this wrap instead of staying on one line. */
const SINGLE_LINE_MAX_CHARS = 52;

export function toastItemClassName(exiting: boolean, entered: boolean): string {
  const motionClass = exiting ? styles.itemExit : entered ? styles.itemEnter : "";
  return [styles.item, motionClass].filter(Boolean).join(" ");
}

export function toastContentClassName(content: ReactNode): string {
  const contentText = typeof content === "string" ? content : "";
  const wrapContent = contentText.length > SINGLE_LINE_MAX_CHARS;
  return [styles.toastContent, wrapContent && styles.toastContentWrap].filter(Boolean).join(" ");
}
