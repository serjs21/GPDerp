"use client";

import { useMemo } from "react";
import type { GmailBodyFrameProps } from "./GmailBodyFrame.types";
import { useIframeContentHeight } from "./useIframeContentHeight";
import { buildGmailFrameDoc } from "./utils/gmailFrameUtils";
import styles from "./GmailMessageView.module.css";

/** Email body isolated from app CSS (no scripts), sized to its content. */
export function GmailBodyFrame({ html, title }: GmailBodyFrameProps) {
  const srcDoc = useMemo(() => buildGmailFrameDoc(html), [html]);
  const { height, onLoad } = useIframeContentHeight(0);

  return (
    <iframe
      className={styles.frame}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ height }}
      onLoad={onLoad}
    />
  );
}
