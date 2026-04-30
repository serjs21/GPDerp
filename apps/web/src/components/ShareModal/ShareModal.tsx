"use client";

import { Button, Modal, Radio, Tooltip, Typography } from "@/components/StyledComponents";
import type { RadioChangeEvent } from "antd/es/radio";
import { CopyText } from "../CopyText/CopyText";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareLinkContent } from "./ShareLinkContent";
import styles from "./ShareModal.module.css";
import type { LinkPolicy, ShareMethod } from "./types";
import { useShareModalController } from "./useShareModalController";

export type { LinkPolicy, ShareMethod } from "./types";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  haikuId: string;
  /** When the modal opens, start in the “link created” view (for Storybook). */
  initialCreatedUrl?: string | null;
  /** When the modal opens, pre-select a share method (for Storybook). */
  initialMethod?: ShareMethod;
  /** When the modal opens, pre-select link policy (for Storybook). */
  initialLinkPolicy?: LinkPolicy;
};

type ShareModalFooterProps = {
  createdUrl: string | null;
  emailSent: boolean;
  onClose: () => void;
  method: ShareMethod;
  linkCtaHint: string;
  emailCtaHint: string;
  creating: boolean;
  sendingEmail: boolean;
  canCreateLink: boolean;
  canSendEmail: boolean;
  onCreateLink: () => void;
  onSendEmail: () => void;
};

function ShareModalFooter({
  createdUrl,
  emailSent,
  onClose,
  method,
  linkCtaHint,
  emailCtaHint,
  creating,
  sendingEmail,
  canCreateLink,
  canSendEmail,
  onCreateLink,
  onSendEmail,
}: ShareModalFooterProps) {
  if (createdUrl != null || emailSent) {
    return (
      <Button type="primary" onClick={onClose}>
        Done
      </Button>
    );
  }

  return (
    <div className={styles.footerBtns}>
      <Button onClick={onClose}>Close</Button>
      <Tooltip title={method === "link" ? linkCtaHint : emailCtaHint}>
        <span>
          <Button
            type="primary"
            loading={method === "link" ? creating : sendingEmail}
            disabled={method === "link" ? !canCreateLink : !canSendEmail}
            onClick={method === "link" ? onCreateLink : onSendEmail}
          >
            {method === "email" ? "Send" : "Create link"}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}

export function ShareModal({
  open,
  onClose,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
}: ShareModalProps) {
  const {
    method,
    setMethod,
    linkPolicy,
    setLinkPolicy,
    expiresAt,
    setExpiresAt,
    maxViews,
    setMaxViews,
    createdUrl,
    setCreatedUrl,
    creating,
    emailMessage,
    setEmailMessage,
    emailRecipients,
    setEmailRecipients,
    sendingEmail,
    emailSent,
    invalidEmails,
    canSendEmail,
    canCreateLink,
    linkCtaHint,
    emailCtaHint,
    onCreateLink,
    onSendEmail,
  } = useShareModalController({
    open,
    haikuId,
    initialCreatedUrl,
    initialMethod,
    initialLinkPolicy,
  });

  const onMethodChange = (e: RadioChangeEvent) => {
    setMethod(e.target.value);
    setCreatedUrl(null);
  };

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedUrl(null);
  };

  return (
    <Modal
      title={createdUrl ? "Your share link" : "Share haiku"}
      open={open}
      onCancel={onClose}
      footer={
        <ShareModalFooter
          createdUrl={createdUrl}
          emailSent={emailSent}
          onClose={onClose}
          method={method}
          linkCtaHint={linkCtaHint}
          emailCtaHint={emailCtaHint}
          creating={creating}
          sendingEmail={sendingEmail}
          canCreateLink={canCreateLink}
          canSendEmail={canSendEmail}
          onCreateLink={() => void onCreateLink()}
          onSendEmail={() => void onSendEmail()}
        />
      }
      closable={false}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      classNames={{ body: styles.modalBody, footer: styles.modalFooter }}
    >
      {createdUrl != null ? (
        <CopyText text={createdUrl} mode="link" />
      ) : emailSent ? (
        <Typography.Paragraph className={styles.success}>
          Your haikus have been sent.
        </Typography.Paragraph>
      ) : (
        <>
          <Radio.Group
            value={method}
            onChange={onMethodChange}
            options={[
              { value: "link" as const, label: "Share by link" },
              { value: "email" as const, label: "Share via mail" },
            ]}
          />

          {method === "link" ? (
            <ShareLinkContent
              linkPolicy={linkPolicy}
              onLinkPolicyChange={onLinkPolicyChange}
              expiresAt={expiresAt}
              onExpiresAtChange={setExpiresAt}
              maxViews={maxViews}
              onMaxViewsChange={(v) => setMaxViews(typeof v === "number" ? v : null)}
            />
          ) : (
            <SendShareEmailContent
              message={emailMessage}
              emails={emailRecipients}
              invalidEmails={invalidEmails}
              onMessageChange={setEmailMessage}
              onEmailsChange={setEmailRecipients}
              disabled={sendingEmail}
            />
          )}
        </>
      )}
    </Modal>
  );
}
