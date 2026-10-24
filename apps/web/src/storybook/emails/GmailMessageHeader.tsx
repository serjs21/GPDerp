import { GMAIL_DATE_LABEL, GMAIL_SENDER_AVATAR_SRC } from "./consts/gmailPreviewConsts";
import { GmailIcon } from "./GmailIcon";
import type { GmailMessageHeaderProps } from "./GmailMessageHeader.types";
import { parseMailbox } from "./utils/gmailAddressUtils";
import styles from "./GmailMessageView.module.css";

/** Sender row: avatar, name <address>, "to me", reply-to, date and quick actions. */
export function GmailMessageHeader({ email, viewport }: GmailMessageHeaderProps) {
  const sender = parseMailbox(email.from);

  return (
    <div className={styles.sender}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public PNG in a Storybook-only preview */}
      <img className={styles.avatar} src={GMAIL_SENDER_AVATAR_SRC} alt="" width={40} height={40} aria-hidden />
      <div className={styles.senderText}>
        <div className={styles.senderLine}>
          <span className={styles.senderName}>{sender.name}</span>
          <span className={styles.senderAddress}>&lt;{sender.address}&gt;</span>
        </div>
        <div className={styles.recipientLine} title={email.to}>
          to me ▾{email.replyTo ? <span className={styles.replyTo}> · reply-to {email.replyTo}</span> : null}
        </div>
      </div>
      <div className={styles.senderMeta}>
        <span className={styles.date}>{GMAIL_DATE_LABEL[viewport]}</span>
        <GmailIcon name="star" />
        <GmailIcon name="reply" />
        <GmailIcon name="more" />
      </div>
    </div>
  );
}
