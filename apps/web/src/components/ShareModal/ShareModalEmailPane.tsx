"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareEmailSendPanel } from "./ShareEmailSendPanel";
import type { ShareModalEmailPaneProps } from "./ShareModalEmailPane.types";
import styles from "./ShareModal.module.css";

/** Email tab: notebook postcard composer + send button row. */
export function ShareModalEmailPane({ content, send }: ShareModalEmailPaneProps) {
  return (
    <div className={styles.pane} data-active>
      <div className={styles.contentSlot}>
        <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
          <SendShareEmailContent {...content} />
        </ComicPagePanel>
      </div>
      <div className={styles.sendRow}>
        <ShareEmailSendPanel {...send} />
      </div>
    </div>
  );
}
