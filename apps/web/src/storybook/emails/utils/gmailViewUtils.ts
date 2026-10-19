import type { CSSProperties } from "react";
import { GMAIL_MOBILE_WIDTH_PX } from "../consts/gmailPreviewConsts";
import type { GmailViewport } from "../GmailMessageView.types";
import styles from "../GmailMessageView.module.css";

export function gmailRootClassName(viewport: GmailViewport): string {
  return [styles.root, viewport === "mobile" ? styles.mobile : styles.desktop].join(" ");
}

export function gmailRootStyle(viewport: GmailViewport): CSSProperties | undefined {
  return viewport === "mobile" ? { width: GMAIL_MOBILE_WIDTH_PX } : undefined;
}
