"use client";

import type { PostcardMessageProps } from "./PostcardMessage.types";
import {
  POSTCARD_RECIPIENT_LINE_COUNT,
  POSTCARD_STAMP_SRC,
} from "./consts/postcardMessageConsts";
import { postcardRecipientLines } from "./utils/postcardMessageFit";
import { buildPostcardMessageRootStyle } from "./utils/postcardMessageStyleUtils";
import styles from "./PostcardMessage.module.css";

/** Static 1200×800 back side of the postcard (capture target, no interactivity). */
export function PostcardMessage({
  theme,
  message,
  senderName,
  recipients,
  className,
  ref,
}: PostcardMessageProps) {
  const lines = postcardRecipientLines(recipients);
  const addressLines = [
    ...lines,
    ...Array<string>(Math.max(0, POSTCARD_RECIPIENT_LINE_COUNT - lines.length)).fill(""),
  ];
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={rootClass}
      style={buildPostcardMessageRootStyle(theme.scene.sceneVars)}
      data-postcard-root=""
    >
      <div className={styles.card}>
        <div className={styles.left}>
          <p className={styles.message}>{message}</p>
          <p className={styles.signature}>
            <span className={styles.heart} aria-hidden>
              ♥
            </span>
            {`From: ${senderName}`}
          </p>
        </div>
        <div className={styles.divider} aria-hidden />
        <div className={styles.right}>
          {/* eslint-disable-next-line @next/next/no-img-element -- capture needs a plain same-origin img */}
          <img className={styles.stamp} src={POSTCARD_STAMP_SRC} alt="" draggable={false} />
          <div className={styles.address}>
            <span className={styles.toLabel}>To:</span>
            {addressLines.map((line, index) => (
              <p key={index} className={styles.addressLine}>
                {line || "\u00A0"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
