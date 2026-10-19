"use client";

import { useState } from "react";
import { GMAIL_BODY_TABS, GMAIL_TOOLBAR_ICONS } from "./consts/gmailPreviewConsts";
import { GmailBodyFrame } from "./GmailBodyFrame";
import { GmailIcon } from "./GmailIcon";
import { GmailMessageHeader } from "./GmailMessageHeader";
import type { GmailMessageViewProps } from "./GmailMessageView.types";
import { GmailPlainTextBody } from "./GmailPlainTextBody";
import { gmailRootClassName, gmailRootStyle } from "./utils/gmailViewUtils";
import styles from "./GmailMessageView.module.css";

/** Storybook-only replica of Gmail's open-message view (web layout, or the phone app width). */
export function GmailMessageView({ email, bodyHtml, viewport, defaultTab }: GmailMessageViewProps) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className={gmailRootClassName(viewport)} style={gmailRootStyle(viewport)}>
      <div className={styles.tabs} role="tablist" aria-label="Email part">
        {GMAIL_BODY_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={styles.tab}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.card}>
        <div className={styles.toolbar}>
          {GMAIL_TOOLBAR_ICONS.map((name) => (
            <GmailIcon key={name} name={name} />
          ))}
        </div>
        <h2 className={styles.subject}>
          {email.subject}
          <span className={styles.labelChip}>Inbox</span>
        </h2>
        <GmailMessageHeader email={email} viewport={viewport} />
        <div className={styles.body}>
          {tab === "html" ? (
            <GmailBodyFrame html={bodyHtml} title={email.subject} />
          ) : (
            <GmailPlainTextBody text={email.text} />
          )}
        </div>
      </div>
    </div>
  );
}
