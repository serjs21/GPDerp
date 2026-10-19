import { GMAIL_DATE_LABEL } from "./consts/gmailPreviewConsts";
import { GmailIcon } from "./GmailIcon";
import type { GmailMessageHeaderProps } from "./GmailMessageHeader.types";
import { avatarInitial, parseMailbox } from "./utils/gmailAddressUtils";
import styles from "./GmailMessageView.module.css";

/** Sender row: avatar, name <address>, "to me", reply-to, date and quick actions. */
export function GmailMessageHeader({ email, viewport }: GmailMessageHeaderProps) {
  const sender = parseMailbox(email.from);

  return (
    <div className={styles.sender}>
      <span className={styles.avatar} aria-hidden>
        {avatarInitial(sender.name)}
      </span>
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
