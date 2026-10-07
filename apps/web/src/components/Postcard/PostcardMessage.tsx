"use client";

import type { PostcardMessageProps } from "./PostcardMessage.types";
import {
  POSTCARD_ADDRESS_LINE_COUNT,
  POSTCARD_ADDRESSEE,
  POSTCARD_STAMP_SRC,
} from "./consts/postcardMessageConsts";
import { buildPostcardMessageRootStyle } from "./utils/postcardMessageStyleUtils";
import styles from "./PostcardMessage.module.css";

/** Static full-bleed 1200×800 back side of the postcard (capture target, no interactivity). */
export function PostcardMessage({
  message,
  senderName,
  className,
  ref,
}: PostcardMessageProps) {
  const addressLines = Array.from({ length: POSTCARD_ADDRESS_LINE_COUNT }, (_, index) =>
    index === 0 ? POSTCARD_ADDRESSEE : "",
  );
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={rootClass} style={buildPostcardMessageRootStyle()} data-postcard-root="">
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
  );
}
