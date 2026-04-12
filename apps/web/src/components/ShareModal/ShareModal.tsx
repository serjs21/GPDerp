"use client";

import { Button, message, Modal, Radio, Tooltip, Typography } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import type { Dayjs } from "dayjs";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { createShareLink, shareHaikuByEmail } from "@/api/shareLinks";
import { CopyText } from "../CopyText/CopyText";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareLinkContent } from "./ShareLinkContent";
import styles from "./ShareModal.module.css";
import type { LinkPolicy, ShareMethod } from "./types";

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

export function ShareModal({
  open,
  onClose,
  haikuId,
  initialCreatedUrl = null,
  initialMethod = "link",
  initialLinkPolicy = "permanent",
}: ShareModalProps) {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const [method, setMethod] = useState<ShareMethod>("link");
  const [linkPolicy, setLinkPolicy] = useState<LinkPolicy>("permanent");
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [maxViews, setMaxViews] = useState<number | null>(3);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod(initialMethod);
    setLinkPolicy(initialLinkPolicy);
    setExpiresAt(null);
    setMaxViews(3);
    setCreatedUrl(initialCreatedUrl ?? null);
    setEmailMessage("");
    setEmailRecipients([]);
    setSendingEmail(false);
    setEmailSent(false);
  }, [open, initialCreatedUrl, initialMethod, initialLinkPolicy]);

  useEffect(() => {
    if (linkPolicy === "limited") {
      setMaxViews((v) => (v != null && v >= 1 ? v : 3));
    }
  }, [linkPolicy]);

  const canCreateLink =
    linkPolicy === "permanent" ||
    (linkPolicy === "expires" && expiresAt != null && expiresAt.isAfter(dayjs())) ||
    (linkPolicy === "limited" && maxViews != null && maxViews >= 1);
  const normalizedEmails = [...new Set(emailRecipients.map((v) => v.trim().toLowerCase()))].filter(Boolean);
  const invalidEmails = normalizedEmails.filter((email) => !EMAIL_REGEX.test(email));
  const canSendEmail = normalizedEmails.length > 0 && invalidEmails.length === 0;
  const linkCtaHint =
    canCreateLink || creating
      ? ""
      : linkPolicy === "expires"
        ? "Pick a future expiration date"
        : linkPolicy === "limited"
          ? "Max views should be at least 1"
          : "Invalid share link settings";
  const emailCtaHint =
    canSendEmail || sendingEmail
      ? ""
      : normalizedEmails.length === 0
        ? "Add at least one recipient email"
        : "Fix invalid recipient emails";

  const onCreateLink = async () => {
    if (!canCreateLink) return;
    setCreating(true);
    try {
      const body =
        linkPolicy === "permanent"
          ? { haikuId, expirationDate: null, maxViews: null }
          : linkPolicy === "expires"
            ? {
                haikuId,
                expirationDate: expiresAt!.toISOString(),
                maxViews: null,
              }
            : {
                haikuId,
                expirationDate: null,
                maxViews: maxViews!,
              };
      const data = await createShareLink(body);
      setCreatedUrl(data.shareUrl);
      message.success("Share link created");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { error?: string } | undefined)?.error;
        message.error(typeof msg === "string" ? msg : "Could not create share link");
      } else {
        message.error("Could not create share link");
      }
    } finally {
      setCreating(false);
    }
  };

  const onSendEmail = async () => {
    if (!canSendEmail) return;
    setSendingEmail(true);
    try {
      const sentCount = await shareHaikuByEmail({
        haikuId,
        emails: normalizedEmails,
        message: emailMessage.trim(),
      });
      setEmailSent(true);
      message.success(
        sentCount === 1 ? "Your haiku has been sent" : `Your haikus have been sent (${sentCount})`,
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { error?: string } | undefined)?.error;
        message.error(typeof msg === "string" ? msg : "Could not send email");
      } else {
        message.error("Could not send email");
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const onMethodChange = (e: RadioChangeEvent) => {
    setMethod(e.target.value);
    setCreatedUrl(null);
  };

  const onLinkPolicyChange = (e: RadioChangeEvent) => {
    setLinkPolicy(e.target.value);
    setCreatedUrl(null);
  };

  const footer =
    createdUrl != null || emailSent ? (
      <Button type="primary" onClick={onClose}>
        Done
      </Button>
    ) : (
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

  return (
    <Modal
      title={createdUrl ? "Your share link" : "Share haiku"}
      open={open}
      onCancel={onClose}
      footer={footer}
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
